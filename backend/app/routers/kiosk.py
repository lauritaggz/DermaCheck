"""Configuración pública del modo tótem."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.kiosk_user_service import ensure_kiosk_user

router = APIRouter(prefix="/kiosk", tags=["kiosk"])


@router.get("/config")
def kiosk_config(db: Session = Depends(get_db)) -> dict[str, str]:
    """Devuelve el user_id técnico usado por el tótem para registrar análisis."""
    user = ensure_kiosk_user(db)
    return {"user_id": str(user.id)}
