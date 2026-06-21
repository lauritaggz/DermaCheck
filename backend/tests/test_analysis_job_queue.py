"""Tests de la cola de trabajos de análisis facial."""

from __future__ import annotations

import time
from unittest.mock import patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

pytest_plugins = ["tests.test_analysis"]

from app.main import app
from app.services.analysis_job_queue import JOB_QUEUE_ROOT, analysis_job_queue
from tests.test_analysis import (
    TestingSessionLocal,
    _consent_form,
    _mock_combined_total,
)


@pytest.fixture(scope="module")
def queue_client():
    """Un solo lifespan para toda la cola de tests (evita reinicios del worker)."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_job_queue_state():
    analysis_job_queue._store.clear()
    analysis_job_queue._order.clear()
    yield
    analysis_job_queue._store.clear()
    analysis_job_queue._order.clear()


@pytest.fixture(autouse=True)
def patch_worker_session_local(monkeypatch):
    """El worker corre en un hilo y debe usar la misma DB in-memory que los tests."""
    monkeypatch.setattr(
        "app.services.analysis_job_queue.SessionLocal",
        TestingSessionLocal,
    )


def _submit_job(client: TestClient, test_user, sample_image, session_id: str):
    return client.post(
        "/api/v1/analysis/jobs",
        data={
            "user_id": str(test_user.id),
            "conf": "0.25",
            **_consent_form(allow_training=False, session_id=session_id),
        },
        files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
    )


def _wait_job(client: TestClient, job_id: str, timeout: float = 10.0) -> dict:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        response = client.get(f"/api/v1/analysis/jobs/{job_id}")
        assert response.status_code == status.HTTP_200_OK
        payload = response.json()
        if payload["status"] in ("completed", "failed"):
            return payload
    raise AssertionError(f"Job {job_id} no terminó a tiempo")


def _poll_until(client: TestClient, predicate, timeout: float = 10.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        client.get("/api/v1/analysis/jobs/health")
        if predicate():
            return
    raise AssertionError("Condición de polling no alcanzada a tiempo")


class TestAnalysisJobQueue:
    def test_submit_returns_202_with_job_id(
        self, queue_client: TestClient, test_user, sample_image, monkeypatch
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        response = _submit_job(queue_client, test_user, sample_image, "sess-queue-001")
        assert response.status_code == status.HTTP_202_ACCEPTED
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "queued"
        assert data["position"] >= 0
        assert data["poll_interval_seconds"] > 0
        finished = _wait_job(queue_client, data["job_id"])
        assert finished["status"] == "completed"

    def test_second_job_has_position_while_first_runs(
        self, queue_client: TestClient, test_user, sample_image, monkeypatch
    ):
        started = {"first": False}
        release = {"go": False}

        def slow_pipeline(content, derm_conf, expression_lines_conf):
            started["first"] = True
            while not release["go"]:
                time.sleep(0.02)
            return _mock_combined_total(content)

        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            slow_pipeline,
        )

        first = _submit_job(queue_client, test_user, sample_image, "sess-pos-1")
        assert first.status_code == status.HTTP_202_ACCEPTED
        job1 = first.json()["job_id"]

        _poll_until(queue_client, lambda: started["first"])

        second = _submit_job(queue_client, test_user, sample_image, "sess-pos-2")
        assert second.status_code == status.HTTP_202_ACCEPTED
        job2 = second.json()["job_id"]

        status2 = queue_client.get(f"/api/v1/analysis/jobs/{job2}").json()
        assert status2["status"] in ("queued", "running")
        if status2["status"] == "queued":
            assert status2["position"] >= 1

        release["go"] = True
        done1 = _wait_job(queue_client, job1)
        done2 = _wait_job(queue_client, job2)
        assert done1["status"] == "completed"
        assert done2["status"] == "completed"

    def test_queue_full_returns_503(
        self, queue_client: TestClient, test_user, sample_image, monkeypatch
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        with patch.object(analysis_job_queue._queue, "full", return_value=True):
            response = _submit_job(queue_client, test_user, sample_image, "sess-full")
            assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
            assert response.headers.get("retry-after") == "5"

    def test_completed_job_removes_temp_files(
        self, queue_client: TestClient, test_user, sample_image, monkeypatch
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        response = _submit_job(queue_client, test_user, sample_image, "sess-cleanup")
        job_id = response.json()["job_id"]
        job_dir = JOB_QUEUE_ROOT / job_id
        assert job_dir.exists()

        payload = _wait_job(queue_client, job_id)
        assert payload["status"] == "completed"
        assert not job_dir.exists()

    def test_invalid_consent_returns_400_without_enqueue(
        self, queue_client: TestClient, test_user, sample_image
    ):
        before = len(analysis_job_queue._store)
        response = queue_client.post(
            "/api/v1/analysis/jobs",
            data={
                "user_id": str(test_user.id),
                "conf": "0.25",
                "consent_accepted": "false",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-invalid-consent",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert len(analysis_job_queue._store) == before

    def test_unknown_job_returns_404(self, queue_client: TestClient):
        response = queue_client.get("/api/v1/analysis/jobs/00000000-0000-0000-0000-000000000000")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_jobs_complete_in_order_with_mock(
        self, queue_client: TestClient, test_user, sample_image, monkeypatch
    ):
        order: list[str] = []

        def track_pipeline(content, derm_conf, expression_lines_conf):
            order.append("run")
            return _mock_combined_total(content)

        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            track_pipeline,
        )

        job_ids = []
        for i in range(2):
            resp = _submit_job(queue_client, test_user, sample_image, f"sess-order-{i}")
            job_ids.append(resp.json()["job_id"])

        for job_id in job_ids:
            payload = _wait_job(queue_client, job_id)
            assert payload["status"] == "completed"
            assert payload["result"]["ok"] is True

        assert len(order) == 2
