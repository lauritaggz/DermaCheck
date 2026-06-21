"""Generación de HTML del resumen de análisis para correo."""

from __future__ import annotations

import html

from app.schemas.email import EmailConditionSummary, EmailDiagnosisSummary
from app.services.datetime_display import format_datetime_local
from app.services.email.email_content_helpers import (
    CAUTION_NOTE,
    MEDICAL_DISCLAIMER,
    get_detected_conditions,
    get_main_components_for_conditions,
    get_recommendations_for_email,
)

SEVERITY_LABELS: dict[str, str] = {
    "ninguna": "Ninguna",
    "leve": "Leve",
    "moderada": "Moderada",
    "severa": "Severa",
}

CARD_STYLE = (
    "margin:0 0 20px;padding:20px;background:#f8fafc;"
    "border:1px solid #e2e8f0;border-radius:12px;"
)
SECTION_TITLE = "margin:0 0 12px;font-size:17px;color:#1B5E96;font-weight:700;"


def _escape(value: str) -> str:
    return html.escape(value, quote=True)


def _format_date(iso: str) -> str:
    return format_datetime_local(iso)


def _render_list(items: list[str], *, empty: str) -> str:
    if not items:
        return f'<p style="margin:0;color:#64748b;font-size:14px;">{_escape(empty)}</p>'
    return (
        '<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.65;color:#334155;">'
        + "".join(f'<li style="margin-bottom:8px;">{_escape(item)}</li>' for item in items)
        + "</ul>"
    )


def _render_conditions_card(
    conditions: list[EmailConditionSummary],
    severity_label: str,
) -> str:
    if not conditions:
        return f"""
      <div style="{CARD_STYLE}">
        <h2 style="{SECTION_TITLE}">Afecciones detectadas</h2>
        <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">
          No se detectaron afecciones significativas
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
          Severidad general orientativa: <strong>{_escape(severity_label)}</strong>
        </p>
      </div>"""

    title = "Afecciones detectadas" if len(conditions) > 1 else "Afección detectada"
    rows = ""
    for condition in conditions:
        confidence_pct = f"{round(condition.confianza_promedio * 100)}%"
        rows += f"""
          <tr>
            <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">{_escape(condition.label)}</td>
            <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:#334155;">{condition.cantidad_detecciones}</td>
            <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:#334155;">{_escape(confidence_pct)}</td>
          </tr>"""

    return f"""
      <div style="{CARD_STYLE}">
        <h2 style="{SECTION_TITLE}">{title}</h2>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#64748b;">
          Severidad general orientativa: <strong style="color:#0f172a;">{_escape(severity_label)}</strong>
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th align="left" style="padding:12px;font-size:13px;color:#475569;">Afección</th>
              <th align="left" style="padding:12px;font-size:13px;color:#475569;">Detecciones</th>
              <th align="left" style="padding:12px;font-size:13px;color:#475569;">Confianza</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>"""


def _render_explanation_block(
    diagnosis: EmailDiagnosisSummary,
    conditions: list[EmailConditionSummary],
) -> str:
    if not conditions:
        text = diagnosis.resumen_general
        body = (
            f'<p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:#334155;">'
            f"{_escape(text)}</p>"
        )
    elif len(conditions) == 1:
        condition = conditions[0]
        text = condition.descripcion.strip() or diagnosis.resumen_general
        body = (
            f'<p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:#334155;">'
            f"{_escape(text)}</p>"
        )
    else:
        items = ""
        for condition in conditions:
            description = condition.descripcion.strip() or diagnosis.resumen_general
            items += f"""
            <div style="margin-bottom:12px;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#0f172a;">{_escape(condition.label)}</p>
              <p style="margin:0;font-size:14px;line-height:1.65;color:#334155;">{_escape(description)}</p>
            </div>"""
        body = items

    return f"""
      <div style="{CARD_STYLE}">
        <h2 style="{SECTION_TITLE}">¿Qué significa?</h2>
        {body}
        <p style="margin:0;font-size:13px;line-height:1.55;color:#64748b;">
          Esta descripción es orientativa y no constituye un diagnóstico médico definitivo.
        </p>
      </div>"""


def _render_recommendations_card(recommendations: list[str]) -> str:
    return f"""
      <div style="{CARD_STYLE}">
        <h2 style="{SECTION_TITLE}">Recomendaciones</h2>
        {_render_list(recommendations, empty="No hay recomendaciones específicas adicionales en este momento.")}
      </div>"""


def _render_components_card(
    components: list[dict[str, object]],
    *,
    multiple_conditions: bool = False,
) -> str:
    items_html = ""
    for index, component in enumerate(components, start=1):
        name = str(component.get("name", ""))
        benefit = str(component.get("benefit", ""))
        caution = bool(component.get("caution"))
        caution_html = ""
        if caution:
            caution_html = (
                f'<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#92400e;">'
                f"{_escape(CAUTION_NOTE)}</p>"
            )
        items_html += f"""
        <div style="margin-bottom:12px;padding:14px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
          <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#1B5E96;">
            {index}. {_escape(name)}
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">{_escape(benefit)}</p>
          {caution_html}
        </div>"""

    title = (
        "Componentes sugeridos según tus hallazgos"
        if multiple_conditions
        else "3 componentes principales sugeridos"
    )

    return f"""
      <div style="{CARD_STYLE}">
        <h2 style="{SECTION_TITLE}">{title}</h2>
        <p style="margin:0 0 14px;font-size:13px;line-height:1.55;color:#64748b;">
          Orientación general sobre ingredientes que suelen recomendarse en cuidado de la piel.
          No sustituye una prescripción médica.
        </p>
        {items_html}
      </div>"""


