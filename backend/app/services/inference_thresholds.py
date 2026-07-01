"""Umbrales de confianza YOLO — punto único de lectura desde settings."""

from __future__ import annotations

from dataclasses import dataclass

from app.config import settings


@dataclass(frozen=True)
class InferenceThresholds:
    derm_conf: float
    expression_lines_conf: float


def get_inference_thresholds() -> InferenceThresholds:
    return InferenceThresholds(
        derm_conf=settings.derm_conf_threshold,
        expression_lines_conf=settings.expression_lines_conf_threshold,
    )
