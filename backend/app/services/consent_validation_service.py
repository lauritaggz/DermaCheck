"""Validación de consentimiento en endpoints de análisis (tótem)."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException, status


def parse_bool_form(value: str | bool) -> bool:
    if isinstance(value, bool):
        return value
    normalized = value.strip().lower()
    return normalized in {"true", "1", "yes", "on"}


@dataclass(frozen=True)
class AnalysisConsentContext:
    consent_accepted: bool
    privacy_accepted: bool
    allow_training_storage: bool
    legal_version: str
    session_id: str


def validate_analysis_consent_fields(
    *,
    consent_accepted: str,
    privacy_accepted: str,
    allow_training_storage: str,
    legal_version: str,
    session_id: str,
) -> AnalysisConsentContext:
    consent_ok = parse_bool_form(consent_accepted)
    privacy_ok = parse_bool_form(privacy_accepted)

    if not consent_ok or not privacy_ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe aceptar el consentimiento informado y la política de privacidad.",
        )

    sid = session_id.strip()
    if not sid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id es obligatorio para el flujo de análisis.",
        )

    version = legal_version.strip()
    if not version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="legal_version es obligatorio.",
        )

    return AnalysisConsentContext(
        consent_accepted=consent_ok,
        privacy_accepted=privacy_ok,
        allow_training_storage=parse_bool_form(allow_training_storage),
        legal_version=version,
        session_id=sid,
    )
