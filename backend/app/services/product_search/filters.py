from __future__ import annotations

import re

# Palabras clave de cuidado facial / dermatológico de venta libre.
SKINCARE_KEYWORDS = (
    "limpiador",
    "facial",
    "crema",
    "serum",
    "sérum",
    "protector solar",
    "solar",
    "hidratante",
    "tónico",
    "tonico",
    "exfoliante",
    "agua micelar",
    "micelar",
    "gel",
    "loción",
    "locion",
    "mascarilla",
    "antiedad",
    "acné",
    "acne",
    "piel",
    "rostro",
    "dermat",
    "isdin",
    "eucerin",
    "cerave",
    "la roche",
    "avene",
    "bioderma",
    "vichy",
    "contorno de ojos",
    "after sun",
    "fps",
    "spf",
)

# Indicadores de medicamento (venta con receta o fármaco).
PRESCRIPTION_PATTERNS = (
    re.compile(r"\b\d+\s*mg\b", re.IGNORECASE),
    re.compile(r"\bcomprimido", re.IGNORECASE),
    re.compile(r"\bc[aá]psula", re.IGNORECASE),
    re.compile(r"\btableta", re.IGNORECASE),
    re.compile(r"\bampolla", re.IGNORECASE),
    re.compile(r"\binyectable", re.IGNORECASE),
    re.compile(r"\bsupositorio", re.IGNORECASE),
    re.compile(r"\breceta\b", re.IGNORECASE),
    re.compile(r"\blosartan\b", re.IGNORECASE),
    re.compile(r"\bparacetamol\b", re.IGNORECASE),
    re.compile(r"\bibuprofeno\b", re.IGNORECASE),
    re.compile(r"\bamoxicilina\b", re.IGNORECASE),
    re.compile(r"\bomeprazol\b", re.IGNORECASE),
    re.compile(r"\bmetformina\b", re.IGNORECASE),
)


def normalize_query(query: str) -> str:
    return " ".join(query.strip().lower().split())


def is_skincare_product(name: str, query: str) -> bool:
    text = f"{name} {query}".lower()
    return any(keyword in text for keyword in SKINCARE_KEYWORDS)


def is_prescription_product(name: str) -> bool:
    return any(pattern.search(name) for pattern in PRESCRIPTION_PATTERNS)
