"""
Endpoint combinado de análisis facial.
Recibe una imagen, valida el usuario, guarda el archivo y corre la inferencia IA
en una sola llamada (lo que normalmente consumirá el frontend).
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AppUser
from app.services.inference_service import run_inference

router = APIRouter(prefix="/analysis", tags=["analysis"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads" / "face_captures"
ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 12 * 1024 * 1024


def _parse_user_id(user_id: str) -> int:
    uid = user_id.strip()
    if not uid.isdigit():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    n = int(uid)
    if n <= 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    return n


@router.post("/face-analyze")
async def analyze_face_image(
    user_id: str = Form(...),
    face_image: UploadFile = File(...),
    conf: float = Form(0.25),
    db: Session = Depends(get_db),
) -> dict:
    """Guarda la captura facial del usuario y devuelve las detecciones del modelo."""
    n = _parse_user_id(user_id)

    user_row = db.execute(select(AppUser).where(AppUser.id == n)).scalar_one_or_none()
    if user_row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if face_image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no soportado",
        )

    content = await face_image.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Archivo vacío")
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Imagen demasiado grande",
        )

    user_dir = UPLOAD_ROOT / str(n)
    user_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"capture_{ts}.jpg"
    dest = user_dir / filename
    dest.write_bytes(content)
    rel_path = f"face_captures/{n}/{filename}"

    try:
        detections = run_inference(content, conf=conf)
    except FileNotFoundError as e:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en inferencia: {e!s}",
        ) from e

    return {
        "ok": True,
        "user_id": str(n),
        "image": {
            "filename": filename,
            "path": rel_path,
        },
        "analysis": {
            "model_conf_threshold": conf,
            "total_detections": len(detections),
            "detections": detections,
        },
    }
