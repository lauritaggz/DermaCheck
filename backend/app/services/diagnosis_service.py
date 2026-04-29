"""
Servicio de generación de diagnóstico preliminar automatizado.

Este servicio toma las detecciones del modelo YOLO y genera un diagnóstico
estructurado con información médica, recomendaciones y advertencias.

Diseñado para ser extendido con persistencia en DB cuando se implemente
la HU de histórico de diagnósticos.
"""

from __future__ import annotations

from app.data import (
    CONDITIONS_CATALOG,
    MEDICAL_DISCLAIMER_MAIN,
    REQUIRES_EVALUATION_MESSAGE,
    get_condition,
    get_disclaimer_by_severity,
)
from app.data.disclaimers import GENERAL_SKINCARE_TIPS
from app.schemas.analysis import DetectionBox
from app.schemas.diagnosis import DetectedCondition, DiagnosisResult


def _calcular_severidad_general(condiciones: list[DetectedCondition]) -> str:
    """
    Determina la severidad general basándose en cantidad y tipo de condiciones.
    
    Returns:
        str: 'ninguna', 'leve', 'moderada', 'severa'
    """
    if not condiciones:
        return "ninguna"
    
    cantidad = len(condiciones)
    confianzas_altas = sum(1 for c in condiciones if c.confianza_promedio > 0.75)
    
    if cantidad >= 4 or confianzas_altas >= 3:
        return "severa"
    elif cantidad >= 3 or confianzas_altas >= 2:
        return "moderada"
    else:
        return "leve"


def _generar_resumen(condiciones: list[DetectedCondition], severidad: str) -> str:
    """Genera un resumen en lenguaje natural del estado de la piel."""
    if not condiciones:
        return "No se detectaron afecciones significativas en tu rostro. Tu piel luce saludable."
    
    cantidad = len(condiciones)
    nombres = [c.label for c in condiciones[:3]]  # Primeras 3
    
    if cantidad == 1:
        return f"Se detectó {nombres[0].lower()} en tu rostro."
    elif cantidad == 2:
        return f"Se detectaron {nombres[0].lower()} y {nombres[1].lower()} en tu rostro."
    elif cantidad == 3:
        return f"Se detectaron {nombres[0].lower()}, {nombres[1].lower()} y {nombres[2].lower()} en tu rostro."
    else:
        return (
            f"Se detectaron {cantidad} afecciones cutáneas: "
            f"{', '.join(nombres)} y otras más."
        )


def _requiere_evaluacion_medica(condiciones: list[DetectedCondition]) -> bool:
    """
    Determina si el caso requiere evaluación médica presencial.
    
    Criterios:
    - Alguna condición cumple sus criterios específicos de evaluación
    - Múltiples condiciones moderadas/severas
    - Alta confianza en condiciones inflamatorias
    """
    if not condiciones:
        return False
    
    # Verificar criterios específicos por condición
    for cond in condiciones:
        condition_data = get_condition(cond.id)
        if not condition_data:
            continue
        
        requisitos = condition_data["requiere_evaluacion_si"]
        if (
            cond.confianza_promedio > requisitos["confianza_mayor_a"]
            and cond.cantidad_detecciones >= requisitos["cantidad_detecciones"]
        ):
            return True
    
    # Criterios generales
    cantidad = len(condiciones)
    confianzas_muy_altas = sum(1 for c in condiciones if c.confianza_promedio > 0.85)
    
    if cantidad >= 4 or confianzas_muy_altas >= 2:
        return True
    
    return False


def generate_diagnosis(detections: list[DetectionBox]) -> DiagnosisResult:
    """
    Genera un diagnóstico preliminar a partir de las detecciones del modelo.
    
    Args:
        detections: Lista de detecciones del modelo YOLO
        
    Returns:
        DiagnosisResult: Diagnóstico estructurado con información médica
    """
    # 1. Agrupar detecciones por clase y calcular promedios
    agrupadas: dict[str, list[DetectionBox]] = {}
    for det in detections:
        class_name = det.class_name.strip().lower()
        if class_name not in agrupadas:
            agrupadas[class_name] = []
        agrupadas[class_name].append(det)
    
    # 2. Construir condiciones detectadas con información del catálogo
    condiciones: list[DetectedCondition] = []
    
    for class_name, dets in agrupadas.items():
        # Obtener info del catálogo
        condition_data = get_condition(class_name)
        if not condition_data:
            # Si no está en el catálogo, saltarla (no debería pasar)
            continue
        
        # Calcular confianza promedio
        confianza_promedio = sum(d.confidence for d in dets) / len(dets)
        
        # Crear condición detectada (solo diagnóstico, sin recomendaciones específicas)
        condicion = DetectedCondition(
            id=condition_data["id"],
            label=condition_data["label_es"],
            confianza_promedio=round(confianza_promedio, 3),
            cantidad_detecciones=len(dets),
            descripcion=condition_data["descripcion_medica"],  # Descripción médica completa
            advertencias=condition_data["advertencias"],
            color_ui=condition_data["color_ui"],
        )
        condiciones.append(condicion)
    
    # Ordenar por confianza (mayor primero)
    condiciones.sort(key=lambda x: x.confianza_promedio, reverse=True)
    
    # 3. Calcular severidad general
    severidad = _calcular_severidad_general(condiciones)
    
    # 4. Determinar si requiere evaluación
    requiere_eval = _requiere_evaluacion_medica(condiciones)
    
    # 5. Generar resumen
    resumen = _generar_resumen(condiciones, severidad)
    
    # 6. Obtener mensajes contextuales
    mensaje_severidad = get_disclaimer_by_severity(severidad)
    
    # 7. Advertencias generales si requiere evaluación
    advertencias = []
    if requiere_eval:
        advertencias.append(REQUIRES_EVALUATION_MESSAGE)
    
    # 8. Consejos generales (máximo 3)
    consejos = GENERAL_SKINCARE_TIPS[:3]
    
    # 9. Construir resultado
    return DiagnosisResult(
        resumen_general=resumen,
        severidad_general=severidad,
        requiere_evaluacion=requiere_eval,
        condiciones_detectadas=condiciones,
        disclaimer=MEDICAL_DISCLAIMER_MAIN,
        mensaje_severidad=mensaje_severidad,
        advertencias_generales=advertencias,
        consejos_generales=consejos,
    )
