"""Configuración pública del modo tótem."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.kiosk import InferenceThresholdsConfig, KioskConfigResponse
from app.services.inference_thresholds import get_inference_thresholds
from app.services.kiosk_user_service import ensure_kiosk_user

router = APIRouter(prefix="/kiosk", tags=["kiosk"])


@router.get("/config", response_model=KioskConfigResponse)
def kiosk_config(db: Session = Depends(get_db)) -> KioskConfigResponse:
    """Devuelve user_id del tótem y umbrales YOLO activos en el servidor."""
    user = ensure_kiosk_user(db)
    thresholds = get_inference_thresholds()
    return KioskConfigResponse(
        user_id=str(user.id),
        inference_thresholds=InferenceThresholdsConfig(
            derm_conf=thresholds.derm_conf,
            expression_lines_conf=thresholds.expression_lines_conf,
        ),
    )
