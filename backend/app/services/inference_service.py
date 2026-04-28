"""
Inferencia con YOLOv8 sobre imágenes faciales.
Carga perezosa del modelo (solo la primera vez que se llama).
"""

from __future__ import annotations

import io
import os
import threading
from pathlib import Path
from typing import Any

_MODEL: Any | None = None
_MODEL_LOCK = threading.Lock()

DEFAULT_MODEL_PATH = (
    Path(__file__).resolve().parent.parent.parent / "ml_models" / "best.pt"
)
MODEL_PATH = Path(os.environ.get("DERMACHECK_MODEL_PATH", str(DEFAULT_MODEL_PATH)))


def _get_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    with _MODEL_LOCK:
        if _MODEL is None:
            from ultralytics import YOLO  # import diferido para no penalizar arranque

            if not MODEL_PATH.exists():
                raise FileNotFoundError(
                    f"No se encontró el modelo IA en: {MODEL_PATH}. "
                    "Coloca best.pt en backend/ml_models/ o define DERMACHECK_MODEL_PATH."
                )
            _MODEL = YOLO(str(MODEL_PATH))
    return _MODEL


def run_inference(image_bytes: bytes, conf: float = 0.25) -> list[dict]:
    from PIL import Image  # import diferido (pillow puede no estar instalado al arranque)

    model = _get_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(image, conf=conf, verbose=False)

    detections: list[dict] = []
    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            detections.append(
                {
                    "class_id": cls_id,
                    "class_name": model.names[cls_id],
                    "confidence": round(confidence, 4),
                    "bbox": [round(float(v), 2) for v in xyxy],
                }
            )
    return detections
