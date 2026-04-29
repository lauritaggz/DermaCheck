"""
Disclaimers y mensajes médicos legales para el sistema de análisis.

Estos mensajes son críticos desde el punto de vista legal y de seguridad del paciente.
Cualquier cambio debe ser revisado por el equipo legal y médico.
"""

from __future__ import annotations


# Disclaimer principal - siempre visible
MEDICAL_DISCLAIMER_MAIN = """
**IMPORTANTE: Este es un análisis preliminar automatizado**

Este resultado NO constituye un diagnóstico médico definitivo. Es una herramienta de orientación 
cosmética basada en inteligencia artificial que identifica características visuales en la piel.

Para cualquier condición persistente, dolorosa, preocupante o que interfiera con su calidad de vida, 
consulte presencialmente con un dermatólogo certificado.
"""

# Disclaimer corto para espacios reducidos
MEDICAL_DISCLAIMER_SHORT = """
Resultado preliminar. No reemplaza consulta médica profesional.
"""

# Mensaje para casos que requieren evaluación
REQUIRES_EVALUATION_MESSAGE = """
⚠️ **Se recomienda evaluación médica presencial**

Basándonos en las características detectadas, recomendamos que consulte con un dermatólogo 
para una evaluación completa y personalizada.
"""

# Mensajes por severidad
SEVERITY_MESSAGES = {
    "ninguna": {
        "titulo": "Estado Saludable",
        "mensaje": "No se detectaron afecciones significativas en el análisis.",
        "consejo": "Mantén tu rutina de cuidado básica: limpieza, hidratación y protección solar.",
    },
    "leve": {
        "titulo": "Afecciones Leves Detectadas",
        "mensaje": "Se identificaron condiciones menores que pueden mejorar con cuidados cosméticos básicos.",
        "consejo": "Sigue las recomendaciones específicas para cada condición y mantén una rutina consistente.",
    },
    "moderada": {
        "titulo": "Afecciones Moderadas Detectadas",
        "mensaje": "Se identificaron condiciones que pueden requerir productos específicos y seguimiento.",
        "consejo": "Considera consultar con un dermatólogo si no observas mejoría en 4-6 semanas.",
    },
    "severa": {
        "titulo": "Múltiples Afecciones Detectadas",
        "mensaje": "Se identificaron varias condiciones que podrían beneficiarse de evaluación profesional.",
        "consejo": "Recomendamos consultar con un dermatólogo para un plan de tratamiento personalizado.",
    },
}

# Advertencias generales
GENERAL_WARNINGS = [
    "Si experimentas dolor, sangrado, pus o fiebre, busca atención médica inmediata",
    "Cambios rápidos en manchas o lunares requieren evaluación dermatológica urgente",
    "Picazón intensa que interfiere con el sueño debe ser evaluada por un profesional",
    "Lesiones que no cicatrizan en 2-3 semanas requieren consulta médica",
]

# Consejos generales de cuidado de la piel
GENERAL_SKINCARE_TIPS = [
    "Usar protector solar SPF 50+ diariamente, incluso en días nublados",
    "Mantener una rutina constante: limpieza, hidratación y protección",
    "Dormir 7-8 horas y mantener una dieta balanceada rica en antioxidantes",
    "Evitar tocar el rostro con las manos sin lavar",
    "Limpiar el celular regularmente ya que entra en contacto con el rostro",
    "Cambiar la funda de almohada semanalmente",
]

# Mensaje de limitaciones del sistema
SYSTEM_LIMITATIONS = """
**Limitaciones del análisis automatizado:**

- El sistema analiza únicamente características visibles en fotografías
- No detecta condiciones internas, sistémicas o no visibles
- La precisión puede verse afectada por iluminación, calidad de imagen o ángulo
- Ciertas condiciones dermatológicas requieren pruebas de laboratorio para diagnóstico
- El análisis es un punto de partida, no un diagnóstico definitivo
"""

# Mensaje de privacidad
PRIVACY_MESSAGE = """
Tu imagen se procesa de forma segura en nuestros servidores y no se comparte con terceros. 
Puedes eliminar tus análisis en cualquier momento desde tu perfil.
"""

# Contacto de emergencia (personalizable por región)
EMERGENCY_CONTACT_INFO = """
**¿Cuándo buscar atención médica urgente?**

- Lesiones que sangran sin causa aparente
- Hinchazón severa del rostro
- Dificultad para respirar (podría ser alergia severa)
- Dolor facial intenso acompañado de fiebre

En caso de emergencia médica, contactar servicios de urgencia locales.
"""


def get_disclaimer_by_severity(severidad: str) -> dict[str, str]:
    """Retorna el mensaje apropiado según la severidad."""
    return SEVERITY_MESSAGES.get(severidad, SEVERITY_MESSAGES["leve"])


def get_full_disclaimer() -> str:
    """Retorna el disclaimer completo para documentos o reportes."""
    return f"{MEDICAL_DISCLAIMER_MAIN}\n\n{SYSTEM_LIMITATIONS}\n\n{PRIVACY_MESSAGE}"
