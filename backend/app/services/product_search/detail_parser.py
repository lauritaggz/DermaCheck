from __future__ import annotations

import json
import logging
import re
from typing import Literal

from bs4 import BeautifulSoup

from app.schemas.product_search import ProductPrices

logger = logging.getLogger(__name__)

PHARMACY_DETAIL_PATTERNS: tuple[tuple[re.Pattern[str], Literal["ahumada", "salcobrand", "cruz_verde"]], ...] = (
    (re.compile(r"ahumada\s*:", re.IGNORECASE), "ahumada"),
    (re.compile(r"salcobrand\s*:", re.IGNORECASE), "salcobrand"),
    (re.compile(r"cruz\s*verde\s*:", re.IGNORECASE), "cruz_verde"),
)


def parse_detail_prices(html: str) -> ProductPrices:
    """Extrae precios Ahumada/Salcobrand/Cruz Verde del bloque #precios en detalle."""
    from app.services.product_search.parsers import parse_clp_price

    soup = BeautifulSoup(html, "html.parser")
    precios = ProductPrices()
    precios_block = soup.select_one("#precios")
    if not precios_block:
        return precios

    for span in precios_block.select("span"):
        text = span.get_text(" ", strip=True)
        for pattern, slug in PHARMACY_DETAIL_PATTERNS:
            if not pattern.search(text):
                continue
            price_part = pattern.sub("", text, count=1).strip()
            price = parse_clp_price(price_part)
            setattr(precios, slug, price)
            break

    return precios


def parse_product_description(html: str) -> str | None:
    """
    Obtiene la descripción completa desde la página de detalle de Farmacompara.

    Orden de prioridad:
      1. Bloque visible `.product-contain p`
      2. JSON-LD Product.description
      3. meta og:description / twitter:description
    """
    soup = BeautifulSoup(html, "html.parser")

    paragraph = soup.select_one(".product-contain p")
    if paragraph:
        text = paragraph.get_text(" ", strip=True)
        if text:
            return text

    for script in soup.select('script[type="application/ld+json"]'):
        raw = script.string or script.get_text()
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue

        candidates = payload if isinstance(payload, list) else [payload]
        for item in candidates:
            if not isinstance(item, dict):
                continue
            if item.get("@type") == "Product":
                description = item.get("description")
                if isinstance(description, str) and description.strip():
                    return description.strip()

    for selector in (
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
    ):
        tag = soup.select_one(selector)
        if tag and tag.get("content"):
            content = str(tag["content"]).strip()
            if content and not content.lower().startswith("compara precios"):
                return content

    return None
