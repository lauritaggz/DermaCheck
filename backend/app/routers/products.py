from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product_search import ProductSearchRequest, ProductSearchResponse
from app.services.product_search_service import product_search_service

router = APIRouter(tags=["products"])

# HU22: endpoint aislado de la API v1 existente.
# POST /api/products/search — no interfiere con /api/v1/*.
#
# Uso actual: query manual desde /scraper-test (frontend).
# Uso futuro: el mini agente generará la query y llamará este mismo endpoint
# o invocará ProductSearchService.search(db, query) desde el backend.


@router.post("/search", response_model=ProductSearchResponse)
async def search_products(
    body: ProductSearchRequest,
    db: Session = Depends(get_db),
) -> ProductSearchResponse:
    """
    Busca productos de cuidado facial en farmacias chilenas vía Farmacompara.

    Si el scraping falla o no hay resultados, devuelve catálogo fallback con advertencia.
    """
    return await product_search_service.search(db, body.query)
