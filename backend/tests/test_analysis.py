"""
Pruebas funcionales y de integración para el endpoint de análisis facial.

Cubre los criterios de aceptación de la HU 5:
- El sistema procesa la imagen con el modelo de IA entrenado
- El sistema detecta afecciones dermatológicas cuando corresponda
- El sistema genera resultados por tipo de afección
- El sistema asocia nivel/grado de presencia (confidence)
- Si el análisis no puede completarse, se informa el error

Ejecutar con: pytest backend/tests/test_analysis.py -v
"""

from __future__ import annotations

import io
from pathlib import Path

import pytest
from PIL import Image
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import AppUser, Base, SkinAnalysis, TrainingImageRecord
from app.seed_legal_documents import seed_legal_documents
from app.services.training_image_storage_service import TRAINING_ROOT
from app.services.analysis_job_queue import JOB_QUEUE_ROOT


from sqlalchemy.pool import StaticPool

# Configuración de base de datos de prueba en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la dependencia de DB para usar DB de prueba."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def patch_worker_session_local(monkeypatch):
    """El worker de la cola usa SessionLocal propio; alinearlo con la DB de test."""
    monkeypatch.setattr(
        "app.services.analysis_job_queue.SessionLocal",
        TestingSessionLocal,
    )


@pytest.fixture(scope="function", autouse=True)
def test_db():
    """Crea las tablas antes de cada test y las elimina después."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_legal_documents(db)
    db.commit()
    db.close()
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)
    if TRAINING_ROOT.exists():
        for path in sorted(TRAINING_ROOT.rglob("*"), reverse=True):
            if path.is_file():
                path.unlink()
            elif path.is_dir() and path != TRAINING_ROOT:
                try:
                    path.rmdir()
                except OSError:
                    pass
    if JOB_QUEUE_ROOT.exists():
        for path in sorted(JOB_QUEUE_ROOT.rglob("*"), reverse=True):
            if path.is_file():
                path.unlink()
            elif path.is_dir() and path != JOB_QUEUE_ROOT:
                try:
                    path.rmdir()
                except OSError:
                    pass


@pytest.fixture(scope="module")
def client():
    """Cliente de prueba de FastAPI (lifespan activo para cola de análisis)."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user(test_db: Session):
    """Crea un usuario de prueba en la DB."""
    user = AppUser(
        email="test@dermacheck.com",
        password_hash="hashed_password",
        name="Test User",
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def sample_image():
    """Genera una imagen de prueba simple (100x100 RGB)."""
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)
    return img_bytes


