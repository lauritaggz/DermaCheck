"""
Inferencia YOLOv8 para líneas de expresión (HU17).

Modelo independiente del flujo dermatológico (best.pt).
Carga perezosa del peso best_wrinkle_yolov8m.pt en memoria.
"""

from __future__ import annotations

import io
import logging
import os
import threading
from pathlib import Path
from typing import Any

from app.config import settings

logger = logging.getLogger("dermacheck.expression_lines")

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_PATH = _BACKEND_ROOT / "ml_models" / "best_wrinkle_yolov8m.pt"
MODEL_FILENAME = "best_wrinkle_yolov8m.pt"
TASK_NAME = "expression_lines"


class ExpressionLinesInferenceService:
    """Inferencia de líneas de expresión con YOLOv8m entrenado para arrugas."""

    def __init__(
        self,
        model_path: Path | str | None = None,
        default_conf: float | None = None,
    ) -> None:
        env_path = os.environ.get("DERMACHECK_EXPRESSION_LINES_MODEL_PATH")
        resolved = env_path or model_path or DEFAULT_MODEL_PATH
        self._model_path = Path(resolved)
        self._default_conf = (
            default_conf
            if default_conf is not None
            else settings.expression_lines_conf_threshold
        )
        self._model: Any | None = None
        self._lock = threading.Lock()

    @property
    def model_name(self) -> str:
        return self._model_path.name

    def _get_model(self) -> Any:
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is None:
                from ultralytics import YOLO

                if not self._model_path.exists():
                    msg = (
                        f"No se encontró el modelo de líneas de expresión en: "
                        f"{self._model_path}. Coloca {MODEL_FILENAME} en "
                        "backend/ml_models/ o define "
                        "DERMACHECK_EXPRESSION_LINES_MODEL_PATH."
                    )
                    logger.error(msg)
                    raise FileNotFoundError(msg)
                logger.info(
                    "Cargando modelo de líneas de expresión: %s", self._model_path
                )
                self._model = YOLO(str(self._model_path))
        return self._model

    @staticmethod
    def _bytes_to_rgb_image(image_bytes: bytes):
        from PIL import Image

        if not image_bytes:
            raise ValueError("La imagen está vacía")
        try:
            return Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as exc:
            logger.warning("No se pudo procesar la imagen: %s", exc)
            raise ValueError(
                "La imagen no se pudo leer o convertir a RGB"
            ) from exc

    def analyze_image(
        self,
        image_bytes: bytes,
        conf: float | None = None,
    ) -> dict[str, Any]:
        """
        Ejecuta inferencia sobre bytes de imagen y devuelve detecciones estructuradas.

        Raises:
            FileNotFoundError: si el archivo .pt no existe.
            ValueError: si la imagen no es válida.
            RuntimeError: si YOLO falla durante la inferencia.
        """
        threshold = self._default_conf if conf is None else conf
        if not 0.0 <= threshold <= 1.0:
            raise ValueError("conf debe estar entre 0.0 y 1.0")

        model = self._get_model()
        image = self._bytes_to_rgb_image(image_bytes)

        try:
            results = model(image, conf=threshold, verbose=False)
        except Exception as exc:
            logger.exception("Error en inferencia YOLO (líneas de expresión)")
            raise RuntimeError(f"Error en inferencia de líneas de expresión: {exc!s}") from exc

        detections: list[dict[str, Any]] = []
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                x1, y1, x2, y2 = (float(v) for v in box.xyxy[0].tolist())
                detections.append(
                    {
                        "class_name": model.names[cls_id],
                        "confidence": round(confidence, 4),
                        "box": {
                            "x1": round(x1, 2),
                            "y1": round(y1, 2),
                            "x2": round(x2, 2),
                            "y2": round(y2, 2),
                        },
                    }
                )

        count = len(detections)
        average_confidence = (
            round(sum(d["confidence"] for d in detections) / count, 4) if count else 0.0
        )

        payload = {
            "detected": count > 0,
            "count": count,
            "average_confidence": average_confidence,
            "model_name": self.model_name,
            "task": TASK_NAME,
            "detections": detections,
        }
        logger.info(
            "Inferencia líneas de expresión: detected=%s count=%s conf=%.2f",
            payload["detected"],
            count,
            threshold,
        )
        return payload


expression_lines_inference_service = ExpressionLinesInferenceService()
