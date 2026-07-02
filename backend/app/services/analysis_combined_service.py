"""
Análisis facial combinado: dermatología + líneas de expresión (HU17).
Reutiliza la misma imagen en bytes para ambos modelos.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException, UploadFile

from app.schemas.analysis import DetectionBox
from app.schemas.diagnosis import DiagnosisResult
from app.services.analysis_pipeline_service import build_diagnosis, run_yolo_detections
from app.services.analysis_validation_service import read_and_validate_image
from app.services.inference_thresholds import get_inference_thresholds
from app.services.expression_lines_inference_service import (
    TASK_NAME,
    expression_lines_inference_service,
)

logger = logging.getLogger("dermacheck.combined_analysis")

EXPRESSION_LINES_ERROR_MESSAGE = (
    "No fue posible ejecutar el análisis de líneas de expresión."
)

EMPTY_EXPRESSION_LINES: dict[str, Any] = {
    "detected": False,
    "count": 0,
    "average_confidence": 0.0,
    "detections": [],
}


@dataclass
class CombinedFaceAnalysisResult:
    """Resultado interno del pipeline combinado (para persistencia en router)."""

    payload: dict[str, Any]
    detections: list[DetectionBox]
    diagnosis: DiagnosisResult
    derm_conf: float


def run_expression_lines_safe(
    image_bytes: bytes,
    conf: float | None = None,
) -> dict[str, Any]:
    thresholds = get_inference_thresholds()
    threshold = conf if conf is not None else thresholds.expression_lines_conf
    """Ejecuta líneas de expresión; ante fallo devuelve payload degradado sin romper dermatología."""
    try:
        return expression_lines_inference_service.analyze_image(
            image_bytes, conf=threshold
        )
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


def build_affections_payload(
    detections: list[DetectionBox],
    diagnosis: DiagnosisResult,
    derm_conf: float,
) -> dict[str, Any]:
    return {
        "analysis": {
            "model_conf_threshold": derm_conf,
            "total_detections": len(detections),
            "detections": [d.model_dump() for d in detections],
        },
        "diagnosis": diagnosis.model_dump(),
    }


def run_derm_conditions_detection(
    image_bytes: bytes,
    *,
    conf: float,
) -> list[DetectionBox]:
    """Ejecuta YOLO dermatológico sobre bytes de imagen ya validados."""
    return run_yolo_detections(image_bytes, conf=conf)


async def analyze_face_conditions_only(
    upload: UploadFile,
    *,
    conf: float,
    allowed_types: set[str],
    max_bytes: int,
) -> tuple[bytes, list[DetectionBox]]:
    """Lee, valida y ejecuta YOLO dermatológico sobre una imagen subida."""
    try:
        content = await read_and_validate_image(
            upload,
            allowed_types=allowed_types,
            max_bytes=max_bytes,
        )
        detections = run_derm_conditions_detection(content, conf=conf)
        return content, detections
    except HTTPException as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=f"Error al procesar una de las imágenes enviadas: {exc.detail}",
        ) from exc


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
    derm_conf: float | None = None,
    expression_lines_conf: float | None = None,
) -> CombinedFaceAnalysisResult:
    """Ejecuta ambos modelos sobre la misma imagen."""
    thresholds = get_inference_thresholds()
    effective_derm_conf = derm_conf if derm_conf is not None else thresholds.derm_conf
    lines_conf = (
        expression_lines_conf
        if expression_lines_conf is not None
        else thresholds.expression_lines_conf
    )
    detections = run_derm_conditions_detection(image_bytes, conf=effective_derm_conf)
    diagnosis = build_diagnosis(detections)
    expression_lines = run_expression_lines_safe(image_bytes, conf=lines_conf)
    if "model_conf_threshold" not in expression_lines:
        expression_lines["model_conf_threshold"] = lines_conf
    logger.info(
        "Análisis combinado: derm_conf=%.2f expression_lines_conf=%.2f",
        effective_derm_conf,
        lines_conf,
    )

    payload = {
        "analysis_type": "combined_facial_analysis",
        "affections": build_affections_payload(detections, diagnosis, effective_derm_conf),
        "expression_lines": expression_lines,
        "combined_diagnosis": build_combined_diagnosis(diagnosis, expression_lines),
    }

    return CombinedFaceAnalysisResult(
        payload=payload,
        detections=detections,
        diagnosis=diagnosis,
        derm_conf=effective_derm_conf,
    )


def analyze_face_double(
    image_bytes_1: bytes,
    image_bytes_2: bytes,
    *,
    derm_conf: float | None = None,
) -> CombinedFaceAnalysisResult:
    """Ejecuta YOLO dermatológico en dos imágenes y fusiona detecciones."""
    thresholds = get_inference_thresholds()
    effective_derm_conf = derm_conf if derm_conf is not None else thresholds.derm_conf
    detections_1 = run_derm_conditions_detection(image_bytes_1, conf=effective_derm_conf)
    detections_2 = run_derm_conditions_detection(image_bytes_2, conf=effective_derm_conf)
    all_detections = detections_1 + detections_2
    diagnosis = build_diagnosis(all_detections)
    expression_lines = EMPTY_EXPRESSION_LINES.copy()

    logger.info(
        "Análisis doble: derm_conf=%.2f detecciones=%d (img1=%d, img2=%d)",
        effective_derm_conf,
        len(all_detections),
        len(detections_1),
        len(detections_2),
    )

    payload = {
        "analysis_type": "combined_facial_analysis_double",
        "affections": build_affections_payload(all_detections, diagnosis, effective_derm_conf),
        "expression_lines": expression_lines,
        "combined_diagnosis": build_combined_diagnosis(diagnosis, expression_lines),
        "images_processed": 2,
    }

    return CombinedFaceAnalysisResult(
        payload=payload,
        detections=all_detections,
        diagnosis=diagnosis,
        derm_conf=effective_derm_conf,
    )
