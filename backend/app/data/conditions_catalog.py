"""
Catálogo de condiciones dermatológicas.
Información médica estructurada para cada afección que el modelo puede detectar.

Este catálogo es revisado por profesionales de la salud y versionado en Git.
"""

from __future__ import annotations

from typing import TypedDict


class ConditionRequirements(TypedDict):
    """Criterios para determinar si requiere evaluación médica."""
    confianza_mayor_a: float
    cantidad_detecciones: int


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
    color_ui: str


# Catálogo principal de condiciones
CONDITIONS_CATALOG: dict[str, ConditionData] = {
    "acne": {
        "id": "acne",
        "label_es": "Acné",
        "label_en": "Acne",
        "descripcion_corta": "Lesiones inflamatorias en la piel (pápulas, pústulas)",
        "descripcion_medica": (
            "Afección cutánea caracterizada por la presencia de comedones, pápulas y pústulas "
            "causadas por la obstrucción de los folículos pilosos con sebo y células muertas. "
            "Comúnmente asociado con cambios hormonales, estrés y factores genéticos."
        ),
        "severidad_base": "leve-moderada",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.80,
            "cantidad_detecciones": 5,
        },
        "recomendaciones": [
            "Limpieza facial suave dos veces al día con productos no comedogénicos",
            "Evitar tocar o exprimir las lesiones para prevenir cicatrices",
            "Usar protector solar libre de aceite (oil-free)",
            "Considerar productos con ácido salicílico, niacinamida o peróxido de benzoilo",
            "Mantener el cabello limpio y alejado del rostro",
        ],
        "advertencias": [
            "Si el acné persiste por más de 3 meses sin mejoría, consultar a un dermatólogo",
            "Si presenta dolor intenso, inflamación severa o fiebre, buscar atención médica",
            "El acné quístico o nodular requiere tratamiento dermatológico profesional",
        ],
        "color_ui": "blue",
    },
    "eczema": {
        "id": "eczema",
        "label_es": "Eczema/Dermatitis",
        "label_en": "Eczema/Dermatitis",
        "descripcion_corta": "Áreas con enrojecimiento, descamación y sequedad",
        "descripcion_medica": (
            "Condición inflamatoria de la piel que causa enrojecimiento, picazón, descamación y sequedad. "
            "Puede ser causada por factores ambientales, alergias, irritantes o predisposición genética. "
            "La barrera cutánea se encuentra comprometida."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.75,
            "cantidad_detecciones": 3,
        },
        "recomendaciones": [
            "Aplicar cremas hidratantes ricas en ceramidas y ácido hialurónico",
            "Evitar productos con alcohol, fragancias fuertes o sulfatos",
            "Usar limpiadores suaves y sin jabón",
            "Aplicar compresas frías si hay picazón intensa",
            "Evitar baños con agua muy caliente",
        ],
        "advertencias": [
            "Si la piel presenta exudación, costras o signos de infección, consultar médico",
            "Si la picazón interfiere con el sueño o actividades diarias, buscar atención",
            "El eczema severo o extendido requiere evaluación dermatológica",
        ],
        "color_ui": "red",
    },
    "manchas": {
        "id": "manchas",
        "label_es": "Manchas/Hiperpigmentación",
        "label_en": "Hyperpigmentation",
        "descripcion_corta": "Zonas de piel con tono más oscuro (melasma, manchas solares)",
        "descripcion_medica": (
            "Áreas de la piel que presentan mayor concentración de melanina, resultando en tonos más oscuros. "
            "Puede ser causada por exposición solar, cambios hormonales, inflamación previa (PIH) o envejecimiento. "
            "Generalmente es benigna pero puede requerir tratamiento cosmético."
        ),
        "severidad_base": "cosmética",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.85,
            "cantidad_detecciones": 4,
        },
        "recomendaciones": [
            "Usar protector solar SPF 50+ diariamente, incluso en días nublados",
            "Aplicar sérum con vitamina C por las mañanas",
            "Considerar productos con ácido azelaico o niacinamida",
            "Evitar exposición solar directa entre 10am y 4pm",
            "Usar sombrero de ala ancha al estar al sol",
        ],
        "advertencias": [
            "Si una mancha cambia de forma, tamaño o color rápidamente, consultar dermatólogo",
            "Manchas asimétricas o con bordes irregulares requieren evaluación profesional",
            "Vigilar manchas que sangran, pican o no responden a protección solar",
        ],
        "color_ui": "amber",
    },
    "puntos-negros": {
        "id": "puntos-negros",
        "label_es": "Puntos Negros",
        "label_en": "Blackheads",
        "descripcion_corta": "Comedones abiertos (poros obstruidos oxidados)",
        "descripcion_medica": (
            "Comedones abiertos que se forman cuando los poros se obstruyen con sebo y células muertas. "
            "La oxidación del sebo expuesto al aire le da el color negro característico. "
            "Común en zona T (frente, nariz, mentón) en pieles grasas o mixtas."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.90,
            "cantidad_detecciones": 10,
        },
        "recomendaciones": [
            "Limpieza facial profunda 1-2 veces por semana con productos exfoliantes",
            "Usar productos con ácido salicílico o retinoides suaves",
            "Evitar extracciones agresivas que puedan irritar la piel",
            "Considerar limpieza facial profesional cada 4-6 semanas",
            "Mantener la piel hidratada para evitar exceso de producción de sebo",
        ],
        "advertencias": [
            "Evitar pellizcar o exprimir los comedones para prevenir infección",
            "Si se inflaman o duelen, podría ser acné y requerir tratamiento diferente",
        ],
        "color_ui": "blue",
    },
    "resequedad": {
        "id": "resequedad",
        "label_es": "Resequedad",
        "label_en": "Dryness",
        "descripcion_corta": "Piel deshidratada con tirantez y descamación",
        "descripcion_medica": (
            "Condición caracterizada por falta de humedad en la capa externa de la piel (estrato córneo). "
            "Puede manifestarse con sensación de tirantez, descamación fina, aspereza y pérdida de luminosidad. "
            "Causada por factores ambientales, uso de productos inadecuados o falta de hidratación."
        ),
        "severidad_base": "leve",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.85,
            "cantidad_detecciones": 4,
        },
        "recomendaciones": [
            "Aplicar cremas hidratantes con ceramidas, glicerina o ácido hialurónico",
            "Usar limpiadores cremosos que no resequen (sin sulfatos)",
            "Aumentar consumo de agua (mínimo 2 litros diarios)",
            "Usar humidificador en ambientes secos",
            "Evitar lavados excesivos y agua muy caliente",
        ],
        "advertencias": [
            "Si la resequedad es severa y persistente, puede indicar condición subyacente",
            "Descamación con enrojecimiento intenso requiere evaluación médica",
        ],
        "color_ui": "green",
    },
    "rosacea": {
        "id": "rosacea",
        "label_es": "Rosácea",
        "label_en": "Rosacea",
        "descripcion_corta": "Enrojecimiento facial difuso con posibles vasos visibles",
        "descripcion_medica": (
            "Condición inflamatoria crónica que causa enrojecimiento persistente en el rostro, "
            "especialmente en mejillas, nariz, frente y mentón. Puede presentar vasos sanguíneos visibles, "
            "brotes similares al acné y sensación de ardor. Empeora con factores desencadenantes específicos."
        ),
        "severidad_base": "leve-moderada",
        "requiere_evaluacion_si": {
            "confianza_mayor_a": 0.75,
            "cantidad_detecciones": 3,
        },
        "recomendaciones": [
            "Usar productos suaves para piel sensible, sin alcohol ni fragancias",
            "Aplicar protector solar mineral (óxido de zinc o dióxido de titanio)",
            "Evitar desencadenantes: alcohol, comidas picantes, calor extremo",
            "Considerar productos con niacinamida, azelaic acid o metronidazol tópico",
            "Llevar un diario de brotes para identificar desencadenantes personales",
        ],
        "advertencias": [
            "La rosácea es una condición crónica que requiere diagnóstico dermatológico",
            "Si presenta engrosamiento de la piel nasal, consultar especialista",
            "Síntomas oculares (ojos rojos, ardor) requieren evaluación oftalmológica",
            "Rosácea severa puede requerir tratamiento con antibióticos orales",
        ],
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
