from __future__ import annotations

import json
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ProductFallback
from app.schemas.product_search import ProductPrices, ProductSearchItem, ProductSearchResponse
from app.services.product_search.filters import normalize_query
from app.services.product_search.parsers import REFERENCE_WARNING

FALLBACK_PRODUCTS: list[dict] = [
    {
        "keywords": ("limpiador", "facial", "gel", "acne", "acné", "salicilico", "salicílico"),
        "product": {
            "nombre": "Limpiador Facial Gel Ácido Salicílico (referencial)",
            "precios": {"ahumada": 8990, "salcobrand": 9390, "cruz_verde": 9490},
            "precio_minimo": 8990,
            "farmacia_minimo": "ahumada",
            "url": "https://www.farmacompara.cl/search?q=limpiador+facial+gel",
            "descripcion": "Gel limpiador facial de venta libre con ácido salicílico y niacinamida para piel con tendencia acneica.",
        },
    },
    {
        "keywords": ("hidratante", "crema", "facial", "resequedad", "piel seca"),
        "product": {
            "nombre": "Crema Hidratante Facial Urea 5% (referencial)",
            "precios": {"ahumada": 7990, "salcobrand": 8490, "cruz_verde": 8290},
            "precio_minimo": 7990,
            "farmacia_minimo": "ahumada",
            "url": "https://www.farmacompara.cl/search?q=crema+hidratante+facial",
        },
    },
    {
        "keywords": ("protector", "solar", "fps", "spf", "facial"),
        "product": {
            "nombre": "Protector Solar Facial FPS 50+ (referencial)",
            "precios": {"ahumada": 10990, "salcobrand": 11490, "cruz_verde": 11290},
            "precio_minimo": 10990,
            "farmacia_minimo": "ahumada",
            "url": "https://www.farmacompara.cl/search?q=protector+solar+facial",
        },
    },
    {
        "keywords": ("serum", "sérum", "niacinamida", "manchas", "hiperpigmentacion"),
        "product": {
            "nombre": "Sérum Facial Niacinamida 10% (referencial)",
            "precios": {"ahumada": 12990, "salcobrand": 13490, "cruz_verde": 13190},
            "precio_minimo": 12990,
            "farmacia_minimo": "ahumada",
            "url": "https://www.farmacompara.cl/search?q=serum+niacinamida",
        },
    },
    {
        "keywords": ("agua micelar", "micelar", "desmaquillante"),
        "product": {
            "nombre": "Agua Micelar Facial 400 mL (referencial)",
            "precios": {"ahumada": 6990, "salcobrand": 7490, "cruz_verde": 7290},
            "precio_minimo": 6990,
            "farmacia_minimo": "ahumada",
            "url": "https://www.farmacompara.cl/search?q=agua+micelar",
        },
    },
]


def seed_product_fallback_catalog(db: Session) -> None:
    existing = db.scalar(select(ProductFallback.id).limit(1))
    if existing:
        return

    for entry in FALLBACK_PRODUCTS:
        db.add(
            ProductFallback(
                query_keywords=",".join(entry["keywords"]),
                product_json=json.dumps(entry["product"], ensure_ascii=False),
                is_active=True,
            )
        )
    db.commit()


def _item_from_dict(data: dict) -> ProductSearchItem:
    precios = ProductPrices(**data["precios"])
    return ProductSearchItem(
        nombre=data["nombre"],
        precios=precios,
        precio_minimo=data["precio_minimo"],
        farmacia_minimo=data["farmacia_minimo"],
        url=data["url"],
        descripcion=data.get("descripcion"),
        fecha_consulta=date.today(),
    )


def get_fallback_products(db: Session, query: str, limit: int) -> list[ProductSearchItem]:
    normalized = normalize_query(query)
    rows = db.scalars(
        select(ProductFallback).where(ProductFallback.is_active.is_(True))
    ).all()

    matched: list[ProductSearchItem] = []
    seen_names: set[str] = set()

    for row in rows:
        keywords = [k.strip() for k in row.query_keywords.split(",") if k.strip()]
        if not any(keyword in normalized for keyword in keywords):
            continue
        data = json.loads(row.product_json)
        item = _item_from_dict(data)
        if item.nombre in seen_names:
            continue
        seen_names.add(item.nombre)
        matched.append(item)
        if len(matched) >= limit:
            break

    if matched:
        return matched

    # Si no hay coincidencia por keyword, devolver los primeros del catálogo.
    generic: list[ProductSearchItem] = []
    for row in rows[:limit]:
        generic.append(_item_from_dict(json.loads(row.product_json)))
    return generic


def build_fallback_response(db: Session, query: str, limit: int, extra_warning: str | None = None) -> ProductSearchResponse:
    products = get_fallback_products(db, query, limit)
    warning = REFERENCE_WARNING
    if extra_warning:
        warning = f"{extra_warning} {REFERENCE_WARNING}"
    return ProductSearchResponse(
        source="fallback",
        query=query.strip(),
        products=products,
        warning=warning,
    )
