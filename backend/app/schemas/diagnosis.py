"""
Esquemas Pydantic para el módulo de diagnóstico preliminar.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class DetectedCondition(BaseModel):
    """Condición detectada con información médica (solo diagnóstico, sin tratamiento específico)."""

    id: str = Field(..., description="ID de la condición (ej: 'acne')")
    label: str = Field(..., description="Nombre de la condición en español")
    confianza_promedio: float = Field(..., description="Confianza promedio (0-1)", ge=0.0, le=1.0)
    cantidad_detecciones: int = Field(..., description="Número de detecciones", ge=1)
    descripcion: str = Field(..., description="Descripción médica de la condición")
    advertencias: list[str] = Field(default_factory=list, description="Advertencias médicas")
    color_ui: str = Field(..., description="Color para UI (blue, red, amber, green)")


class DiagnosisResult(BaseModel):
    """Resultado completo del diagnóstico preliminar."""

    resumen_general: str = Field(..., description="Resumen del estado de la piel")
    severidad_general: str = Field(
        ..., description="Severidad global (ninguna, leve, moderada, severa)"
    )
    requiere_evaluacion: bool = Field(
        ..., description="Si requiere evaluación médica presencial"
    )
    condiciones_detectadas: list[DetectedCondition] = Field(
        default_factory=list, description="Lista de condiciones detectadas"
    )
    disclaimer: str = Field(..., description="Disclaimer médico legal")
    mensaje_severidad: dict[str, str] = Field(
        ..., description="Mensaje contextual según severidad"
    )
    advertencias_generales: list[str] = Field(
        default_factory=list,
        description="Advertencias si requiere evaluación"
    )
    consejos_generales: list[str] = Field(
        default_factory=list, description="Consejos generales de cuidado"
    )


class DiagnosisResponse(BaseModel):
    """Respuesta completa: análisis + diagnóstico."""

    ok: bool = Field(True, description="Indica si el análisis fue exitoso")
    user_id: str = Field(..., description="ID del usuario")
    image: dict = Field(..., description="Información de la imagen analizada")
    analysis: dict = Field(..., description="Resultados del análisis (detecciones)")
    diagnosis: DiagnosisResult = Field(..., description="Diagnóstico preliminar")
    timestamp: str = Field(..., description="Timestamp ISO 8601")
