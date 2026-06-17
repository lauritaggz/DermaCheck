from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AppUser

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 12 * 1024 * 1024


def parse_user_id(user_id: str) -> int:
    uid = user_id.strip()
    if not uid.isdigit():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    parsed = int(uid)
    if parsed <= 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="user_id inválido")
    return parsed


def ensure_user_exists(db: Session, user_id: int) -> AppUser:
    user_row = db.execute(select(AppUser).where(AppUser.id == user_id)).scalar_one_or_none()
    if user_row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user_row


async def read_and_validate_image(
    upload: UploadFile,
    allowed_types: set[str] = ALLOWED_IMAGE_TYPES,
    max_bytes: int = MAX_IMAGE_BYTES,
) -> bytes:
    if upload.content_type not in allowed_types:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no soportado",
        )

    content = await upload.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Archivo vacío")
    if len(content) > max_bytes:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Imagen demasiado grande",
        )
    return content


def persist_face_capture(
    content: bytes,
    user_id: int,
    upload_root: Path,
    *,
    suffix: str = "",
) -> tuple[str, str]:
    user_dir = upload_root / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"capture_{timestamp}{suffix}.jpg"
    destination = user_dir / filename
    destination.write_bytes(content)
    relative_path = f"face_captures/{user_id}/{filename}"
    return filename, relative_path
