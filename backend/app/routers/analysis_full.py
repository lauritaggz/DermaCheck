"""
Endpoint combinado de análisis facial.
Recibe una imagen, valida consentimiento, procesa con IA y decide persistencia según allow_training_storage.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.combined_analysis import CombinedFacialAnalysisResponse
from app.schemas.diagnosis import DiagnosisResponse
from app.services.analysis_job_queue import analysis_job_queue
from app.services.analysis_pipeline_service import build_diagnosis, run_yolo_detections
from app.services.analysis_validation_service import (
    ensure_user_exists,
    parse_user_id,
    read_and_validate_image,
)
from app.services.consent_validation_service import validate_analysis_consent_fields
from app.services.inference_thresholds import get_inference_thresholds
from app.services.training_image_storage_service import (
    ephemeral_image_meta,
    save_training_image,
)

router = APIRouter(prefix="/analysis", tags=["analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 12 * 1024 * 1024


def _detected_condition_names(detections) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for detection in detections:
        label = getattr(detection, "class_name", None) or detection.get("class_name", "")
        if label and label not in seen:
            seen.add(label)
            names.append(label)
    return names



@router.post("/face-analyze", response_model=DiagnosisResponse)
async def analyze_face_image(
    user_id: str = Form(...),
    face_image: UploadFile = File(...),
    consent_accepted: str = Form(...),
    privacy_accepted: str = Form(...),
    allow_training_storage: str = Form("false"),
    legal_version: str = Form(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db),
) -> DiagnosisResponse:
    """
    Guarda la captura solo si allow_training_storage=true; si no, procesamiento efímero.
    """
    start_time = time.perf_counter()
    consent_ctx = validate_analysis_consent_fields(
        consent_accepted=consent_accepted,
        privacy_accepted=privacy_accepted,
        allow_training_storage=allow_training_storage,
        legal_version=legal_version,
        session_id=session_id,
    )
    n = parse_user_id(user_id)
    ensure_user_exists(db, n)

    content = await read_and_validate_image(
        face_image,
        allowed_types=ALLOWED_TYPES,
        max_bytes=MAX_BYTES,
    )

    filename = ""
    rel_path = ""
    stored = False

    try:
        thresholds = get_inference_thresholds()
        detections = run_yolo_detections(content, conf=thresholds.derm_conf)
        processing_time_ms = (time.perf_counter() - start_time) * 1000
        diagnosis = build_diagnosis(detections)
        condition_names = _detected_condition_names(detections)

        # Solo persistir imagen con consentimiento opcional explícito de entrenamiento.
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
        # Si allow_training_storage=false: content solo en memoria; no se escribe a disco.

        image_meta = (
            {"filename": filename, "path": rel_path, "size_bytes": len(content), "stored": stored}
            if stored
            else ephemeral_image_meta(len(content))
        )

        return DiagnosisResponse(
            ok=True,
            user_id=str(n),
            image=image_meta,
            analysis={
                "model_conf_threshold": thresholds.derm_conf,
                "total_detections": len(detections),
                "detections": [d.model_dump() for d in detections],
                "processing_time_ms": processing_time_ms,
            },
            diagnosis=diagnosis,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    finally:
        # Sin archivos temporales en disco cuando stored=false (procesamiento en memoria).
        pass


@router.post("/face-analyze-total", response_model=CombinedFacialAnalysisResponse)
async def analyze_face_image_total(
    user_id: str = Form(...),
    face_image: UploadFile = File(...),
    consent_accepted: str = Form(...),
    privacy_accepted: str = Form(...),
    allow_training_storage: str = Form("false"),
    legal_version: str = Form(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db),
) -> CombinedFacialAnalysisResponse:
    """Análisis facial combinado con control de persistencia por consentimiento."""
    consent_ctx = validate_analysis_consent_fields(
        consent_accepted=consent_accepted,
        privacy_accepted=privacy_accepted,
        allow_training_storage=allow_training_storage,
        legal_version=legal_version,
        session_id=session_id,
    )
    n = parse_user_id(user_id)
    ensure_user_exists(db, n)

    content = await read_and_validate_image(
        face_image,
        allowed_types=ALLOWED_TYPES,
        max_bytes=MAX_BYTES,
    )

    result = await analysis_job_queue.run_sync(
        user_id=n,
        consent_ctx=consent_ctx,
        mode="single",
        image_contents=[content],
    )
    return CombinedFacialAnalysisResponse.model_validate(result)


@router.post(
    "/face-analyze-total-double",
    response_model=CombinedFacialAnalysisResponse,
)
async def analyze_face_image_total_double(
    user_id: str = Form(...),
    face_image_1: UploadFile = File(...),
    face_image_2: UploadFile = File(...),
    consent_accepted: str = Form(...),
    privacy_accepted: str = Form(...),
    allow_training_storage: str = Form("false"),
    legal_version: str = Form(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db),
) -> CombinedFacialAnalysisResponse:
    """Análisis doble con fusión YOLO; persistencia condicionada al consentimiento opcional."""
    consent_ctx = validate_analysis_consent_fields(
        consent_accepted=consent_accepted,
        privacy_accepted=privacy_accepted,
        allow_training_storage=allow_training_storage,
        legal_version=legal_version,
        session_id=session_id,
    )
    n = parse_user_id(user_id)
    ensure_user_exists(db, n)

    try:
        content_1 = await read_and_validate_image(
            face_image_1,
            allowed_types=ALLOWED_TYPES,
            max_bytes=MAX_BYTES,
        )
    except HTTPException as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=f"Error al procesar una de las imágenes enviadas: {exc.detail}",
        ) from exc

    try:
        content_2 = await read_and_validate_image(
            face_image_2,
            allowed_types=ALLOWED_TYPES,
            max_bytes=MAX_BYTES,
        )
    except HTTPException as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=f"Error al procesar una de las imágenes enviadas: {exc.detail}",
        ) from exc

    result = await analysis_job_queue.run_sync(
        user_id=n,
        consent_ctx=consent_ctx,
        mode="double",
        image_contents=[content_1, content_2],
    )
    return CombinedFacialAnalysisResponse.model_validate(result)
