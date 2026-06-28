from __future__ import annotations

import logging

from app.schemas.product_search import ProductPrices
from app.services.product_search.detail_parser import (
    parse_detail_prices,
    parse_product_description,
    parse_product_image,
)
from app.services.product_search.filters import is_prescription_product, is_skincare_product
from app.services.product_search.parsers import parse_farmacompara_html

logger = logging.getLogger(__name__)


class FarmacomparaPlaywrightScraper:
    """
    Plan B: ejecuta JavaScript en Farmacompara cuando POST /get falla o devuelve vacío.

    Requiere `playwright install chromium` en el entorno de despliegue.
    """

    async def fetch_html(self, query: str) -> tuple[str | None, str | None]:
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return None, "Playwright no está instalado."

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    ),
                    locale="es-CL",
                )
                page = await context.new_page()
                await page.goto(
                    f"https://www.farmacompara.cl/search?q={query}",
                    wait_until="networkidle",
                    timeout=30000,
                )

                try:
                    await page.wait_for_selector("#productos .prod, #productos", timeout=15000)
                except Exception:
                    logger.info("Playwright: timeout esperando productos para query=%s", query)

                html = await page.inner_html("#productos")
                await browser.close()
                return html, None
        except Exception as exc:
            logger.warning("Playwright scraper error: %s", exc)
            return None, str(exc)

    async def search(self, query: str) -> tuple[list, str | None]:
        html, error = await self.fetch_html(query)
        if not html:
            return [], error

        wrapped = f'<div id="productos">{html}</div>'
        products = parse_farmacompara_html(wrapped, query)
        filtered = [
            p
            for p in products
            if is_skincare_product(p.nombre, query) and not is_prescription_product(p.nombre)
        ]
        return filtered, error

    async def fetch_product_detail_html(self, url: str) -> tuple[str | None, str | None]:
        """Plan B para descripciones dinámicas en página de detalle."""
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return None, "Playwright no está instalado."

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    ),
                    locale="es-CL",
                )
                page = await context.new_page()
                await page.goto(url, wait_until="networkidle", timeout=30000)
                try:
                    await page.wait_for_selector(
                        ".product-contain p, script[type='application/ld+json']",
                        timeout=10000,
                    )
                except Exception:
                    pass
                html = await page.content()
                await browser.close()
                return html, None
        except Exception as exc:
            logger.warning("Playwright detail error (%s): %s", url, exc)
            return None, str(exc)

    async def fetch_product_detail(
        self, url: str
    ) -> tuple[str | None, ProductPrices | None, str | None]:
        html, error = await self.fetch_product_detail_html(url)
        if not html:
            if error:
                logger.info("Playwright no obtuvo detalle (%s): %s", url, error)
            return None, None, None
        return (
            parse_product_description(html),
            parse_detail_prices(html),
            parse_product_image(html),
        )
