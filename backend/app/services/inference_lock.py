"""Lock global para serializar inferencia YOLO entre hilos concurrentes."""

from __future__ import annotations

import threading
from contextlib import contextmanager

_INFERENCE_LOCK = threading.Lock()


@contextmanager
def inference_lock():
    """Evita ejecutar dos pipelines YOLO a la vez sobre el mismo modelo en memoria."""
    _INFERENCE_LOCK.acquire()
    try:
        yield
    finally:
        _INFERENCE_LOCK.release()
