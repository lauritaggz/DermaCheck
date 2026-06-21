import { apiUrl, isApiAvailable } from '../utils/api';
import { formatApiNetworkError } from '../utils/networkErrors';
import type { AnalysisWithDiagnosis } from '../types';

const API_V1 = '/api/v1';

export interface SendSummaryEmailResponse {
  success: boolean;
  message: string;
}

/** Payload mínimo: solo texto del diagnóstico, sin imágenes ni detecciones YOLO. */
function buildEmailAnalysisPayload(analysis: AnalysisWithDiagnosis) {
  return {
    ok: analysis.ok,
    timestamp: analysis.timestamp,
    diagnosis: {
      resumen_general: analysis.diagnosis.resumen_general,
      severidad_general: analysis.diagnosis.severidad_general,
      requiere_evaluacion: analysis.diagnosis.requiere_evaluacion,
      condiciones_detectadas: analysis.diagnosis.condiciones_detectadas.map((c) => ({
        id: c.id,
        label: c.label,
        descripcion: c.descripcion,
        confianza_promedio: c.confianza_promedio,
        cantidad_detecciones: c.cantidad_detecciones,
        recomendaciones: c.recomendaciones ?? [],
        advertencias: c.advertencias ?? [],
        sugiere_consulta_dermatologo: c.sugiere_consulta_dermatologo ?? false,
      })),
      advertencias_generales: analysis.diagnosis.advertencias_generales,
      consejos_generales: analysis.diagnosis.consejos_generales,
    },
  };
}

/**
 * Envía el resumen del análisis al correo indicado vía backend.
 * El email no se persiste en el cliente ni en el servidor.
 */
export async function sendAnalysisSummaryEmail(
  email: string,
  analysisResult: AnalysisWithDiagnosis,
): Promise<SendSummaryEmailResponse> {
  if (!isApiAvailable()) {
    return {
      success: false,
      message: 'No hay servidor configurado. Verifica VITE_API_BASE_URL.',
    };
  }

  const url = apiUrl(`${API_V1}/analysis/send-summary-email`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        analysis_result: buildEmailAnalysisPayload(analysisResult),
      }),
    });

    const data = (await res.json()) as SendSummaryEmailResponse;

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'No se pudo enviar el resumen. Intenta nuevamente.',
      };
    }

    return data;
  } catch {
    return {
      success: false,
      message: formatApiNetworkError(),
    };
  }
}