class TestAnalysisInferenceEndpoint:
    """Pruebas para el endpoint /api/v1/analysis/inference"""

    def test_inference_success(self, client: TestClient, sample_image):
        """Test: Inferencia exitosa con imagen válida."""
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "user_id" in data
        assert "filename" in data
        assert "total_detections" in data
        assert "detections" in data
        assert "processing_time_ms" in data
        
        assert data["user_id"] == "1"
        assert isinstance(data["total_detections"], int)
        assert data["total_detections"] >= 0
        assert isinstance(data["detections"], list)
        assert isinstance(data["processing_time_ms"], (int, float))
        assert data["processing_time_ms"] > 0

    def test_inference_invalid_format(self, client: TestClient):
        """Test: Rechazo de formato de imagen no soportado."""
        fake_file = io.BytesIO(b"fake pdf content")
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.pdf", fake_file, "application/pdf")},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "no soportado" in response.json()["detail"].lower()

    def test_inference_empty_file(self, client: TestClient):
        """Test: Rechazo de archivo vacío."""
        empty_file = io.BytesIO(b"")
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("empty.jpg", empty_file, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "vacío" in response.json()["detail"].lower()

    def test_inference_large_file(self, client: TestClient):
        """Test: Rechazo de archivo demasiado grande (>12MB)."""
        # Crear imagen fake que exceda el límite
        large_content = b"x" * (13 * 1024 * 1024)  # 13MB
        large_file = io.BytesIO(large_content)
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("large.jpg", large_file, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE


class TestAnalysisFullEndpoint:
    """Pruebas para el endpoint /api/v1/analysis/face-analyze"""

    def test_face_analyze_success(
        self, client: TestClient, test_user: AppUser, sample_image, test_db: Session, monkeypatch
    ):
        """Test: Análisis completo exitoso con registro en DB."""
        monkeypatch.setattr(settings, "derm_conf_threshold", 0.30)
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-face-analyze",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verificar estructura de respuesta
        assert data["ok"] is True
        assert data["user_id"] == str(test_user.id)
        assert "image" in data
        assert "analysis" in data
        assert "timestamp" in data
        
        # Verificar imagen
        img_data = data["image"]
        assert "filename" in img_data
        assert "path" in img_data
        assert "size_bytes" in img_data
        assert img_data["size_bytes"] > 0
        
        # Verificar análisis
        analysis_data = data["analysis"]
        assert analysis_data["model_conf_threshold"] == 0.30
        assert "total_detections" in analysis_data
        assert "detections" in analysis_data
        assert "processing_time_ms" in analysis_data
        assert analysis_data["processing_time_ms"] > 0
        
        # Sin consentimiento de entrenamiento no se persiste registro con imagen
        analyses = test_db.execute(
            select(SkinAnalysis).where(SkinAnalysis.user_id == test_user.id)
        ).scalars().all()
        
        assert len(analyses) == 0

        # Verificar diagnóstico (HU08)
        assert "diagnosis" in data
        diag = data["diagnosis"]
        assert "condiciones_detectadas" in diag
        for cond in diag["condiciones_detectadas"]:
            assert "recomendaciones" in cond
            assert isinstance(cond["recomendaciones"], list)
            assert "sugiere_consulta_dermatologo" in cond
            assert isinstance(cond["sugiere_consulta_dermatologo"], bool)

    def test_face_analyze_user_not_found(self, client: TestClient, sample_image):
        """Test: Error cuando el usuario no existe."""
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={
                "user_id": "999",
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-404",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "no encontrado" in response.json()["detail"].lower()

    def test_face_analyze_invalid_user_id(self, client: TestClient, sample_image):
        """Test: Error con user_id inválido."""
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={
                "user_id": "invalid",
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-invalid",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "inválido" in response.json()["detail"].lower()


class TestAnalysisDoubleEndpoint:
    """Pruebas para POST /api/v1/analysis/face-analyze-total-double"""

    def test_face_analyze_total_double_success(
        self, client: TestClient, test_user: AppUser, sample_image, monkeypatch
    ):
        """Test: análisis doble fusiona detecciones y omite líneas de expresión."""
        call_count = {"n": 0}

        def mock_run_inference(content, conf):
            call_count["n"] += 1
            label = "acne" if call_count["n"] == 1 else "rosacea"
            return [
                {
                    "class_id": 0,
                    "class_name": label,
                    "confidence": 0.9,
                    "bbox": [0.1, 0.1, 0.2, 0.2],
                }
            ]

        monkeypatch.setattr(
            "app.services.analysis_pipeline_service.run_inference",
            mock_run_inference,
        )

        img1 = io.BytesIO(sample_image.getvalue())
        img2 = io.BytesIO(sample_image.getvalue())

        response = client.post(
            "/api/v1/analysis/face-analyze-total-double",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-double",
            },
            files=[
                ("face_image_1", ("face1.jpg", img1, "image/jpeg")),
                ("face_image_2", ("face2.jpg", img2, "image/jpeg")),
            ],
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["analysis_type"] == "combined_facial_analysis_double"
        assert data["images_processed"] == 2
        assert len(data["images"]) == 2
        assert data["expression_lines"]["detected"] is False
        assert data["expression_lines"]["detections"] == []
        assert data["combined_diagnosis"]["has_expression_lines"] is False
        assert data["affections"]["analysis"]["total_detections"] == 2
        assert len(data["affections"]["analysis"]["detections"]) == 2

    def test_face_analyze_total_double_missing_image(
        self, client: TestClient, test_user: AppUser, sample_image
    ):
        """Test: error cuando falta la segunda imagen."""
        response = client.post(
            "/api/v1/analysis/face-analyze-total-double",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-double-missing",
            },
            files={"face_image_1": ("face1.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_face_analyze_total_double_invalid_image_type(
        self, client: TestClient, test_user: AppUser, sample_image
    ):
        """Test: error claro cuando una imagen tiene formato inválido."""
        response = client.post(
            "/api/v1/analysis/face-analyze-total-double",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "true",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-double-invalid",
            },
            files=[
                ("face_image_1", ("face1.jpg", sample_image, "image/jpeg")),
                ("face_image_2", ("face2.txt", b"not an image", "text/plain")),
            ],
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "una de las imágenes enviadas" in response.json()["detail"].lower()


class TestDetectionValidation:
    """Pruebas para validar la estructura de las detecciones."""

    def test_detection_structure(self, client: TestClient, sample_image):
        """Test: Cada detección tiene la estructura correcta."""
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        for detection in data["detections"]:
            # Verificar campos requeridos
            assert "class_id" in detection
            assert "class_name" in detection
            assert "confidence" in detection
            assert "bbox" in detection
            
            # Verificar tipos
            assert isinstance(detection["class_id"], int)
            assert isinstance(detection["class_name"], str)
            assert isinstance(detection["confidence"], (int, float))
            assert isinstance(detection["bbox"], list)
            
            # Verificar rangos válidos
            assert detection["class_id"] >= 0
            assert 0.0 <= detection["confidence"] <= 1.0
            assert len(detection["bbox"]) == 4
            
            # Verificar que bbox es válido [x1, y1, x2, y2]
            x1, y1, x2, y2 = detection["bbox"]
            assert x2 > x1
            assert y2 > y1


class TestPerformance:
    """Pruebas de rendimiento del endpoint."""

    def test_processing_time_acceptable(self, client: TestClient, sample_image):
        """Test: El tiempo de procesamiento es aceptable (< 5 segundos)."""
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        processing_time_ms = data["processing_time_ms"]
        # El tiempo debe ser razonable (< 5000ms para imagen de prueba)
        assert processing_time_ms < 5000, f"Procesamiento muy lento: {processing_time_ms}ms"
        
        print(f"⏱️  Tiempo de procesamiento: {processing_time_ms:.2f}ms")


class TestErrorHandling:
    """Pruebas de manejo de errores."""

    def test_model_not_found_error(self, client: TestClient, sample_image, monkeypatch):
        """Test: Error cuando el modelo no se encuentra."""
        # Simular que el modelo no existe
        def mock_run_inference(*args, **kwargs):
            raise FileNotFoundError("Modelo no encontrado")
        
        monkeypatch.setattr("app.routers.analysis_inference.run_inference", mock_run_inference)
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    def test_inference_generic_error(self, client: TestClient, sample_image, monkeypatch):
        """Test: Error genérico durante la inferencia."""
        def mock_run_inference(*args, **kwargs):
            raise RuntimeError("Error en procesamiento")
        
        monkeypatch.setattr("app.routers.analysis_inference.run_inference", mock_run_inference)
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def _consent_form(*, allow_training: bool = False, session_id: str = "sess-test-001") -> dict[str, str]:
    return {
        "consent_accepted": "true",
        "privacy_accepted": "true",
        "allow_training_storage": "true" if allow_training else "false",
        "legal_version": "2.0",
        "session_id": session_id,
    }


def _mock_combined_total(content: bytes):
    from types import SimpleNamespace

    detection = SimpleNamespace(class_name="acne", model_dump=lambda: {"class_name": "acne"})
    diagnosis = {
        "resumen_general": "Análisis de prueba",
        "severidad_general": "leve",
        "requiere_evaluacion": False,
        "condiciones_detectadas": [],
        "disclaimer": "Orientativo",
        "mensaje_severidad": {"titulo": "Leve", "mensaje": "Seguimiento"},
        "advertencias_generales": [],
        "consejos_generales": [],
    }
    return SimpleNamespace(
        detections=[detection],
        payload={
            "analysis_type": "combined_facial_analysis",
            "affections": {
                "analysis": {
                    "model_conf_threshold": 0.25,
                    "total_detections": 1,
                    "detections": [{"class_name": "acne"}],
                },
                "diagnosis": diagnosis,
            },
            "expression_lines": {"detected": False, "detections": []},
            "combined_diagnosis": {
                "has_affection_findings": True,
                "has_expression_lines": False,
                "summary": "test",
            },
        },
    )


class TestKioskConsentStorage:
    def test_analysis_without_training_does_not_persist_image(
        self,
        client: TestClient,
        test_user: AppUser,
        sample_image,
        test_db: Session,
        monkeypatch,
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        response = client.post(
            "/api/v1/analysis/face-analyze-total",
            data={
                "user_id": str(test_user.id),
                **_consent_form(allow_training=False),
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["image"]["stored"] is False
        assert data["image"]["path"] == ""

        analyses = test_db.execute(select(SkinAnalysis)).scalars().all()
        assert len(analyses) == 0

        training_rows = test_db.execute(select(TrainingImageRecord)).scalars().all()
        assert len(training_rows) == 0

    def test_analysis_with_training_persists_metadata_and_file(
        self,
        client: TestClient,
        test_user: AppUser,
        sample_image,
        test_db: Session,
        monkeypatch,
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        session_id = "sess-training-001"
        response = client.post(
            "/api/v1/analysis/face-analyze-total",
            data={
                "user_id": str(test_user.id),
                **_consent_form(allow_training=True, session_id=session_id),
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["image"]["stored"] is True
        assert "analysis_" in data["image"]["path"]
        assert data["image"]["path"].startswith("training_images/")

        records = test_db.execute(
            select(TrainingImageRecord).where(TrainingImageRecord.session_id == session_id)
        ).scalars().all()
        assert len(records) == 1
        record = records[0]
        assert record.allow_training_storage is True
        assert record.source == "totem"

        disk_path = Path(__file__).resolve().parent.parent / "storage" / record.image_path
        assert disk_path.is_file()

    def test_analysis_rejected_without_consent(
        self,
        client: TestClient,
        test_user: AppUser,
        sample_image,
    ):
        response = client.post(
            "/api/v1/analysis/face-analyze-total",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "false",
                "privacy_accepted": "true",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-deny",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_analysis_rejected_without_privacy(
        self,
        client: TestClient,
        test_user: AppUser,
        sample_image,
    ):
        response = client.post(
            "/api/v1/analysis/face-analyze-total",
            data={
                "user_id": str(test_user.id),
                "consent_accepted": "true",
                "privacy_accepted": "false",
                "allow_training_storage": "false",
                "legal_version": "2.0",
                "session_id": "sess-deny-privacy",
            },
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_duplicate_single_capture_not_saved_twice(
        self,
        client: TestClient,
        test_user: AppUser,
        sample_image,
        test_db: Session,
        monkeypatch,
    ):
        monkeypatch.setattr(
            "app.services.analysis_execution_service.analyze_face_total",
            lambda content, derm_conf, expression_lines_conf: _mock_combined_total(content),
        )

        session_id = "sess-dedupe-001"
        form = {
            "user_id": str(test_user.id),
            **_consent_form(allow_training=True, session_id=session_id),
        }
        files = {"face_image": ("face.jpg", sample_image, "image/jpeg")}

        first = client.post("/api/v1/analysis/face-analyze-total", data=form, files=files)
        second = client.post("/api/v1/analysis/face-analyze-total", data=form, files=files)

        assert first.status_code == status.HTTP_200_OK
        assert second.status_code == status.HTTP_200_OK

        records = test_db.execute(
            select(TrainingImageRecord).where(TrainingImageRecord.session_id == session_id)
        ).scalars().all()
        assert len(records) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
