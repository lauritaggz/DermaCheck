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

from app.database import get_db
from app.main import app
from app.models import AppUser, Base, SkinAnalysis


# Configuración de base de datos de prueba en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la dependencia de DB para usar DB de prueba."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Crea las tablas antes de cada test y las elimina después."""
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Cliente de prueba de FastAPI."""
    return TestClient(app)


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
            data={"user_id": "1", "conf": "0.25"},
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
            data={"user_id": "1", "conf": "0.25"},
            files={"file": ("test.pdf", fake_file, "application/pdf")},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "no soportado" in response.json()["detail"].lower()

    def test_inference_empty_file(self, client: TestClient):
        """Test: Rechazo de archivo vacío."""
        empty_file = io.BytesIO(b"")
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1", "conf": "0.25"},
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
            data={"user_id": "1", "conf": "0.25"},
            files={"file": ("large.jpg", large_file, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE


class TestAnalysisFull Endpoint:
    """Pruebas para el endpoint /api/v1/analysis/face-analyze"""

    def test_face_analyze_success(
        self, client: TestClient, test_user: AppUser, sample_image, test_db: Session
    ):
        """Test: Análisis completo exitoso con registro en DB."""
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={"user_id": str(test_user.id), "conf": "0.30"},
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
        
        # Verificar que se guardó en DB
        analyses = test_db.execute(
            select(SkinAnalysis).where(SkinAnalysis.user_id == test_user.id)
        ).scalars().all()
        
        assert len(analyses) == 1
        saved_analysis = analyses[0]
        assert saved_analysis.user_id == test_user.id
        assert saved_analysis.total_detections == analysis_data["total_detections"]
        assert saved_analysis.model_conf_threshold == 0.30
        assert saved_analysis.processing_time_ms > 0

    def test_face_analyze_user_not_found(self, client: TestClient, sample_image):
        """Test: Error cuando el usuario no existe."""
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={"user_id": "999", "conf": "0.25"},
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "no encontrado" in response.json()["detail"].lower()

    def test_face_analyze_invalid_user_id(self, client: TestClient, sample_image):
        """Test: Error con user_id inválido."""
        response = client.post(
            "/api/v1/analysis/face-analyze",
            data={"user_id": "invalid", "conf": "0.25"},
            files={"face_image": ("face.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "inválido" in response.json()["detail"].lower()


class TestDetectionValidation:
    """Pruebas para validar la estructura de las detecciones."""

    def test_detection_structure(self, client: TestClient, sample_image):
        """Test: Cada detección tiene la estructura correcta."""
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1", "conf": "0.25"},
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
            data={"user_id": "1", "conf": "0.25"},
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
        from app.services import inference_service
        
        def mock_run_inference(*args, **kwargs):
            raise FileNotFoundError("Modelo no encontrado")
        
        monkeypatch.setattr(inference_service, "run_inference", mock_run_inference)
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1", "conf": "0.25"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    def test_inference_generic_error(self, client: TestClient, sample_image, monkeypatch):
        """Test: Error genérico durante la inferencia."""
        from app.services import inference_service
        
        def mock_run_inference(*args, **kwargs):
            raise RuntimeError("Error en procesamiento")
        
        monkeypatch.setattr(inference_service, "run_inference", mock_run_inference)
        
        response = client.post(
            "/api/v1/analysis/inference",
            data={"user_id": "1", "conf": "0.25"},
            files={"file": ("test.jpg", sample_image, "image/jpeg")},
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
