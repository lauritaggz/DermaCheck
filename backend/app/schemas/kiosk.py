"""Schemas de configuración del tótem."""

from __future__ import annotations

from pydantic import BaseModel, Field


class InferenceThresholdsConfig(BaseModel):
    derm_conf: float = Field(..., ge=0.0, le=1.0)
    expression_lines_conf: float = Field(..., ge=0.0, le=1.0)


class KioskConfigResponse(BaseModel):
    user_id: str
    inference_thresholds: InferenceThresholdsConfig
