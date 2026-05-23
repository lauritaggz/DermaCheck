"""
Esquemas para análisis facial combinado (dermatología + líneas de expresión).
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.schemas.diagnosis import DiagnosisResult


class AffectionsAnalysisBlock(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_conf_threshold: float = Field(..., ge=0.0, le=1.0)
    total_detections: int = Field(..., ge=0)
    detections: list[dict[str, Any]] = Field(default_factory=list)
    processing_time_ms: float | None = Field(None, ge=0.0)


class AffectionsBlock(BaseModel):
    analysis: AffectionsAnalysisBlock
    diagnosis: DiagnosisResult


class CombinedDiagnosisSummary(BaseModel):
    has_affection_findings: bool
    has_expression_lines: bool
    summary: str


class CombinedFacialAnalysisResponse(BaseModel):
    ok: bool = True
    user_id: str
    image: dict[str, Any]
    analysis_type: str = "combined_facial_analysis"
    affections: AffectionsBlock
    expression_lines: dict[str, Any]
    combined_diagnosis: CombinedDiagnosisSummary
    timestamp: str
    processing_time_ms: float | None = Field(None, ge=0.0)
