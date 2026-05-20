"""
Análisis facial combinado: dermatología + líneas de expresión (HU17).
Reutiliza la misma imagen en bytes para ambos modelos.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from app.schemas.analysis import DetectionBox
from app.schemas.diagnosis import DiagnosisResult
from app.services.analysis_pipeline_service import build_diagnosis, run_yolo_detections
from app.services.expression_lines_inference_service import (
    DEFAULT_CONF,
    TASK_NAME,
    expression_lines_inference_service,
)

logger = logging.getLogger("dermacheck.combined_analysis")

EXPRESSION_LINES_ERROR_MESSAGE = (
    "No fue posible ejecutar el análisis de líneas de expresión."
)


@dataclass
class CombinedFaceAnalysisResult:
    """Resultado interno del pipeline combinado (para persistencia en router)."""

    payload: dict[str, Any]
    detections: list[DetectionBox]
    diagnosis: DiagnosisResult
    derm_conf: float


def run_expression_lines_safe(
    image_bytes: bytes,
    conf: float = DEFAULT_CONF,
) -> dict[str, Any]:
    """Ejecuta líneas de expresión; ante fallo devuelve payload degradado sin romper dermatología."""
    try:
        return expression_lines_inference_service.analyze_image(image_bytes, conf=conf)
    except Exception as exc:
        logger.warning(
            "Análisis de líneas de expresión no disponible: %s", exc, exc_info=True
        )
        return {
            "detected": False,
            "count": 0,
            "average_confidence": 0.0,
            "error": EXPRESSION_LINES_ERROR_MESSAGE,
            "task": TASK_NAME,
        }


def build_combined_diagnosis(
    diagnosis: DiagnosisResult,
    expression_lines: dict[str, Any],
) -> dict[str, Any]:
    has_affection = len(diagnosis.condiciones_detectadas) > 0
    has_lines = bool(expression_lines.get("detected"))

    if has_affection and has_lines:
        summary = (
            "Se detectaron hallazgos dermatológicos y líneas de expresión "
            "en la imagen analizada."
        )
    elif has_affection:
        summary = "Se detectaron hallazgos dermatológicos en la imagen analizada."
    elif has_lines:
        summary = "Se detectaron líneas de expresión en la imagen analizada."
    else:
        summary = (
            "No se detectaron hallazgos dermatológicos ni líneas de expresión "
            "significativas en la imagen analizada."
        )

    return {
        "has_affection_findings": has_affection,
        "has_expression_lines": has_lines,
        "summary": summary,
    }


def analyze_face_total(
    image_bytes: bytes,
    *,
    derm_conf: float = 0.25,
    expression_lines_conf: float = DEFAULT_CONF,
) -> CombinedFaceAnalysisResult:
    """
    Ejecuta ambos modelos sobre la misma imagen.
    Si dermatología falla, propaga la excepción (mismo comportamiento que face-analyze).
    Si líneas de expresión falla, devuelve bloque degradado en expression_lines.
    """
    detections = run_yolo_detections(image_bytes, conf=derm_conf)
    diagnosis = build_diagnosis(detections)
    expression_lines = run_expression_lines_safe(image_bytes, conf=expression_lines_conf)

    affections = {
        "analysis": {
            "model_conf_threshold": derm_conf,
            "total_detections": len(detections),
            "detections": [d.model_dump() for d in detections],
        },
        "diagnosis": diagnosis.model_dump(),
    }

    payload = {
        "analysis_type": "combined_facial_analysis",
        "affections": affections,
        "expression_lines": expression_lines,
        "combined_diagnosis": build_combined_diagnosis(diagnosis, expression_lines),
    }

    return CombinedFaceAnalysisResult(
        payload=payload,
        detections=detections,
        diagnosis=diagnosis,
        derm_conf=derm_conf,
    )
