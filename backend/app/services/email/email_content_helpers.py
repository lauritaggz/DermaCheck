"""Helpers de contenido para el correo de resumen de análisis."""

from __future__ import annotations

import unicodedata

from app.schemas.email import EmailConditionSummary, EmailDiagnosisSummary

MEDICAL_DISCLAIMER = (
    "Este resumen es una orientación inicial generada por DermaCheck y no reemplaza "
    "la evaluación de un dermatólogo. Si presentas dolor, irritación intensa, "
    "lesiones que empeoran o dudas sobre tu piel, consulta con un profesional de salud."
)

CAUTION_NOTE = (
    "Usar con precaución y suspender si genera irritación. "
    "En piel sensible, consultar con un profesional."
)

DEFAULT_GENERAL_TIPS = [
    "Limpieza suave sin frotar en exceso.",
    "Hidratación diaria acorde a tu tipo de piel.",
    "Protector solar amplio espectro, incluso en días nublados.",
]

DEFAULT_GENERAL_COMPONENTS: list[dict[str, object]] = [
    {
        "name": "Protector solar SPF 50+",
        "benefit": "Suele recomendarse como base del cuidado diario para proteger la piel.",
        "caution": False,
    },
    {
        "name": "Ceramidas",
        "benefit": "Pueden ayudar a reforzar la barrera cutánea y mantener la hidratación.",
        "caution": False,
    },
    {
        "name": "Glicerina",
        "benefit": "Puede apoyar la retención de humedad en la piel.",
        "caution": False,
    },
]

COMPONENTS_BY_KEY: dict[str, list[dict[str, object]]] = {
    "acne": [
        {
            "name": "Ácido salicílico",
            "benefit": "Puede ayudar en el cuidado de poros obstruidos y piel con tendencia grasa.",
            "caution": False,
        },
        {
            "name": "Niacinamida",
            "benefit": "Suele recomendarse para equilibrar la producción de sebo y apoyar la barrera cutánea.",
            "caution": False,
        },
        {
            "name": "Peróxido de benzoilo",
            "benefit": "Puede ayudar en el cuidado de lesiones inflamatorias leves en productos de venta libre.",
            "caution": True,
        },
    ],
    "rosacea": [
        {
            "name": "Niacinamida",
            "benefit": "Puede ayudar a calmar enrojecimiento leve y reforzar la barrera cutánea.",
            "caution": False,
        },
        {
            "name": "Ácido azelaico",
            "benefit": "Suele usarse en rutinas orientativas para tono irregular y enrojecimiento leve.",
            "caution": True,
        },
        {
            "name": "Protector solar mineral",
            "benefit": "Puede ayudar a proteger la piel sensible expuesta al sol.",
            "caution": False,
        },
    ],
    "eczema": [
        {
            "name": "Ceramidas",
            "benefit": "Pueden ayudar a reparar y mantener la barrera cutánea.",
            "caution": False,
        },
        {
            "name": "Glicerina",
            "benefit": "Puede apoyar la hidratación y reducir la sensación de tirantez.",
            "caution": False,
        },
        {
            "name": "Avena coloidal",
            "benefit": "Suele recomendarse en productos suaves para calmar piel irritada o sensible.",
            "caution": False,
        },
    ],
    "piel_seca": [
        {
            "name": "Ácido hialurónico",
            "benefit": "Puede ayudar a retener humedad en la piel seca o deshidratada.",
            "caution": False,
        },
        {
            "name": "Ceramidas",
            "benefit": "Pueden reforzar la barrera cutánea y mejorar la retención de agua.",
            "caution": False,
        },
        {
            "name": "Glicerina",
            "benefit": "Suele usarse como humectante en rutinas de hidratación diaria.",
            "caution": False,
        },
    ],
    "puntos_negros": [
        {
            "name": "Ácido salicílico",
            "benefit": "Puede ayudar a aflojar impurezas en poros obstruidos.",
            "caution": False,
        },
        {
            "name": "Retinoides suaves",
            "benefit": "Pueden apoyar la renovación superficial de la piel en rutinas progresivas.",
            "caution": True,
        },
        {
            "name": "Niacinamida",
            "benefit": "Suele recomendarse para equilibrar la piel y apoyar la textura del rostro.",
            "caution": False,
        },
    ],
    "manchas": [
        {
            "name": "Vitamina C",
            "benefit": "Puede ayudar en rutinas orientativas para tono irregular leve.",
            "caution": False,
        },
        {
            "name": "Niacinamida",
            "benefit": "Suele recomendarse para apoyar la uniformidad del tono de la piel.",
            "caution": False,
        },
        {
            "name": "Protector solar SPF 50+",
            "benefit": "Es clave para evitar que las manchas se intensifiquen con el sol.",
            "caution": False,
        },
    ],
}


