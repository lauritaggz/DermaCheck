from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class ProductSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=512)


class ProductPrices(BaseModel):
    ahumada: int | None = None
    salcobrand: int | None = None
    cruz_verde: int | None = None


class ProductSearchItem(BaseModel):
    nombre: str
    precios: ProductPrices
    precio_minimo: int
    farmacia_minimo: Literal["ahumada", "salcobrand", "cruz_verde"]
    url: str
    descripcion: str | None = None
    fecha_consulta: date


class ProductSearchResponse(BaseModel):
    source: Literal["farmacompara", "fallback", "cache"]
    query: str
    products: list[ProductSearchItem]
    warning: str
