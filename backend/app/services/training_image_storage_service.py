"""
Almacenamiento privado de imágenes para entrenamiento (solo con consentimiento explícito).

Las rutas quedan bajo storage/training_images/ — no se montan como estáticos públicos.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import TrainingImageRecord

TRAINING_ROOT = Path(__file__).resolve().parent.parent.parent / "storage" / "training_images"


def _build_training_filename(suffix: str = "") -> str:
    """Nombre con fecha/hora UTC del análisis: analysis_YYYYMMDD_HHMMSS[_1].jpg"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    if suffix:
        return f"analysis_{ts}{suffix}.jpg"
    return f"analysis_{ts}.jpg"


def _find_existing_single_capture(db: Session, session_id: str) -> TrainingImageRecord | None:
    """Evita duplicar la misma captura única si el cliente reintenta la petición."""
    rows = db.execute(
        select(TrainingImageRecord).where(TrainingImageRecord.session_id == session_id)
    ).scalars().all()
    for row in rows:
        name = row.image_path.rsplit("/", 1)[-1]
        if name.endswith("_side1.jpg") or name.endswith("_side2.jpg"):
            continue
        return row
    return None


def save_training_image(
    content: bytes,
    *,
    session_id: str,
    legal_version: str,
    consent_accepted: bool,
    privacy_accepted: bool,
    detected_conditions: list[str] | None = None,
    suffix: str = "",
    db: Session | None = None,
) -> TrainingImageRecord:
    """Persiste imagen y metadata cuando allow_training_storage es true."""
    if db is not None and suffix == "":
        existing = _find_existing_single_capture(db, session_id)
        if existing is not None:
            return existing

    session_dir = TRAINING_ROOT / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    record_id = str(uuid.uuid4())
    filename = _build_training_filename(suffix)
    destination = session_dir / filename

    # Colisión improbable (mismo segundo): añadir fragmento del id
    if destination.exists():
        filename = _build_training_filename(f"{suffix}_{record_id[:6]}" if suffix else f"_{record_id[:6]}")
        destination = session_dir / filename

    destination.write_bytes(content)

    relative_path = f"training_images/{session_id}/{filename}"

    record = TrainingImageRecord(
        id=record_id,
        session_id=session_id,
        legal_version=legal_version,
        consent_accepted=consent_accepted,
        privacy_accepted=privacy_accepted,
        allow_training_storage=True,
        image_path=relative_path,
        detected_conditions_json=json.dumps(detected_conditions or []),
        source="totem",
        created_at=datetime.now(timezone.utc),
    )

    if db is not None:
        db.add(record)
        db.flush()

    return record


def ephemeral_image_meta(size_bytes: int) -> dict[str, object]:
    """Metadatos de imagen no persistida (solo diagnóstico temporal)."""
    return {
        "filename": "",
        "path": "",
        "size_bytes": size_bytes,
        "stored": False,
    }
