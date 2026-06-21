"""
Catálogo de condiciones dermatológicas.
Información educativa estructurada para cada afección que el modelo puede detectar.

Contenido redactado en español con base en referencias DermNet (dermnetnz.org).
No sustituye evaluación médica presencial.
"""

from __future__ import annotations

from typing import TypedDict


class ConditionRequirements(TypedDict):
    """Criterios algorítmicos (YOLO) para sugerir evaluación médica."""
    confianza_mayor_a: float
    cantidad_detecciones: int


class ConditionSource(TypedDict):
    """Referencia verificable para trazabilidad de recomendaciones."""
    nombre: str
    titulo: str
    url: str
    uso: str


class ConditionData(TypedDict):
    """Estructura de datos para cada condición dermatológica."""
    id: str
    label_es: str
    label_en: str
    descripcion_corta: str
    descripcion_medica: str
    severidad_base: str
    requiere_evaluacion_si: ConditionRequirements
    recomendaciones: list[str]
    advertencias: list[str]
    criterios_derivacion: list[str]
    fuentes: list[ConditionSource]
    color_ui: str


DERMNET_ACNE: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Acne",
    "url": "https://dermnetnz.org/topics/acne",
    "uso": "Descripción general, cuidados, manejo y signos de consulta",
}

DERMNET_ROSACEA: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Rosacea",
    "url": "https://dermnetnz.org/topics/rosacea",
    "uso": "Cuidado de piel sensible, desencadenantes y seguimiento",
}

DERMNET_DERMATITIS: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Dermatitis",
    "url": "https://dermnetnz.org/topics/dermatitis",
    "uso": "Barrera cutánea, emolientes y signos de alarma",
}

DERMNET_DRY_SKIN: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Dry skin",
    "url": "https://dermnetnz.org/topics/dry-skin",
    "uso": "Xerosis, hidratación y hábitos de cuidado",
}

DERMNET_COMEDONES: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Comedones",
    "url": "https://dermnetnz.org/topics/comedones",
    "uso": "Poros obstruidos, limpieza y evitar manipulación",
}

DERMNET_PIGMENTATION: ConditionSource = {
    "nombre": "DermNet",
    "titulo": "Pigmentation disorders",
    "url": "https://dermnetnz.org/topics/pigmentation-disorders",
    "uso": "Fotoprotección, cambios sospechosos y orientación general",
}


