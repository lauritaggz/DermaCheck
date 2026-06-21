"""Formateo de fechas para la UI y correos (zona horaria Chile)."""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.config import settings

MONTHS_ES = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)


def app_timezone() -> ZoneInfo:
    return ZoneInfo(settings.app_timezone)


def parse_iso_datetime(iso: str) -> datetime:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def format_datetime_local(iso: str) -> str:
    """Convierte ISO (UTC) a hora local configurada, p. ej. America/Santiago."""
    try:
        local = parse_iso_datetime(iso).astimezone(app_timezone())
    except ValueError:
        return iso
    month = MONTHS_ES[local.month - 1]
    return f"{local.day} de {month} de {local.year}, {local.strftime('%H:%M')}"
