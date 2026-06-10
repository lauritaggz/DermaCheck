from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import ProductSearchCache
from app.schemas.product_search import ProductSearchResponse


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProductSearchCacheService:
    """Persistencia de respuestas en SQLite/PostgreSQL con TTL configurable."""

    def __init__(self, db: Session) -> None:
        self._db = db
        self._ttl = timedelta(hours=settings.product_search_cache_ttl_hours)

    def get(self, query_normalized: str) -> ProductSearchResponse | None:
        now = _utcnow()
        row = self._db.scalar(
            select(ProductSearchCache).where(
                ProductSearchCache.query_normalized == query_normalized,
                ProductSearchCache.expires_at > now,
            )
        )
        if not row:
            return None
        payload = json.loads(row.response_json)
        response = ProductSearchResponse.model_validate(payload)
        response.source = "cache"
        return response

    def set(self, query_normalized: str, response: ProductSearchResponse) -> None:
        expires_at = _utcnow() + self._ttl
        payload = response.model_copy(update={"source": "farmacompara"}).model_dump(mode="json")

        existing = self._db.scalar(
            select(ProductSearchCache).where(ProductSearchCache.query_normalized == query_normalized)
        )
        if existing:
            existing.response_json = json.dumps(payload, ensure_ascii=False)
            existing.expires_at = expires_at
        else:
            self._db.add(
                ProductSearchCache(
                    query_normalized=query_normalized,
                    response_json=json.dumps(payload, ensure_ascii=False),
                    expires_at=expires_at,
                )
            )
        self._db.commit()

    def purge_expired(self) -> None:
        now = _utcnow()
        self._db.execute(delete(ProductSearchCache).where(ProductSearchCache.expires_at <= now))
        self._db.commit()
