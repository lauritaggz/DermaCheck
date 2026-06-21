"""Esquemas para envío de resumen por correo."""

from __future__ import annotations

import re

from pydantic import BaseModel, Field, field_validator

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class EmailConditionSummary(BaseModel):
    """Campos del diagnóstico usados en la plantilla del correo (sin imágenes)."""

    label: str = Field(..., min_length=1)
    confianza_promedio: float = Field(..., ge=0.0, le=1.0)
    cantidad_detecciones: int = Field(..., ge=1)
    id: str = ""
    descripcion: str = ""
    recomendaciones: list[str] = Field(default_factory=list)
    advertencias: list[str] = Field(default_factory=list)
    sugiere_consulta_dermatologo: bool = False


class EmailDiagnosisSummary(BaseModel):
    """Resumen del diagnóstico para generar el correo."""

    resumen_general: str = Field(..., min_length=1)
    severidad_general: str = Field(..., min_length=1)
    requiere_evaluacion: bool
    condiciones_detectadas: list[EmailConditionSummary] = Field(default_factory=list)
    advertencias_generales: list[str] = Field(default_factory=list)
    consejos_generales: list[str] = Field(default_factory=list)


class AnalysisSummaryPayload(BaseModel):
    """Datos mínimos del análisis necesarios para generar el correo."""

    diagnosis: EmailDiagnosisSummary
    timestamp: str = Field(..., min_length=1)
    ok: bool = True


class SendSummaryEmailRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    analysis_result: AnalysisSummaryPayload

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed or not EMAIL_PATTERN.match(trimmed):
            raise ValueError("El correo ingresado no es válido.")
        return trimmed


class SendSummaryEmailResponse(BaseModel):
    success: bool
    message: str
