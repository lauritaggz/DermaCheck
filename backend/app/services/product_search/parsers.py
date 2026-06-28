from __future__ import annotations

import re
from datetime import date
from typing import Literal

from bs4 import BeautifulSoup, Tag

from app.schemas.product_search import ProductPrices, ProductSearchItem

PHARMACY_SLUGS: dict[str, Literal["ahumada", "salcobrand", "cruz_verde"]] = {
    "ahumada": "ahumada",
    "salcobrand": "salcobrand",
    "cruz verde": "cruz_verde",
}

REFERENCE_WARNING = (
    "Precios referenciales. Verificar en la farmacia antes de comprar."
)

FARMACOMPARA_BASE = "https://www.farmacompara.cl"


def normalize_farmacompara_url(raw: str | None) -> str | None:
    if not raw:
        return None
    text = raw.strip()
    if not text:
        return None
    if text.startswith("//"):
        return f"https:{text}"
    if text.startswith("/"):
        return f"{FARMACOMPARA_BASE}{text}"
    return text


def parse_clp_price(raw: str | None) -> int | None:
    if not raw:
        return None
    text = raw.strip().lower()
    if not text or text in {"-", "—"} or "sin stock" in text:
        return None
    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else None


def _normalize_pharmacy(name: str) -> Literal["ahumada", "salcobrand", "cruz_verde"] | None:
    key = name.strip().lower()
    return PHARMACY_SLUGS.get(key)


def _price_map(precios: ProductPrices) -> dict[str, int]:
    return {
        k: v
        for k, v in {
            "ahumada": precios.ahumada,
            "salcobrand": precios.salcobrand,
            "cruz_verde": precios.cruz_verde,
        }.items()
        if v is not None
    }


def merge_precios(base: ProductPrices, extra: ProductPrices | None) -> ProductPrices:
    """Combina precios de listado y detalle en un único objeto con tres claves."""
    if extra is None:
        return base
    return ProductPrices(
        ahumada=base.ahumada if base.ahumada is not None else extra.ahumada,
        salcobrand=base.salcobrand if base.salcobrand is not None else extra.salcobrand,
        cruz_verde=base.cruz_verde if base.cruz_verde is not None else extra.cruz_verde,
    )


def compute_min_price(
    precios: ProductPrices,
) -> tuple[int, Literal["ahumada", "salcobrand", "cruz_verde"]] | None:
    price_map = _price_map(precios)
    if not price_map:
        return None
    farmacia_minimo = min(price_map, key=price_map.get)  # type: ignore[arg-type]
    return price_map[farmacia_minimo], farmacia_minimo  # type: ignore[return-value]


def extract_precios_from_card(card: Tag) -> ProductPrices:
    precios = ProductPrices()
    for row in card.select(".price-row"):
        pharmacy_el = row.select_one(".pharmacy-name")
        price_el = row.select_one(".price-value")
        if not pharmacy_el or not price_el:
            continue
        slug = _normalize_pharmacy(pharmacy_el.get_text(strip=True))
        price = parse_clp_price(price_el.get_text(" ", strip=True))
        if slug and price is not None:
            setattr(precios, slug, price)
    return precios


def extract_image_from_card(card: Tag) -> str | None:
    img = card.select_one("img.product-img") or card.select_one(".img-container img")
    if not img:
        return None
    raw_src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
    return normalize_farmacompara_url(str(raw_src) if raw_src else None)


def parse_product_card(card: Tag, query: str, fecha: date | None = None) -> ProductSearchItem | None:
    nombre = card.get("data-name") or ""
    if not nombre:
        link = card.select_one("a.product-name")
        nombre = link.get_text(strip=True) if link else ""
    if not nombre:
        return None

    link = card.select_one("a.product-name[href]")
    raw_url = link["href"] if link and link.has_attr("href") else ""
    url = normalize_farmacompara_url(str(raw_url) if raw_url else None) or ""

    precios = extract_precios_from_card(card)
    min_data = compute_min_price(precios)

    if min_data:
        precio_minimo, farmacia_minimo = min_data
    else:
        fallback_price = parse_clp_price(str(card.get("data-price", "")))
        if fallback_price is None:
            return None
        precio_minimo = fallback_price
        farmacia_minimo = "salcobrand"

    return ProductSearchItem(
        nombre=nombre,
        precios=precios,
        precio_minimo=precio_minimo,
        farmacia_minimo=farmacia_minimo,
        url=url,
        descripcion=None,
        imagen_url=extract_image_from_card(card),
        fecha_consulta=fecha or date.today(),
    )


def parse_farmacompara_html(html: str, query: str) -> list[ProductSearchItem]:
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select("div.prod")
    products: list[ProductSearchItem] = []
    for card in cards:
        if not isinstance(card, Tag):
            continue
        item = parse_product_card(card, query)
        if item:
            products.append(item)
    return products
