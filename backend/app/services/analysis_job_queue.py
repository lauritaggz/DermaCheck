"""
Cola in-memory de trabajos de análisis facial con worker asyncio y pipeline en thread pool.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import HTTPException, status

from app.config import settings
from app.database import SessionLocal
from app.services.analysis_execution_service import (
    execute_combined_double,
    execute_combined_single,
)
from app.services.analysis_validation_service import ensure_user_exists
from app.services.consent_validation_service import AnalysisConsentContext

logger = logging.getLogger(__name__)

JOB_QUEUE_ROOT = Path(__file__).resolve().parent.parent.parent / "storage" / "job_queue"

JobMode = Literal["single", "double"]


@dataclass
class JobRecord:
    job_id: str
    status: Literal["queued", "running", "completed", "failed"]
    created_at: datetime
    user_id: int
    consent_ctx: AnalysisConsentContext
    conf: float
    expression_lines_conf: float | None
    mode: JobMode
    image_paths: list[Path]
    result: dict[str, Any] | None = None
    error: str | None = None
    finished_at: datetime | None = None


@dataclass
class _PendingJob:
    job_id: str
    user_id: int
    consent_ctx: AnalysisConsentContext
    conf: float
    expression_lines_conf: float | None
    mode: JobMode
    image_paths: list[Path]


class AnalysisJobQueue:
    def __init__(self) -> None:
        self._store: dict[str, JobRecord] = {}
        self._order: list[str] = []
        self._queue: asyncio.Queue[str] = asyncio.Queue(
            maxsize=settings.analysis_queue_max_size,
        )
        self._semaphore = asyncio.Semaphore(settings.analysis_max_concurrent)
        self._worker_tasks: list[asyncio.Task] = []
        self._cleanup_task: asyncio.Task | None = None
        self._started = False

    @property
    def max_size(self) -> int:
        return settings.analysis_queue_max_size

    def position_in_queue(self, job_id: str) -> int:
        ahead = 0
        for jid in self._order:
            if jid == job_id:
                break
            record = self._store.get(jid)
            if record and record.status in ("queued", "running"):
                ahead += 1
        return ahead

    def get_record(self, job_id: str) -> JobRecord | None:
        return self._store.get(job_id)

    def queued_count(self) -> int:
        return sum(1 for r in self._store.values() if r.status == "queued")

    def running_count(self) -> int:
        return sum(1 for r in self._store.values() if r.status == "running")

    async def start(self) -> None:
        if self._started:
            return
        self._started = True
        JOB_QUEUE_ROOT.mkdir(parents=True, exist_ok=True)
        worker_count = max(1, settings.analysis_max_concurrent)
        for _ in range(worker_count):
            self._worker_tasks.append(asyncio.create_task(self._worker_loop()))
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        logger.info(
            "Cola de análisis iniciada (workers=%s, max_size=%s)",
            worker_count,
            settings.analysis_queue_max_size,
        )

    async def stop(self) -> None:
        for task in self._worker_tasks:
            task.cancel()
        if self._worker_tasks:
            await asyncio.gather(*self._worker_tasks, return_exceptions=True)
        if self._cleanup_task:
            self._cleanup_task.cancel()
            await asyncio.gather(self._cleanup_task, return_exceptions=True)
        self._worker_tasks.clear()
        self._cleanup_task = None
        self._started = False
        while not self._queue.empty():
            try:
                self._queue.get_nowait()
                self._queue.task_done()
            except asyncio.QueueEmpty:
                break

    async def enqueue(
        self,
        *,
        user_id: int,
        consent_ctx: AnalysisConsentContext,
        conf: float,
        expression_lines_conf: float | None,
        mode: JobMode,
        image_contents: list[bytes],
    ) -> JobRecord:
        if self._queue.full():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="La cola de análisis está llena. Inténtelo de nuevo en unos momentos.",
                headers={"Retry-After": "5"},
            )

        job_id = str(uuid.uuid4())
        job_dir = JOB_QUEUE_ROOT / job_id
        job_dir.mkdir(parents=True, exist_ok=True)

        image_paths: list[Path] = []
        for index, content in enumerate(image_contents):
            suffix = f"_{index + 1}" if mode == "double" else ""
            path = job_dir / f"capture{suffix}.jpg"
            path.write_bytes(content)
            image_paths.append(path)

        record = JobRecord(
            job_id=job_id,
            status="queued",
            created_at=datetime.now(timezone.utc),
            user_id=user_id,
            consent_ctx=consent_ctx,
            conf=conf,
            expression_lines_conf=expression_lines_conf,
            mode=mode,
            image_paths=image_paths,
        )
        self._store[job_id] = record
        self._order.append(job_id)
        await self._queue.put(job_id)
        return record

    async def run_sync(
        self,
        *,
        user_id: int,
        consent_ctx: AnalysisConsentContext,
        conf: float,
        expression_lines_conf: float | None,
        mode: JobMode,
        image_contents: list[bytes],
    ) -> dict[str, Any]:
        """Encola y espera el resultado (endpoints legacy síncronos)."""
        record = await self.enqueue(
            user_id=user_id,
            consent_ctx=consent_ctx,
            conf=conf,
            expression_lines_conf=expression_lines_conf,
            mode=mode,
            image_contents=image_contents,
        )
        while True:
            current = self._store.get(record.job_id)
            if current is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="El trabajo de análisis desapareció de la cola.",
                )
            if current.status == "completed":
                if current.result is None:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Análisis completado sin resultado.",
                    )
                return current.result
            if current.status == "failed":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=current.error or "Error al procesar el análisis.",
                )
            await asyncio.sleep(settings.analysis_job_poll_interval_hint)

    async def _worker_loop(self) -> None:
        while True:
            job_id = await self._queue.get()
            try:
                record = self._store.get(job_id)
                if record is None:
                    continue

                async with self._semaphore:
                    record.status = "running"
                    try:
                        result = await asyncio.to_thread(self._run_pipeline_sync, record)
                        record.result = result
                        record.status = "completed"
                    except Exception as exc:
                        logger.exception("Job %s falló", job_id)
                        record.status = "failed"
                        record.error = str(exc)
                    finally:
                        record.finished_at = datetime.now(timezone.utc)
                        self._remove_job_files(record)
            finally:
                self._queue.task_done()

    def _run_pipeline_sync(self, record: JobRecord) -> dict[str, Any]:
        db = SessionLocal()
        try:
            ensure_user_exists(db, record.user_id)
            if record.mode == "single":
                content = record.image_paths[0].read_bytes()
                return execute_combined_single(
                    content=content,
                    user_id=record.user_id,
                    consent_ctx=record.consent_ctx,
                    conf=record.conf,
                    expression_lines_conf=record.expression_lines_conf,
                    db=db,
                )
            content_1 = record.image_paths[0].read_bytes()
            content_2 = record.image_paths[1].read_bytes()
            return execute_combined_double(
                content_1=content_1,
                content_2=content_2,
                user_id=record.user_id,
                consent_ctx=record.consent_ctx,
                conf=record.conf,
                db=db,
            )
        finally:
            db.close()

    @staticmethod
    def _remove_job_files(record: JobRecord) -> None:
        if not record.image_paths:
            return
        job_dir = record.image_paths[0].parent
        try:
            if job_dir.exists() and job_dir.is_dir():
                shutil.rmtree(job_dir, ignore_errors=True)
        except OSError:
            logger.warning("No se pudo eliminar carpeta temporal del job %s", record.job_id)

    async def _cleanup_loop(self) -> None:
        interval = max(60, settings.analysis_job_ttl_seconds // 4)
        while True:
            try:
                await asyncio.sleep(interval)
                self._purge_expired_jobs()
            except asyncio.CancelledError:
                break

    def _purge_expired_jobs(self) -> None:
        now = datetime.now(timezone.utc)
        ttl = settings.analysis_job_ttl_seconds
        expired_ids: list[str] = []
        for job_id, record in self._store.items():
            if record.status not in ("completed", "failed"):
                continue
            finished = record.finished_at or record.created_at
            age = (now - finished).total_seconds()
            if age >= ttl:
                expired_ids.append(job_id)

        for job_id in expired_ids:
            self._store.pop(job_id, None)
            if job_id in self._order:
                self._order.remove(job_id)

        if JOB_QUEUE_ROOT.exists():
            known_dirs = {
                self._store[jid].image_paths[0].parent.name
                for jid in self._store
                if self._store[jid].image_paths
            }
            for path in JOB_QUEUE_ROOT.iterdir():
                if path.is_dir() and path.name not in known_dirs:
                    shutil.rmtree(path, ignore_errors=True)


analysis_job_queue = AnalysisJobQueue()
