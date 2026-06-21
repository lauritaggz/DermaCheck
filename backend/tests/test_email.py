"""
Pruebas del endpoint de envío de resumen por correo.

Ejecutar: pytest backend/tests/test_email.py -v
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import Base
from app.schemas.email import AnalysisSummaryPayload
from app.services.email.build_analysis_email_html import build_analysis_email_html
from app.services.email.email_content_helpers import MEDICAL_DISCLAIMER
from app.services.datetime_display import format_datetime_local
from app.services.email.rate_limit import InMemoryRateLimiter
from app.services.email_service import email_service

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def _condition(
    *,
    label: str,
    condition_id: str = "",
    confidence: float = 0.72,
    descripcion: str = "",
    recomendaciones: list[str] | None = None,
) -> dict:
    return {
        "id": condition_id,
        "label": label,
        "descripcion": descripcion or f"Descripción orientativa sobre {label.lower()}.",
        "confianza_promedio": confidence,
        "cantidad_detecciones": 2,
        "recomendaciones": recomendaciones or [f"Consejo específico para {label.lower()}."],
        "advertencias": [],
        "sugiere_consulta_dermatologo": False,
    }


@pytest.fixture
def sample_analysis_result() -> dict:
    return {
        "ok": True,
        "diagnosis": {
            "resumen_general": "Se observan signos leves compatibles con afecciones cutáneas menores.",
            "severidad_general": "leve",
            "requiere_evaluacion": False,
            "condiciones_detectadas": [_condition(label="Acné", condition_id="acne")],
            "advertencias_generales": [],
            "consejos_generales": ["Usa protector solar diariamente."],
        },
        "timestamp": "2026-06-09T12:00:00+00:00",
    }


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    from app.services import email_service as email_service_module

    email_service_module._rate_limiter = InMemoryRateLimiter(
        max_requests=settings.email_rate_limit_per_minute,
        window_seconds=60,
    )
    yield


@pytest.fixture
def mock_provider():
    provider = AsyncMock()
    provider.send_html = AsyncMock(return_value=None)
    email_service._provider = provider
    with patch.object(settings, "email_enabled", True):
        yield provider
    email_service._provider = None


class TestSendSummaryEmail:
    ENDPOINT = "/api/v1/analysis/send-summary-email"

    def test_success(self, client, sample_analysis_result, mock_provider):
        response = client.post(
            self.ENDPOINT,
            json={
                "email": "usuario@correo.com",
                "analysis_result": sample_analysis_result,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "enviado correctamente" in data["message"].lower()
        mock_provider.send_html.assert_awaited_once()

    def test_invalid_email(self, client, sample_analysis_result, mock_provider):
        response = client.post(
            self.ENDPOINT,
            json={
                "email": "correo-invalido",
                "analysis_result": sample_analysis_result,
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        mock_provider.send_html.assert_not_called()

    def test_email_disabled(self, client, sample_analysis_result):
        email_service._provider = AsyncMock()
        with patch.object(settings, "email_enabled", False):
            response = client.post(
                self.ENDPOINT,
                json={
                    "email": "usuario@correo.com",
                    "analysis_result": sample_analysis_result,
                },
            )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        data = response.json()
        assert data["success"] is False
        assert "no está habilitado" in data["message"].lower()


class TestBuildAnalysisEmailHtml:
    def test_email_date_uses_chile_timezone(self):
        label = format_datetime_local("2026-06-09T12:00:00+00:00")
        assert "9 de junio de 2026" in label
        assert "08:00" in label

    def _html_from(self, payload: dict) -> str:
        parsed = AnalysisSummaryPayload.model_validate(payload)
        return build_analysis_email_html(parsed.diagnosis, parsed.timestamp)

    def test_acne_email_contains_required_blocks(self, sample_analysis_result):
        html = self._html_from(sample_analysis_result)

        assert "DermaCheck" in html
        assert "9 de junio de 2026" in html
        assert "08:00" in html
        assert "Resumen de análisis dermatológico" in html
        assert "Afección detectada" in html
        assert "Recomendaciones" in html
        assert "3 componentes principales sugeridos" in html
        assert "Ácido salicílico" in html
        assert "Niacinamida" in html
        assert "Peróxido de benzoilo" in html
        assert MEDICAL_DISCLAIMER in html

    def test_manchas_email_uses_pigmentation_components(self):
        payload = {
            "ok": True,
            "timestamp": "2026-06-09T12:00:00+00:00",
            "diagnosis": {
                "resumen_general": "Se observan manchas en la piel.",
                "severidad_general": "leve",
                "requiere_evaluacion": False,
                "condiciones_detectadas": [
                    _condition(
                        label="Manchas / hiperpigmentación",
                        condition_id="manchas",
                        confidence=0.81,
                    )
                ],
                "advertencias_generales": [],
                "consejos_generales": [],
            },
        }
        html = self._html_from(payload)

        assert "Manchas / hiperpigmentación" in html
        assert "Vitamina C" in html
        assert "Protector solar SPF 50+" in html

    def test_no_clear_condition_uses_general_fallback(self):
        payload = {
            "ok": True,
            "timestamp": "2026-06-09T12:00:00+00:00",
            "diagnosis": {
                "resumen_general": "No se identificaron afecciones claras.",
                "severidad_general": "ninguna",
                "requiere_evaluacion": False,
                "condiciones_detectadas": [],
                "advertencias_generales": [],
                "consejos_generales": [],
            },
        }
        html = self._html_from(payload)

        assert "No se detectaron afecciones significativas" in html
        assert "Limpieza suave" in html
        assert "Ceramidas" in html
        assert "Glicerina" in html

    def test_empty_recommendations_falls_back_to_general_tips(self):
        payload = {
            "ok": True,
            "timestamp": "2026-06-09T12:00:00+00:00",
            "diagnosis": {
                "resumen_general": "Piel aparentemente estable.",
                "severidad_general": "leve",
                "requiere_evaluacion": False,
                "condiciones_detectadas": [
                    {
                        "id": "unknown",
                        "label": "Hallazgo leve",
                        "descripcion": "Descripción general.",
                        "confianza_promedio": 0.55,
                        "cantidad_detecciones": 1,
                        "recomendaciones": [],
                        "advertencias": [],
                        "sugiere_consulta_dermatologo": False,
                    }
                ],
                "advertencias_generales": [],
                "consejos_generales": ["Mantén una rutina simple y constante."],
            },
        }
        html = self._html_from(payload)

        assert "Recomendaciones" in html
        assert "Mantén una rutina simple y constante." in html

    def test_multiple_conditions_lists_all_affections_and_merges_content(self):
        payload = {
            "ok": True,
            "timestamp": "2026-06-09T12:00:00+00:00",
            "diagnosis": {
                "resumen_general": "Se observan varios hallazgos cutáneos leves.",
                "severidad_general": "leve",
                "requiere_evaluacion": False,
                "condiciones_detectadas": [
                    _condition(
                        label="Acné",
                        condition_id="acne",
                        confidence=0.82,
                        recomendaciones=["Usa limpiador suave para acné."],
                    ),
                    _condition(
                        label="Manchas / hiperpigmentación",
                        condition_id="manchas",
                        confidence=0.71,
                        recomendaciones=["Aplica protector solar a diario."],
                    ),
                ],
                "advertencias_generales": [],
                "consejos_generales": [],
            },
        }
        html = self._html_from(payload)

        assert "Afecciones detectadas" in html
        assert "Acné" in html
        assert "Manchas / hiperpigmentación" in html
        assert "Usa limpiador suave para acné." in html
        assert "Aplica protector solar a diario." in html
        assert "Ácido salicílico" in html
        assert "Vitamina C" in html
        assert "Componentes sugeridos según tus hallazgos" in html