CONDITIONS_CATALOG: dict[str, ConditionData] = {
    "acne": {
        "id": "acne",
        "label_es": "Acné",
        "label_en": "Acne",
        "descripcion_corta": "Lesiones inflamatorias y poros obstruidos en rostro",
        "descripcion_medica": (
            "Alteración frecuente de la piel asociada a poros obstruidos, exceso de sebo "
            "e inflamación de folículos pilosos. DermaCheck solo entrega orientación educativa "
            "visual; no confirma ni descarta diagnóstico médico."
        ),
        "severidad_base": "leve-moderada",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.80,
            "cantidad_detecciones": 5,
        },
        "recomendaciones": [
            "Usar un limpiador suave, evitando frotar la piel o productos abrasivos.",
            "Mantener hidratación ligera y no comedogénica para apoyar la barrera cutánea.",
            "Usar protector solar de amplio espectro durante el día.",
            "Evitar manipular, apretar o exprimir lesiones; puede aumentar irritación o marcas.",
            "Introducir productos activos de forma gradual para reducir riesgo de irritación.",
        ],
        "advertencias": [
            "Esta información es educativa y no reemplaza la evaluación de un dermatólogo.",
            "Los tratamientos con antibióticos, isotretinoína u otros fármacos requieren prescripción médica.",
        ],
        "criterios_derivacion": [
            "lesiones dolorosas o profundas",
            "cicatrices o marcas persistentes",
            "empeoramiento persistente pese a cuidado básico",
            "lesiones extensas o inflamación importante",
            "sospecha de infección",
            "impacto significativo en calidad de vida",
        ],
        "fuentes": [DERMNET_ACNE],
        "color_ui": "blue",
    },
    "eczema": {
        "id": "eczema",
        "label_es": "Eczema/Dermatitis",
        "label_en": "Eczema/Dermatitis",
        "descripcion_corta": "Enrojecimiento, sequedad y descamación con barrera comprometida",
        "descripcion_medica": (
            "Condición inflamatoria que puede manifestarse con picazón, sequedad y enrojecimiento. "
            "El cuidado prioriza reparar la barrera cutánea y evitar irritantes. "
            "DermaCheck no diagnostica eczema ni descarta otras dermatitis."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.75,
            "cantidad_detecciones": 3,
        },
        "recomendaciones": [
            "Aplicar emolientes e hidratantes con frecuencia, especialmente tras la limpieza.",
            "Usar limpiadores suaves sin jabón agresivo ni fragancias fuertes.",
            "Preferir baños breves con agua tibia, no caliente.",
            "Evitar roces, exfoliantes agresivos y productos con alcohol en zonas sensibles.",
            "Identificar y reducir posibles irritantes del entorno cuando sea posible.",
        ],
        "advertencias": [
            "Los corticoides tópicos u orales son tratamientos médicos que requieren evaluación profesional.",
            "No usar medicamentos con receta como si fueran productos cosméticos de rutina.",
        ],
        "criterios_derivacion": [
            "dolor, secreción o supuración",
            "costras, heridas abiertas o signos de infección",
            "extensión importante del enrojecimiento",
            "picazón intensa que interfiere con el sueño",
            "empeoramiento rápido o brotes frecuentes",
        ],
        "fuentes": [DERMNET_DERMATITIS],
        "color_ui": "red",
    },
    "manchas": {
        "id": "manchas",
        "label_es": "Manchas/Hiperpigmentación",
        "label_en": "Hyperpigmentation",
        "descripcion_corta": "Zonas con tono más oscuro por mayor melanina",
        "descripcion_medica": (
            "Cambios en el color de la piel por distintas causas (sol, inflamación previa, "
            "envejecimiento). El cuidado educativo prioriza fotoprotección y observación. "
            "DermaCheck no puede descartar lesiones pigmentadas que requieren evaluación presencial."
        ),
        "severidad_base": "cosmética",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.85,
            "cantidad_detecciones": 4,
        },
        "recomendaciones": [
            "Usar protector solar de amplio espectro a diario, incluso en días nublados.",
            "Evitar exposición solar directa prolongada y reaplicar fotoprotección.",
            "Mantener rutina suave de limpieza e hidratación sin agredir la piel.",
            "Introducir activos cosméticos despigmentantes solo con paciencia y tolerancia.",
            "No prometer eliminación completa de manchas; los cambios suelen ser graduales.",
        ],
        "advertencias": [
            "Algunas lesiones pigmentadas requieren evaluación dermatológica presencial.",
            "Los productos cosméticos no sustituyen diagnóstico ni tratamiento médico de manchas.",
        ],
        "criterios_derivacion": [
            "cambio rápido de tamaño, forma o color",
            "bordes irregulares o asimetría",
            "sangrado, dolor, picor persistente o crecimiento",
            "varios colores dentro de la misma lesión",
            "mancha que no responde a fotoprotección y seguimiento",
        ],
        "fuentes": [DERMNET_PIGMENTATION],
        "color_ui": "amber",
    },
    "puntos-negros": {
        "id": "puntos-negros",
        "label_es": "Puntos Negros",
        "label_en": "Blackheads",
        "descripcion_corta": "Comedones abiertos por acumulación de sebo en poros",
        "descripcion_medica": (
            "Comedones abiertos formados por sebo y células muertas en el folículo; "
            "el aspecto oscuro se debe a oxidación del contenido, no a suciedad. "
            "DermaCheck ofrece orientación general, no diagnóstico clínico."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.90,
            "cantidad_detecciones": 10,
        },
        "recomendaciones": [
            "Explicar que los puntos negros son poros obstruidos, no suciedad superficial.",
            "Usar limpieza facial suave de forma regular, sin frotar en exceso.",
            "Evitar extraer o apretar comedones; puede irritar y dejar marcas.",
            "Considerar productos no comedogénicos y activos de apoyo como ácido salicílico con gradualidad.",
            "Evitar exfoliación física agresiva o frecuente en la misma zona.",
        ],
        "advertencias": [
            "La extracción agresiva en casa aumenta riesgo de inflamación e infección.",
            "Si hay dolor, inflamación extensa o lesiones profundas, puede tratarse de acné inflamatorio.",
        ],
        "criterios_derivacion": [
            "inflamación importante o dolor",
            "lesiones extensas con enrojecimiento",
            "empeoramiento persistente",
            "sospecha de infección",
            "duda sobre el tipo de lesión",
        ],
        "fuentes": [DERMNET_COMEDONES],
        "color_ui": "blue",
    },
    "resequedad": {
        "id": "resequedad",
        "label_es": "Resequedad",
        "label_en": "Dryness",
        "descripcion_corta": "Piel seca con tirantez y posible descamación (xerosis)",
        "descripcion_medica": (
            "Disminución de humedad en la capa externa de la piel que puede causar tirantez, "
            "aspereza y descamación leve. El cuidado prioriza emolientes y hábitos suaves. "
            "DermaCheck no identifica causas internas o sistémicas de sequedad."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.85,
            "cantidad_detecciones": 4,
        },
        "recomendaciones": [
            "Hidratar con emolientes de forma frecuente, especialmente tras baño o limpieza.",
            "Usar limpiadores suaves y syndets que no eliminen la barrera lipídica.",
            "Preferir duchas breves con agua tibia; evitar agua muy caliente.",
            "Proteger la piel del viento, frío extremo y ambientes muy secos cuando sea posible.",
            "Aplicar hidratante sobre piel ligeramente húmeda para mejorar retención de humedad.",
        ],
        "advertencias": [
            "La resequedad severa persistente puede asociarse a condiciones que requieren evaluación médica.",
            "Productos cosméticos no reemplazan tratamiento médico si hay grietas profundas o infección.",
        ],
        "criterios_derivacion": [
            "grietas dolorosas o sangrado",
            "picazón intensa persistente",
            "signos de infección (enrojecimiento, pus, calor)",
            "extensión corporal importante",
            "empeoramiento sin respuesta a cuidado básico",
        ],
        "fuentes": [DERMNET_DRY_SKIN],
        "color_ui": "green",
    },
    "rosacea": {
        "id": "rosacea",
        "label_es": "Rosácea",
        "label_en": "Rosacea",
        "descripcion_corta": "Enrojecimiento facial con piel sensible y posibles brotes",
        "descripcion_medica": (
            "Condición crónica que puede manifestarse con enrojecimiento, sensibilidad y brotes. "
            "Requiere enfoque distinto al acné común. DermaCheck no confirma diagnóstico de rosácea "
            "ni descarta otras causas de enrojecimiento facial."
        ),
        "severidad_base": "leve-moderada",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.75,
            "cantidad_detecciones": 3,
        },
        "recomendaciones": [
            "Priorizar limpieza muy suave y productos formulados para piel sensible.",
            "Usar hidratante calmante y protector solar de amplio espectro a diario.",
            "Evitar fragancias, alcohol fuerte, exfoliantes agresivos y productos muy irritantes.",
            "Identificar desencadenantes personales (calor, sol intenso, ciertos alimentos, estrés).",
            "No tratar la rosácea como acné común ni combinar muchos activos exfoliantes a la vez.",
        ],
        "advertencias": [
            "La rosácea es una condición que suele requerir diagnóstico y seguimiento dermatológico.",
            "Antibióticos tópicos u orales son tratamientos médicos, no recomendaciones cosméticas.",
        ],
        "criterios_derivacion": [
            "enrojecimiento persistente o brotes frecuentes",
            "ardor intenso, dolor o sensación de quemazón marcada",
            "síntomas oculares (ojos rojos, irritados, visión borrosa)",
            "engrosamiento o cambios en la piel de la nariz",
            "empeoramiento progresivo pese a cuidado básico",
        ],
        "fuentes": [DERMNET_ROSACEA],
        "color_ui": "red",
    },
}


def get_condition(condition_id: str) -> ConditionData | None:
    """Obtiene la información de una condición por su ID."""
    return CONDITIONS_CATALOG.get(condition_id)


def get_all_conditions() -> dict[str, ConditionData]:
    """Retorna el catálogo completo de condiciones."""
    return CONDITIONS_CATALOG.copy()


def get_condition_ids() -> list[str]:
    """Retorna lista de IDs de todas las condiciones."""
    return list(CONDITIONS_CATALOG.keys())
