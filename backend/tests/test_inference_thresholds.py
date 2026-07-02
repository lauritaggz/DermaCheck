"""Tests del resolvedor central de umbrales YOLO."""

from __future__ import annotations

from app.config import settings
from app.services.inference_thresholds import get_inference_thresholds


def test_get_inference_thresholds_reads_defaults():
    thresholds = get_inference_thresholds()
    assert thresholds.derm_conf == settings.derm_conf_threshold
    assert thresholds.expression_lines_conf == settings.expression_lines_conf_threshold


def test_get_inference_thresholds_reflects_settings_override(monkeypatch):
    monkeypatch.setattr(settings, "derm_conf_threshold", 0.30)
    monkeypatch.setattr(settings, "expression_lines_conf_threshold", 0.70)

    thresholds = get_inference_thresholds()
    assert thresholds.derm_conf == 0.30
    assert thresholds.expression_lines_conf == 0.70
