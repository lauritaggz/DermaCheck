"""
Endpoint combinado de análisis facial.
Recibe una imagen, valida el usuario, guarda el archivo y corre la inferencia IA
en una sola llamada (lo que normalmente consumirá el frontend).
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SkinAnalysis
from app.schemas.diagnosis import DiagnosisResponse
from app.services.analysis_pipeline_service import build_diagnosis, run_yolo_detections
from app.services.analysis_validation_service import (
    ensure_user_exists,
    parse_user_id,
    persist_face_capture,
    read_and_validate_image,
)

router = APIRouter(prefix="/analysis", tags=["analysis"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads" / "face_captures"
ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 12 * 1024 * 1024


@router.post("/face-analyze", response_model=DiagnosisResponse)
async def analyze_face_image(
    user_id: str = Form(...),
    face_image: UploadFile = File(...),
    conf: float = Form(0.25),
    db: Session = Depends(get_db),
) -> DiagnosisResponse:
    """
    Guarda la captura facial del usuario, ejecuta análisis y genera diagnóstico preliminar.
    
    Retorna detecciones del modelo + diagnóstico estructurado con información médica.
    Registra el resultado en la base de datos para histórico (futuro).
    """
    start_time = time.perf_counter()
    n = parse_user_id(user_id)

    # Validar usuario existe
    ensure_user_exists(db, n)

    # Validar formato y tamaño de imagen
    content = await read_and_validate_image(
        face_image,
        allowed_types=ALLOWED_TYPES,
        max_bytes=MAX_BYTES,
    )

    # Guardar imagen
    filename, rel_path = persist_face_capture(content, n, UPLOAD_ROOT)

    # Ejecutar inferencia
    detections = run_yolo_detections(content, conf=conf)
    
    # Calcular tiempo de procesamiento
    processing_time_ms = (time.perf_counter() - start_time) * 1000
    
    # **NUEVO: Generar diagnóstico preliminar**
    diagnosis = build_diagnosis(detections)

    # Registrar en base de datos
    analysis_record = SkinAnalysis(
        user_id=n,
        image_filename=filename,
        image_path=rel_path,
        image_size_bytes=len(content),
        model_conf_threshold=conf,
        total_detections=len(detections),
        detections_json=json.dumps([d.model_dump() for d in detections]),
        processing_time_ms=processing_time_ms,
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Construir respuesta estructurada CON DIAGNÓSTICO
    return DiagnosisResponse(
        ok=True,
        user_id=str(n),
        image={
            "filename": filename,
            "path": rel_path,
            "size_bytes": len(content),
        },
        analysis={
            "model_conf_threshold": conf,
            "total_detections": len(detections),
            "detections": [d.model_dump() for d in detections],
            "processing_time_ms": processing_time_ms,
        },
        diagnosis=diagnosis,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
