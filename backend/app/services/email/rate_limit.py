"""Rate limiting simple en memoria por clave (IP del cliente)."""

from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock


class InMemoryRateLimiter:
    """Permite hasta `max_requests` por ventana de `window_seconds` segundos."""

    def __init__(self, *, max_requests: int = 5, window_seconds: int = 60) -> None:
        self._max_requests = max(1, max_requests)
        self._window_seconds = max(1, window_seconds)
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self._window_seconds

        with self._lock:
            timestamps = [ts for ts in self._hits[key] if ts > cutoff]
            if len(timestamps) >= self._max_requests:
                self._hits[key] = timestamps
                return False
            timestamps.append(now)
            self._hits[key] = timestamps
            return True

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()
