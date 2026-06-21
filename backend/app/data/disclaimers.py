"""
Disclaimers médicos y mensajes de seguridad para DermaCheck.
"""

from __future__ import annotations

MEDICAL_DISCLAIMER_MAIN = (
    "DermaCheck entrega orientación educativa y recomendaciones generales de cuidado de la piel. "
    "No reemplaza la evaluación de un dermatólogo ni constituye diagnóstico médico. "
    "Las recomendaciones se basan en referencias dermatológicas verificables (p. ej. DermNet). "
    "Ante dudas, síntomas persistentes o signos de alarma, consulte a un profesional de salud."
)

MEDICAL_DISCLAIMER_SHORT = (
    "Orientación educativa basada en fuentes dermatológicas. No es diagnóstico médico."
)

REQUIRES_EVALUATION_MESSAGE = (
    "Se recomienda evaluación dermatológica presencial por los hallazgos detectados."
)

GENERAL_SKINCARE_TIPS = [
    "Limpieza facial suave, sin frotar en exceso ni usar productos abrasivos.",
    "Hidratación diaria acorde al tipo de piel para apoyar la barrera cutánea.",
    "Fotoprotección de amplio espectro todos los días, incluso en interiores cerca de ventanas.",
    "Evitar manipular lesiones, apretar comedones o usar demasiados activos a la vez.",
    "Consultar a un dermatólogo si los síntomas persisten, empeoran o generan molestia importante.",
]

SEVERITY_MESSAGES: dict[str, dict[str, str]] = {
    "ninguna": {
        "titulo": "Piel sin hallazgos significativos",
        "mensaje": (
            "No se detectaron afecciones relevantes. Mantenga cuidado general "
            "y observe cambios en la piel con el tiempo."
        ),
        "consejo": "Continúe con limpieza suave, hidratación y fotoprotección diaria.",
    },
    "leve": {
        "titulo": "Hallazgos leves",
        "mensaje": (
            "Los hallazgos sugieren cuidado general de la piel y observación. "
            "Mantenga una rutina suave y consulte si los síntomas persisten o empeoran."
        ),
        "consejo": "Priorice limpieza suave, hidratación adecuada y protector solar diario.",
    },
    "moderada": {
        "titulo": "Hallazgos moderados",
        "mensaje": (
            "Se sugiere cuidado general de la piel con seguimiento cercano. "
            "Consulte a un dermatólogo si los síntomas persisten, empeoran o generan molestia importante."
        ),
        "consejo": "Evite irritantes, no manipule lesiones y considere evaluación profesional si no mejora.",
    },
    "severa": {
        "titulo": "Hallazgos que requieren atención",
        "mensaje": (
            "Se recomienda evaluación dermatológica presencial. "
            "Los hallazgos detectados pueden requerir diagnóstico y manejo profesional."
        ),
        "consejo": "Agende consulta con dermatólogo para valoración y orientación personalizada.",
    },
}

ALERT_TRIGGERS: dict[str, str] = {
    "severidad_alta": (
        "Se detectó severidad alta en al menos una afección. "
        "Se recomienda evaluación dermatológica."
    ),
    "multiples_condiciones": (
        "Se detectaron múltiples afecciones simultáneamente. "
        "Un dermatólogo puede orientar el manejo integral."
    ),
    "dolor": "Consulte de inmediato si hay dolor persistente en las lesiones.",
    "sangrado": "Consulte de inmediato si hay sangrado en lesiones cutáneas.",
    "heridas": "Las heridas abiertas o costras extensas requieren evaluación médica.",
    "secrecion": "La secreción o supuración puede indicar infección; consulte a un profesional.",
    "costras": "Costras extensas o persistentes requieren evaluación dermatológica.",
    "inflamacion_intensa": (
        "La inflamación intensa o enrojecimiento marcado requiere evaluación profesional."
    ),
    "cambios_rapidos": (
        "Los cambios rápidos en tamaño, forma o color de lesiones requieren evaluación presencial."
    ),
    "compromiso_ocular": (
        "Si hay síntomas oculares (ojos rojos, irritados, visión borrosa), consulte de inmediato."
    ),
    "manchas_sospechosas": (
        "Algunas lesiones pigmentadas con cambios sospechosos requieren evaluación dermatológica "
        "presencial para descartar condiciones que no pueden evaluarse solo con imagen."
    ),
}


def get_disclaimer_by_severity(severity: str) -> dict[str, str]:
    """Retorna mensaje contextual según severidad (ninguna, leve, moderada, severa)."""
    return SEVERITY_MESSAGES.get(severity.lower(), SEVERITY_MESSAGES["leve"])


def get_alert_message(trigger: str) -> str | None:
    """Retorna mensaje de alerta para un trigger específico."""
    return ALERT_TRIGGERS.get(trigger)


def collect_contextual_alerts(
    severidad: str,
    cantidad_condiciones: int,
    requiere_evaluacion: bool,
) -> list[str]:
    """Genera alertas adicionales según severidad y contexto del análisis."""
    alerts: list[str] = []

    if severidad == "severa":
        msg = get_alert_message("severidad_alta")
        if msg:
            alerts.append(msg)

    if cantidad_condiciones >= 2:
        msg = get_alert_message("multiples_condiciones")
        if msg:
            alerts.append(msg)

    if requiere_evaluacion and severidad != "severa":
        alerts.append(REQUIRES_EVALUATION_MESSAGE)

    return alerts