def _render_warnings_block(
    diagnosis: EmailDiagnosisSummary,
    conditions: list[EmailConditionSummary],
) -> str:
    warnings: list[str] = list(diagnosis.advertencias_generales)
    for condition in conditions:
        warnings.extend(condition.advertencias)
        if condition.sugiere_consulta_dermatologo:
            warnings.append(
                f"Se sugiere valoración por un dermatólogo para {condition.label}."
            )
    if diagnosis.requiere_evaluacion:
        warnings.append("Los hallazgos sugieren consultar con un profesional de salud.")

    unique_warnings = list(dict.fromkeys(w for w in warnings if w.strip()))
    if not unique_warnings:
        return ""

    items = "".join(
        f'<li style="margin-bottom:6px;">{_escape(w)}</li>' for w in unique_warnings
    )
    return f"""
      <div style="margin:0 0 20px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#b91c1c;">Atención</h3>
        <ul style="margin:0;padding-left:20px;color:#7f1d1d;font-size:14px;line-height:1.6;">
          {items}
        </ul>
      </div>"""


def build_analysis_email_html(
    diagnosis: EmailDiagnosisSummary,
    timestamp: str,
) -> str:
    """Construye HTML inline compatible con clientes de correo."""
    date_label = _format_date(timestamp)
    severity_label = SEVERITY_LABELS.get(
        diagnosis.severidad_general,
        diagnosis.severidad_general,
    )
    conditions = get_detected_conditions(diagnosis)
    recommendations = get_recommendations_for_email(diagnosis, conditions)
    components = get_main_components_for_conditions(conditions)

    conditions_card = _render_conditions_card(conditions, severity_label)
    explanation = _render_explanation_block(diagnosis, conditions)
    recommendations_card = _render_recommendations_card(recommendations)
    components_card = _render_components_card(
        components,
        multiple_conditions=len(conditions) > 1,
    )
    warnings = _render_warnings_block(diagnosis, conditions)

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resumen de análisis dermatológico — DermaCheck</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1B5E96,#14B8A6);padding:28px 32px;color:#ffffff;">
              <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">DermaCheck</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;">Resumen de análisis dermatológico</h1>
              <p style="margin:10px 0 0;font-size:14px;opacity:0.95;">{_escape(date_label)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;padding:14px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;font-size:14px;line-height:1.6;color:#92400e;">
                {_escape(MEDICAL_DISCLAIMER)}
              </p>

              <div style="margin:0 0 20px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;">
                <h2 style="margin:0 0 8px;font-size:17px;color:#1B5E96;">Resumen simple</h2>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#334155;">{_escape(diagnosis.resumen_general)}</p>
              </div>

              {conditions_card}
              {explanation}
              {recommendations_card}
              {components_card}
              {warnings}

              <p style="margin:0 0 20px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;line-height:1.65;color:#475569;">
                {_escape(MEDICAL_DISCLAIMER)}
              </p>

              <p style="margin:0;padding-top:12px;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;text-align:center;">
                Gracias por utilizar DermaCheck
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def build_analysis_email_text(
    diagnosis: EmailDiagnosisSummary,
    timestamp: str,
) -> str:
    """Versión texto plano para mejorar entregabilidad (multipart/alternative)."""
    date_label = _format_date(timestamp)
    severity_label = SEVERITY_LABELS.get(
        diagnosis.severidad_general,
        diagnosis.severidad_general,
    )
    conditions = get_detected_conditions(diagnosis)
    recommendations = get_recommendations_for_email(diagnosis, conditions)
    components = get_main_components_for_conditions(conditions)

    lines = [
        "DermaCheck — Resumen de análisis dermatológico",
        date_label,
        "",
        MEDICAL_DISCLAIMER,
        "",
        "Resumen simple",
        diagnosis.resumen_general,
        "",
        "Afecciones detectadas" if len(conditions) != 1 else "Afección detectada",
    ]
    if conditions:
        for condition in conditions:
            lines.append(
                f"- {condition.label} "
                f"(detecciones: {condition.cantidad_detecciones}, "
                f"confianza: {round(condition.confianza_promedio * 100)}%)"
            )
        lines.extend(["", f"Severidad general: {severity_label}", "", "¿Qué significa?"])
        if len(conditions) == 1:
            lines.append(
                conditions[0].descripcion.strip() or diagnosis.resumen_general
            )
        else:
            for condition in conditions:
                description = condition.descripcion.strip() or diagnosis.resumen_general
                lines.append(f"{condition.label}: {description}")
    else:
        lines.extend(
            [
                "No se detectaron afecciones significativas",
                f"Severidad general: {severity_label}",
            ]
        )

    lines.extend(["", "Recomendaciones"])
    lines.extend(f"- {tip}" for tip in recommendations)

    components_title = (
        "Componentes sugeridos según tus hallazgos"
        if len(conditions) > 1
        else "3 componentes principales sugeridos"
    )
    lines.extend(["", components_title])
    for index, component in enumerate(components, start=1):
        name = str(component.get("name", ""))
        benefit = str(component.get("benefit", ""))
        lines.append(f"{index}. {name}: {benefit}")
        if component.get("caution"):
            lines.append(f"   {CAUTION_NOTE}")

    lines.extend(["", MEDICAL_DISCLAIMER, "", "Gracias por utilizar DermaCheck"])
    return "\n".join(lines)
