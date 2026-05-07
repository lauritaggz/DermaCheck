from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.analysis import DetectionBox
from app.schemas.diagnosis import DiagnosisResult
from app.services.diagnosis_service import generate_diagnosis
from app.services.inference_service import run_inference


def run_yolo_detections(image_content: bytes, conf: float) -> list[DetectionBox]:
    try:
        detections_raw = run_inference(image_content, conf=conf)
    except FileNotFoundError as exc:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # pragma: no cover - fallback de seguridad
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en inferencia: {exc!s}",
        ) from exc

    return [DetectionBox(**det) for det in detections_raw]


def build_diagnosis(detections: list[DetectionBox]) -> DiagnosisResult:
    return generate_diagnosis(detections)
