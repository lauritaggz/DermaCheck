"""Endpoints de cola para análisis facial (POST 202 + polling GET)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.analysis_job import (
    AnalysisJobQueueHealthResponse,
    AnalysisJobStatusResponse,
    AnalysisJobSubmitResponse,
)
from app.services.analysis_job_queue import analysis_job_queue
from app.services.analysis_validation_service import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    ensure_user_exists,
    parse_user_id,
    read_and_validate_image,
)
from app.services.consent_validation_service import validate_analysis_consent_fields
from app.services.inference_thresholds import get_inference_thresholds

router = APIRouter(prefix="/analysis", tags=["analysis-jobs"])


def _poll_hint() -> float:
    return settings.analysis_job_poll_interval_hint


@router.post(
    "/jobs",
    response_model=AnalysisJobSubmitResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def submit_analysis_job(
    user_id: str = Form(...),
    face_image: UploadFile | None = File(default=None),
    face_image_1: UploadFile | None = File(default=None),
    face_image_2: UploadFile | None = File(default=None),
    consent_accepted: str = Form(...),
    privacy_accepted: str = Form(...),
    allow_training_storage: str = Form("false"),
    legal_version: str = Form(...),
    session_id: str = Form(...),
    db: Session = Depends(get_db),
) -> AnalysisJobSubmitResponse:
    consent_ctx = validate_analysis_consent_fields(
        consent_accepted=consent_accepted,
        privacy_accepted=privacy_accepted,
        allow_training_storage=allow_training_storage,
        legal_version=legal_version,
        session_id=session_id,
    )
    n = parse_user_id(user_id)
    ensure_user_exists(db, n)

    has_single = face_image is not None
    has_double = face_image_1 is not None and face_image_2 is not None

    if has_single and has_double:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Envíe una imagen (face_image) o dos (face_image_1 y face_image_2), no ambos modos.",
        )
    if not has_single and not has_double:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe enviar face_image o face_image_1 y face_image_2.",
        )

    if has_single:
        content = await read_and_validate_image(
            face_image,
            allowed_types=ALLOWED_IMAGE_TYPES,
            max_bytes=MAX_IMAGE_BYTES,
        )
        record = await analysis_job_queue.enqueue(
            user_id=n,
            consent_ctx=consent_ctx,
            mode="single",
            image_contents=[content],
        )
    else:
        try:
            content_1 = await read_and_validate_image(
                face_image_1,
                allowed_types=ALLOWED_IMAGE_TYPES,
                max_bytes=MAX_IMAGE_BYTES,
            )
        except HTTPException as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=f"Error al procesar una de las imágenes enviadas: {exc.detail}",
            ) from exc
        try:
            content_2 = await read_and_validate_image(
                face_image_2,
                allowed_types=ALLOWED_IMAGE_TYPES,
                max_bytes=MAX_IMAGE_BYTES,
            )
        except HTTPException as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=f"Error al procesar una de las imágenes enviadas: {exc.detail}",
            ) from exc
        record = await analysis_job_queue.enqueue(
            user_id=n,
            consent_ctx=consent_ctx,
            mode="double",
            image_contents=[content_1, content_2],
        )

    return AnalysisJobSubmitResponse(
        job_id=record.job_id,
        status=record.status,
        position=analysis_job_queue.position_in_queue(record.job_id),
        poll_interval_seconds=_poll_hint(),
    )


@router.get("/jobs/health", response_model=AnalysisJobQueueHealthResponse)
async def analysis_jobs_health() -> AnalysisJobQueueHealthResponse:
    return AnalysisJobQueueHealthResponse(
        queued=analysis_job_queue.queued_count(),
        running=analysis_job_queue.running_count(),
        max_size=analysis_job_queue.max_size,
        max_concurrent=settings.analysis_max_concurrent,
    )


@router.get("/jobs/{job_id}", response_model=AnalysisJobStatusResponse)
async def get_analysis_job_status(job_id: str) -> AnalysisJobStatusResponse:
    record = analysis_job_queue.get_record(job_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trabajo de análisis no encontrado o expirado.",
        )

    progress = None
    if record.status == "queued":
        progress = "queued"
    elif record.status == "running":
        progress = "running"

    return AnalysisJobStatusResponse(
        job_id=record.job_id,
        status=record.status,
        position=analysis_job_queue.position_in_queue(job_id),
        poll_interval_seconds=_poll_hint(),
        progress=progress,
        result=record.result if record.status == "completed" else None,
        error=record.error if record.status == "failed" else None,
    )
