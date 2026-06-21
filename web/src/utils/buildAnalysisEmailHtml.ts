import type { AnalysisWithDiagnosis } from '../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SEVERITY_LABELS: Record<string, string> = {
  ninguna: 'Ninguna',
  leve: 'Leve',
  moderada: 'Moderada',
  severa: 'Severa',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CL', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function buildAnalysisEmailHtml(
  analysis: AnalysisWithDiagnosis,
  recipientEmail?: string,
): string {
  const { diagnosis, timestamp } = analysis;
  const dateLabel = formatDate(timestamp);
  const severityLabel = SEVERITY_LABELS[diagnosis.severidad_general] ?? diagnosis.severidad_general;
  const recipientLine = recipientEmail
    ? `<p style="margin:0 0 16px;font-size:14px;color:#475569;">Destinatario: <strong>${escapeHtml(recipientEmail.trim())}</strong></p>`
    : '';

  const conditionsHtml = diagnosis.condiciones_detectadas.length > 0
    ? diagnosis.condiciones_detectadas.map((c) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">${escapeHtml(c.label)}</td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:#334155;">${c.cantidad_detecciones}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="2" style="padding:16px;color:#64748b;text-align:center;">No se detectaron afecciones significativas.</td></tr>`;

  const recommendationsHtml = diagnosis.consejos_generales.length > 0
    ? diagnosis.consejos_generales.map((tip) => `<li style="margin-bottom:8px;">${escapeHtml(tip)}</li>`).join('')
    : '<li style="color:#64748b;">Sin recomendaciones generales adicionales.</li>';

  const warningsHtml = diagnosis.advertencias_generales.length > 0
    ? `
      <div style="margin-top:24px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#b91c1c;">Advertencias y derivación</h3>
        <ul style="margin:0;padding-left:20px;color:#7f1d1d;">
          ${diagnosis.advertencias_generales.map((w) => `<li style="margin-bottom:6px;">${escapeHtml(w)}</li>`).join('')}
        </ul>
        ${diagnosis.requiere_evaluacion
          ? '<p style="margin:12px 0 0;font-weight:600;color:#b91c1c;">Se recomienda consultar con un dermatólogo.</p>'
          : ''}
      </div>`
    : '';

  return `<!DOCTYPE html>
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
              <p style="margin:10px 0 0;font-size:14px;opacity:0.95;">${escapeHtml(dateLabel)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${recipientLine}
              <p style="margin:0 0 20px;padding:14px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;font-size:14px;line-height:1.6;color:#92400e;">
                Este informe es una orientación inicial generada por DermaCheck y no reemplaza la evaluación de un dermatólogo.
              </p>

              <h2 style="margin:0 0 12px;font-size:18px;color:#1B5E96;">Resumen general</h2>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(diagnosis.resumen_general)}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
                Severidad general: <strong style="color:#0f172a;">${escapeHtml(severityLabel)}</strong>
              </p>

              <h2 style="margin:0 0 12px;font-size:18px;color:#1B5E96;">Condiciones detectadas</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th align="left" style="padding:12px;font-size:13px;color:#475569;">Afección</th>
                    <th align="left" style="padding:12px;font-size:13px;color:#475569;">Detecciones</th>
                  </tr>
                </thead>
                <tbody>${conditionsHtml}</tbody>
              </table>

              <h2 style="margin:0 0 12px;font-size:18px;color:#1B5E96;">Recomendaciones generales</h2>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.6;color:#334155;">
                ${recommendationsHtml}
              </ul>

              ${warningsHtml}

              <p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;text-align:center;">
                Gracias por utilizar DermaCheck
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
