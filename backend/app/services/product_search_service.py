from __future__ import annotations

import asyncio
import logging

from sqlalchemy.orm import Session

from app.config import settings
from app.schemas.product_search import ProductSearchItem, ProductSearchResponse
from app.services.product_search.cache import ProductSearchCacheService
from app.services.product_search.fallback import build_fallback_response
from app.services.product_search.farmacompara_scraper import FarmacomparaHttpScraper
from app.services.product_search.filters import normalize_query
from app.services.product_search.parsers import REFERENCE_WARNING, compute_min_price, merge_precios
from app.services.product_search.playwright_scraper import FarmacomparaPlaywrightScraper

logger = logging.getLogger(__name__)


class ProductSearchService:
    """
    Orquestador HU22: caché → scraper httpx → Playwright (plan B) → catálogo fallback.

    Entrada: cadena `query` (manual hoy; en el futuro vendrá del mini agente de recomendaciones).
    Salida: productos ordenados por precio mínimo con precios por farmacia.

    Integración futura del mini agente:
        # query = mini_agent.build_search_query(diagnosis, recommendations)
        # response = await product_search_service.search(db, query)
    """

    def __init__(self) -> None:
        self._http_scraper = FarmacomparaHttpScraper()
        self._playwright_scraper = FarmacomparaPlaywrightScraper()

    async def close(self) -> None:
        await self._http_scraper.close()

    async def search(self, db: Session, query: str) -> ProductSearchResponse:
        cleaned = query.strip()
        normalized = normalize_query(cleaned)
        max_results = settings.product_search_max_results

        cache_service = ProductSearchCacheService(db)
        cached = cache_service.get(normalized)
        if cached:
            return cached

        warning_notes: list[str] = []
        products: list[ProductSearchItem] = []
        http_status: int | None = None

        try:
            products, http_error, http_status = await self._http_scraper.search(cleaned)
            if http_error and http_status == 403:
                warning_notes.append("Farmacompara bloqueó la solicitud (403).")
            elif http_error and not products:
                warning_notes.append(http_error)
        except Exception as exc:
            logger.exception("Error en scraper httpx")
            warning_notes.append(f"Error al consultar Farmacompara: {exc}")

        if not products and settings.product_search_enable_playwright:
            try:
                pw_products, pw_error = await self._playwright_scraper.search(cleaned)
                if pw_products:
                    products = pw_products
                    warning_notes = [n for n in warning_notes if "403" not in n]
                elif pw_error:
                    warning_notes.append(f"Plan B Playwright: {pw_error}")
            except Exception as exc:
                logger.exception("Error en scraper Playwright")
                warning_notes.append(f"Plan B Playwright falló: {exc}")

        if products:
            products = self._finalize_products(products, max_results)
            products = await self._enrich_products_with_details(products)
            response = ProductSearchResponse(
                source="farmacompara",
                query=cleaned,
                products=products,
                warning=REFERENCE_WARNING,
            )
            cache_service.set(normalized, response)
            return response

        fallback_warning = " ".join(warning_notes).strip() or "No se encontraron productos en Farmacompara."
        fallback = build_fallback_response(db, cleaned, max_results, extra_warning=fallback_warning)
        return fallback

    @staticmethod
    def _finalize_products(products: list[ProductSearchItem], limit: int) -> list[ProductSearchItem]:
        unique: dict[str, ProductSearchItem] = {}
        for product in products:
            key = product.nombre.strip().lower()
            if key not in unique or product.precio_minimo < unique[key].precio_minimo:
                unique[key] = product

        ordered = sorted(unique.values(), key=lambda p: p.precio_minimo)
        return ordered[:limit]

    async def _enrich_products_with_details(
        self,
        products: list[ProductSearchItem],
    ) -> list[ProductSearchItem]:
        """
        Consulta la página de detalle de cada producto para obtener descripción
        y completar precios de Ahumada, Salcobrand y Cruz Verde.
        """
        semaphore = asyncio.Semaphore(3)
        tasks = [self._enrich_single_product(product, semaphore) for product in products]
        return list(await asyncio.gather(*tasks))

    async def _enrich_single_product(
        self,
        product: ProductSearchItem,
        semaphore: asyncio.Semaphore,
    ) -> ProductSearchItem:
        if not product.url:
            logger.info("Producto sin URL, descripcion=null: %s", product.nombre)
            return product

        async with semaphore:
            descripcion, detail_prices, detail_image = await self._http_scraper.fetch_product_detail(
                product.url
            )

            if not descripcion and settings.product_search_enable_playwright:
                pw_desc, pw_prices, pw_image = await self._playwright_scraper.fetch_product_detail(
                    product.url
                )
                descripcion = descripcion or pw_desc
                detail_prices = detail_prices or pw_prices
                detail_image = detail_image or pw_image

        imagen_url = product.imagen_url or detail_image
        merged_precios = merge_precios(product.precios, detail_prices)
        min_data = compute_min_price(merged_precios)

        if not min_data:
            logger.info("Sin precios válidos tras detalle, se omite producto: %s", product.nombre)
            return product.model_copy(
                update={
                    "precios": merged_precios,
                    "descripcion": descripcion,
                    "imagen_url": imagen_url,
                }
            )

        precio_minimo, farmacia_minimo = min_data

        if descripcion is None:
            logger.info("Descripcion no encontrada para producto: %s (%s)", product.nombre, product.url)

        return product.model_copy(
            update={
                "precios": merged_precios,
                "precio_minimo": precio_minimo,
                "farmacia_minimo": farmacia_minimo,
                "descripcion": descripcion,
                "imagen_url": imagen_url,
            }
        )


product_search_service = ProductSearchService()
