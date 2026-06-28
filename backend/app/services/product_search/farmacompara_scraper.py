from __future__ import annotations

import logging
from urllib.parse import quote

import httpx

from app.schemas.product_search import ProductPrices
from app.services.product_search.detail_parser import (
    parse_detail_prices,
    parse_product_description,
    parse_product_image,
)
from app.services.product_search.parsers import parse_farmacompara_html

logger = logging.getLogger(__name__)

FARMACOMPARA_GET_URL = "https://www.farmacompara.cl/get"
FARMACOMPARA_SEARCH_REFERER = "https://www.farmacompara.cl/search"

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": "https://www.farmacompara.cl",
}


class FarmacomparaHttpScraper:
    """
    Scraper principal (plan A): POST /get con httpx + BeautifulSoup.

    Farmacompara carga resultados vía AJAX; este cliente replica la petición del sitio.
    """

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers=DEFAULT_HEADERS,
                timeout=httpx.Timeout(20.0, connect=10.0),
                follow_redirects=True,
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def fetch_html(self, query: str) -> tuple[str | None, int | None, str | None]:
        """
        Devuelve (html, status_code, error_message).
        status_code 403 indica bloqueo; html None si falló.
        """
        client = await self._get_client()
        referer = f"{FARMACOMPARA_SEARCH_REFERER}?q={quote(query)}"

        try:
            response = await client.post(
                FARMACOMPARA_GET_URL,
                data={"searchTerm": query},
                headers={"Referer": referer},
            )
        except httpx.HTTPError as exc:
            logger.warning("Farmacompara httpx error: %s", exc)
            return None, None, str(exc)

        if response.status_code == 403:
            return None, 403, "Acceso bloqueado por Farmacompara (403)."

        if response.status_code >= 400:
            return None, response.status_code, f"HTTP {response.status_code}"

        html = response.text.strip()
        if not html or "prod" not in html:
            return html or None, response.status_code, "Sin resultados en HTML"

        return html, response.status_code, None

    async def search(self, query: str) -> tuple[list, str | None, int | None]:
        from app.services.product_search.filters import is_prescription_product, is_skincare_product

        html, status, error = await self.fetch_html(query)
        if not html:
            return [], error, status

        products = parse_farmacompara_html(html, query)
        filtered = [
            p
            for p in products
            if is_skincare_product(p.nombre, query) and not is_prescription_product(p.nombre)
        ]
        return filtered, error, status

    async def fetch_page_html(self, url: str) -> tuple[str | None, int | None, str | None]:
        if not url:
            return None, None, "URL vacía"

        client = await self._get_client()
        try:
            response = await client.get(
                url,
                headers={
                    "Referer": FARMACOMPARA_SEARCH_REFERER,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            )
        except httpx.HTTPError as exc:
            logger.warning("Farmacompara detail httpx error (%s): %s", url, exc)
            return None, None, str(exc)

        if response.status_code == 403:
            return None, 403, "Acceso bloqueado por Farmacompara (403)."

        if response.status_code >= 400:
            return None, response.status_code, f"HTTP {response.status_code}"

        return response.text, response.status_code, None

    async def fetch_product_detail(
        self, url: str
    ) -> tuple[str | None, ProductPrices | None, str | None]:
        html, _, error = await self.fetch_page_html(url)
        if not html:
            if error:
                logger.info("No se pudo obtener detalle de producto (%s): %s", url, error)
            return None, None, None

        description = parse_product_description(html)
        detail_prices = parse_detail_prices(html)
        image_url = parse_product_image(html)
        return description, detail_prices, image_url
