"""
Subida de capturas faciales para análisis (demo).
Guarda el archivo en disco bajo uploads/face_captures/<user_id>/.
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AppUser

router = APIRouter(prefix="/analysis", tags=["analysis"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads" / "face_captures"
MAX_BYTES = 12 * 1024 * 1024


def _parse_user_id(user_id: str) -> int:
    uid = user_id.strip()
    if not uid.isdigit():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    n = int(uid)
    if n <= 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    return n


@router.post("/face-image")
async def upload_face_image(
    user_id: str = Form(...),
    face_image: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    n = _parse_user_id(user_id)
    row = db.execute(select(AppUser).where(AppUser.id == n)).scalar_one_or_none()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    user_dir = UPLOAD_ROOT / str(n)
    user_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"capture_{ts}.jpg"
    dest = user_dir / filename

    content = await face_image.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Archivo vacío")
    if len(content) > MAX_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Imagen demasiado grande")

    dest.write_bytes(content)
    rel = f"face_captures/{n}/{filename}"
    return {
        "ok": True,
        "user_id": str(n),
        "path": rel,
        "filename": filename,
    }
