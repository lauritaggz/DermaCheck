"""
Esquemas Pydantic para análisis facial y diagnóstico.
"""

from .analysis import (
    AnalysisResponse,
    AnalysisResult,
    DetectionBox,
    ErrorDetail,
    ErrorResponse,
    ImageInfo,
    InferenceResponse,
)
from .diagnosis import (
    DetectedCondition,
    DiagnosisResponse,
    DiagnosisResult,
)

__all__ = [
    "AnalysisResponse",
    "AnalysisResult",
    "DetectionBox",
    "ErrorDetail",
    "ErrorResponse",
    "ImageInfo",
    "InferenceResponse",
    "DetectedCondition",
    "DiagnosisResponse",
    "DiagnosisResult",
]
