"""
Endpoint de análisis de líneas de expresión (HU17).
Independiente del flujo dermatológico (/analysis/face-analyze, /analysis/inference).
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.services.inference_thresholds import get_inference_thresholds
from app.services.analysis_validation_service import read_and_validate_image
from app.services.expression_lines_inference_service import expression_lines_inference_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/expression-lines")
async def analyze_expression_lines(
    file: UploadFile = File(..., description="Imagen facial para detectar líneas de expresión"),
) -> dict[str, Any]:
    """
    Analiza líneas de expresión con el modelo best_wrinkle_yolov8m.pt.
    No guarda la imagen ni requiere usuario registrado.
    """
    image_bytes = await read_and_validate_image(file)

    try:
        threshold = get_inference_thresholds().expression_lines_conf
        return expression_lines_inference_service.analyze_image(image_bytes, conf=threshold)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en inferencia de líneas de expresión: {exc!s}",
        ) from exc