def _normalize_token(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower())
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def get_condition_key(condition: EmailConditionSummary) -> str:
    """Mapea una condición detectada a una clave interna para componentes."""
    tokens = " ".join(
        filter(
            None,
            [
                _normalize_token(condition.id),
                _normalize_token(condition.label),
            ],
        )
    )
    if any(k in tokens for k in ("acne", "acné")):
        return "acne"
    if "rosacea" in tokens or "rosácea" in condition.label.lower():
        return "rosacea"
    if any(k in tokens for k in ("eczema", "dermatitis", "atopica")):
        return "eczema"
    if any(k in tokens for k in ("resequed", "piel seca", "dryness", "xerosis")):
        return "piel_seca"
    if any(k in tokens for k in ("puntos negros", "puntos-negros", "comedon")):
        return "puntos_negros"
    if any(k in tokens for k in ("mancha", "hiperpigment", "melasma", "lentigo")):
        return "manchas"
    return "general"


def get_detected_conditions(
    diagnosis: EmailDiagnosisSummary,
) -> list[EmailConditionSummary]:
    """Devuelve todas las afecciones detectadas, ordenadas por confianza."""
    return sorted(
        diagnosis.condiciones_detectadas,
        key=lambda c: c.confianza_promedio,
        reverse=True,
    )


def get_primary_condition(
    diagnosis: EmailDiagnosisSummary,
) -> EmailConditionSummary | None:
    """Devuelve la afección principal (mayor confianza)."""
    conditions = get_detected_conditions(diagnosis)
    return conditions[0] if conditions else None


def get_recommendations_for_email(
    diagnosis: EmailDiagnosisSummary,
    conditions: list[EmailConditionSummary] | None = None,
) -> list[str]:
    """Combina recomendaciones de todas las afecciones detectadas."""
    detected = conditions if conditions is not None else get_detected_conditions(diagnosis)
    merged: list[str] = []
    seen: set[str] = set()
    for condition in detected:
        for tip in condition.recomendaciones:
            normalized = tip.strip()
            if normalized and normalized not in seen:
                seen.add(normalized)
                merged.append(normalized)
    if merged:
        return merged
    if diagnosis.consejos_generales:
        return diagnosis.consejos_generales
    return DEFAULT_GENERAL_TIPS


def get_main_components_for_condition(
    condition: EmailConditionSummary | None,
) -> list[dict[str, object]]:
    """Devuelve componentes sugeridos para una afección."""
    if condition is None:
        return DEFAULT_GENERAL_COMPONENTS
    key = get_condition_key(condition)
    if key == "general":
        return DEFAULT_GENERAL_COMPONENTS
    return COMPONENTS_BY_KEY.get(key, DEFAULT_GENERAL_COMPONENTS)[:3]


def get_main_components_for_conditions(
    conditions: list[EmailConditionSummary],
    *,
    max_components: int = 6,
) -> list[dict[str, object]]:
    """Combina componentes sugeridos de todas las afecciones (sin duplicados)."""
    if not conditions:
        return DEFAULT_GENERAL_COMPONENTS

    merged: list[dict[str, object]] = []
    seen_names: set[str] = set()
    for condition in conditions:
        for component in get_main_components_for_condition(condition):
            name = str(component.get("name", "")).strip()
            if not name or name in seen_names:
                continue
            seen_names.add(name)
            merged.append(component)
            if len(merged) >= max_components:
                return merged
    return merged or DEFAULT_GENERAL_COMPONENTS
