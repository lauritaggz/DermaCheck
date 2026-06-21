"""Schemas para la cola de trabajos de análisis facial."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


AnalysisJobStatus = Literal["queued", "running", "completed", "failed"]


class AnalysisJobSubmitResponse(BaseModel):
    job_id: str
    status: AnalysisJobStatus
    position: int = Field(description="Jobs en cola o ejecutándose antes que este")
    poll_interval_seconds: float


class AnalysisJobStatusResponse(BaseModel):
    job_id: str
    status: AnalysisJobStatus
    position: int
    poll_interval_seconds: float
    progress: str | None = None
    result: dict[str, Any] | None = None
    error: str | None = None


class AnalysisJobQueueHealthResponse(BaseModel):
    queued: int
    running: int
    max_size: int
    max_concurrent: int
