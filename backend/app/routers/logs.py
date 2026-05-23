from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/logs", tags=["observability"])
logger = logging.getLogger("dermacheck.remote_logs")
LOGS_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOGS_FILE = LOGS_DIR / "dermacheck_events.log"
FILE_LOCK = Lock()


class RemoteLogEvent(BaseModel):
    timestamp: str
    level: Literal["INFO", "WARN", "ERROR"]
    message: str
    context: dict[str, Any] | None = None


class LogIngestRequest(BaseModel):
    source: str = Field(default="web")
    events: list[RemoteLogEvent]


def _append_historical_log_line(source: str, event: RemoteLogEvent) -> None:
    """
    Guarda historial en archivo texto (JSONL), una línea por evento.
    Incluye hora original del evento + hora de recepción en backend.
    """
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "received_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "event": event.model_dump(),
    }
    line = json.dumps(payload, ensure_ascii=False)
    with FILE_LOCK:
        with LOGS_FILE.open("a", encoding="utf-8") as file:
            file.write(line + "\n")


@router.post("/events")
def ingest_logs(payload: LogIngestRequest) -> dict[str, int | bool]:
    for event in payload.events:
        _append_historical_log_line(payload.source, event)
        if event.level == "ERROR":
            logger.error("[source=%s] %s | %s", payload.source, event.message, event.context)
        elif event.level == "WARN":
            logger.warning("[source=%s] %s | %s", payload.source, event.message, event.context)
        else:
            logger.info("[source=%s] %s | %s", payload.source, event.message, event.context)

    return {
        "ok": True,
        "ingested": len(payload.events),
    }
