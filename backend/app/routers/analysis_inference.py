"""
Endpoint de inferencia IA: recibe una imagen y devuelve detecciones del modelo YOLO.
Va bajo el mismo prefijo de análisis (/api/v1/analysis/inference) para no chocar con la subida.
"""

from __future__ import annotations

import time

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.analysis import DetectionBox, InferenceResponse
from app.services.inference_service import run_inference

router = APIRouter(prefix="/analysis", tags=["analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 12 * 1024 * 1024


@router.post("/inference", response_model=InferenceResponse)
async def analyze_image(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    conf: float = Form(0.25),
) -> InferenceResponse:
    """
    Endpoint simplificado de inferencia: analiza una imagen sin guardarla.
    Útil para pruebas o análisis rápidos sin registro.
    """
    start_time = time.perf_counter()
    
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no soportado",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Archivo vacío")
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Imagen demasiado grande",
        )

    try:
        detections_raw = run_inference(content, conf=conf)
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

    # Convertir a modelos Pydantic
    detections = [DetectionBox(**d) for d in detections_raw]
    
    # Calcular tiempo de procesamiento
    processing_time_ms = (time.perf_counter() - start_time) * 1000

    return InferenceResponse(
        user_id=user_id,
        filename=file.filename,
        total_detections=len(detections),
        detections=detections,
        processing_time_ms=processing_time_ms,
    )
