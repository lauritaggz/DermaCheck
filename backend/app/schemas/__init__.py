"""
Esquemas Pydantic para análisis facial.
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

__all__ = [
    "AnalysisResponse",
    "AnalysisResult",
    "DetectionBox",
    "ErrorDetail",
    "ErrorResponse",
    "ImageInfo",
    "InferenceResponse",
]
