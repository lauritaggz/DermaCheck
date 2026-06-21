"""
Pipeline de análisis facial reutilizable (síncrono, para thread pool / cola).
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.schemas.combined_analysis import CombinedFacialAnalysisResponse
from app.services.analysis_combined_service import analyze_face_double, analyze_face_total
from app.services.consent_validation_service import AnalysisConsentContext
from app.services.inference_lock import inference_lock
from app.services.training_image_storage_service import (
    ephemeral_image_meta,
    save_training_image,
)


def detected_condition_names(detections) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for detection in detections:
        label = getattr(detection, "class_name", None) or detection.get("class_name", "")
        if label and label not in seen:
            seen.add(label)
            names.append(label)
    return names


def execute_combined_single(
    *,
    content: bytes,
    user_id: int,
    consent_ctx: AnalysisConsentContext,
    conf: float,
    expression_lines_conf: float | None,
    db: Session,
) -> dict[str, Any]:
    """Análisis combinado (derm + líneas) sobre una imagen."""
    start_time = time.perf_counter()
    effective_lines_conf = (
        expression_lines_conf
        if expression_lines_conf is not None
        else settings.expression_lines_conf_threshold
    )

    with inference_lock():
        combined = analyze_face_total(
            content,
            derm_conf=conf,
            expression_lines_conf=effective_lines_conf,
        )

    processing_time_ms = (time.perf_counter() - start_time) * 1000
    combined.payload["affections"]["analysis"]["processing_time_ms"] = processing_time_ms
    condition_names = detected_condition_names(combined.detections)

    stored = False
    filename = ""
    rel_path = ""
    if consent_ctx.allow_training_storage:
        record = save_training_image(
            content,
            session_id=consent_ctx.session_id,
            legal_version=consent_ctx.legal_version,
            consent_accepted=consent_ctx.consent_accepted,
            privacy_accepted=consent_ctx.privacy_accepted,
            detected_conditions=condition_names,
            db=db,
        )
        db.commit()
        filename = record.image_path.rsplit("/", 1)[-1]
        rel_path = record.image_path
        stored = True

    body = combined.payload
    image_meta = (
        {"filename": filename, "path": rel_path, "size_bytes": len(content), "stored": stored}
        if stored
        else ephemeral_image_meta(len(content))
    )

    response = CombinedFacialAnalysisResponse(
        ok=True,
        user_id=str(user_id),
        image=image_meta,
        analysis_type=body["analysis_type"],
        affections=body["affections"],
        expression_lines=body["expression_lines"],
        combined_diagnosis=body["combined_diagnosis"],
        timestamp=datetime.now(timezone.utc).isoformat(),
        processing_time_ms=processing_time_ms,
    )
    return response.model_dump(mode="json")


def execute_combined_double(
    *,
    content_1: bytes,
    content_2: bytes,
    user_id: int,
    consent_ctx: AnalysisConsentContext,
    conf: float,
    db: Session,
) -> dict[str, Any]:
    """Análisis doble fusionado."""
    start_time = time.perf_counter()

    with inference_lock():
        combined = analyze_face_double(content_1, content_2, derm_conf=conf)

    processing_time_ms = (time.perf_counter() - start_time) * 1000
    combined.payload["affections"]["analysis"]["processing_time_ms"] = processing_time_ms
    condition_names = detected_condition_names(combined.detections)

    if consent_ctx.allow_training_storage:
        record_1 = save_training_image(
            content_1,
            session_id=consent_ctx.session_id,
            legal_version=consent_ctx.legal_version,
            consent_accepted=consent_ctx.consent_accepted,
            privacy_accepted=consent_ctx.privacy_accepted,
            detected_conditions=condition_names,
            suffix="_side1",
            db=db,
        )
        record_2 = save_training_image(
            content_2,
            session_id=consent_ctx.session_id,
            legal_version=consent_ctx.legal_version,
            consent_accepted=consent_ctx.consent_accepted,
            privacy_accepted=consent_ctx.privacy_accepted,
            detected_conditions=condition_names,
            suffix="_side2",
            db=db,
        )
        db.commit()
        images_meta = [
            {
                "filename": record_1.image_path.rsplit("/", 1)[-1],
                "path": record_1.image_path,
                "size_bytes": len(content_1),
                "stored": True,
            },
            {
                "filename": record_2.image_path.rsplit("/", 1)[-1],
                "path": record_2.image_path,
                "size_bytes": len(content_2),
                "stored": True,
            },
        ]
    else:
        images_meta = [
            ephemeral_image_meta(len(content_1)),
            ephemeral_image_meta(len(content_2)),
        ]

    body = combined.payload
    response = CombinedFacialAnalysisResponse(
        ok=True,
        user_id=str(user_id),
        image=images_meta[0],
        analysis_type=body["analysis_type"],
        affections=body["affections"],
        expression_lines=body["expression_lines"],
        combined_diagnosis=body["combined_diagnosis"],
        timestamp=datetime.now(timezone.utc).isoformat(),
        processing_time_ms=processing_time_ms,
        images_processed=body["images_processed"],
        images=images_meta,
    )
    return response.model_dump(mode="json")
