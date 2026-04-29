"""
Esquemas Pydantic para el módulo de análisis facial con IA.
Define modelos de respuesta estructurados y validados.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class DetectionBox(BaseModel):
    """Representa una detección individual del modelo YOLO."""

    class_id: int = Field(..., description="ID de la clase detectada", ge=0)
    class_name: str = Field(..., description="Nombre de la afección detectada")
    confidence: float = Field(..., description="Confianza del modelo (0-1)", ge=0.0, le=1.0)
    bbox: list[float] = Field(
        ..., description="Coordenadas de la caja [x1, y1, x2, y2]", min_length=4, max_length=4
    )

    @field_validator("bbox")
    @classmethod
    def validate_bbox(cls, v: list[float]) -> list[float]:
        """Valida que las coordenadas del bounding box sean correctas."""
        if len(v) != 4:
            raise ValueError("bbox debe tener exactamente 4 coordenadas")
        x1, y1, x2, y2 = v
        if x2 <= x1 or y2 <= y1:
            raise ValueError("Coordenadas de bbox inválidas: x2 > x1 y y2 > y1")
        return v


class ImageInfo(BaseModel):
    """Información de la imagen analizada."""

    filename: str = Field(..., description="Nombre del archivo de imagen")
    path: str = Field(..., description="Ruta relativa donde se guardó la imagen")
    size_bytes: int | None = Field(None, description="Tamaño del archivo en bytes", ge=0)


class AnalysisResult(BaseModel):
    """Resultado completo del análisis facial."""

    model_config = {"protected_namespaces": ()}  # Permitir campos que empiecen con "model_"

    model_conf_threshold: float = Field(
        ..., description="Umbral de confianza usado", ge=0.0, le=1.0
    )
    total_detections: int = Field(..., description="Número total de detecciones", ge=0)
    detections: list[DetectionBox] = Field(
        default_factory=list, description="Lista de detecciones"
    )
    processing_time_ms: float | None = Field(
        None, description="Tiempo de procesamiento en milisegundos", ge=0.0
    )


class AnalysisResponse(BaseModel):
    """Respuesta completa del endpoint de análisis facial."""

    ok: bool = Field(True, description="Indica si el análisis fue exitoso")
    user_id: str = Field(..., description="ID del usuario que solicitó el análisis")
    image: ImageInfo = Field(..., description="Información de la imagen analizada")
    analysis: AnalysisResult = Field(..., description="Resultados del análisis")
    timestamp: str | None = Field(None, description="Timestamp del análisis (ISO 8601)")


class InferenceResponse(BaseModel):
    """Respuesta simplificada del endpoint de inferencia."""

    user_id: str = Field(..., description="ID del usuario")
    filename: str | None = Field(None, description="Nombre del archivo")
    total_detections: int = Field(..., description="Número de detecciones", ge=0)
    detections: list[DetectionBox] = Field(
        default_factory=list, description="Lista de detecciones"
    )
    processing_time_ms: float | None = Field(
        None, description="Tiempo de procesamiento en ms", ge=0.0
    )


class ErrorDetail(BaseModel):
    """Detalle de un error en el análisis."""

    code: str = Field(..., description="Código del error")
    message: str = Field(..., description="Mensaje descriptivo del error")
    detail: str | None = Field(None, description="Detalles adicionales")


class ErrorResponse(BaseModel):
    """Respuesta de error estructurada."""

    ok: bool = Field(False, description="Siempre False para errores")
    error: ErrorDetail = Field(..., description="Información del error")
    timestamp: str | None = Field(None, description="Timestamp del error (ISO 8601)")
