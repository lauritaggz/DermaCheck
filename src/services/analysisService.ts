import { ANALYSIS_ERRORS } from '../constants/analysisMessages';
import { apiUrl, getApiBaseUrl } from '../config/api';
import type {
  FaceAnalyzeResponse,
  FaceDetection,
  ImageAsset,
  SkinAnalysisResult,
} from '../types';
import { formatApiNetworkError } from '../utils/networkErrors';
import { buildAnalysisFromDetections } from './analysisMappers';

/** Endpoint combinado: sube la imagen, la asocia al usuario y corre la IA. */
export const ANALYSIS_FACE_UPLOAD_PATH = '/api/v1/analysis/face-image';
export const ANALYSIS_FACE_ANALYZE_PATH = '/api/v1/analysis/face-analyze';
/** Inferencia sin guardar archivo de usuario (pruebas / diagnóstico rápido). */
export const ANALYSIS_INFERENCE_PATH = '/api/v1/analysis/inference';

/** Resultado del intento de inferencia real contra el backend. */
export type FaceAnalyzeResult =
  | { ok: true; data: FaceAnalyzeResponse }
  | { ok: false; skipped: true; reason: 'no-api-url' | 'non-numeric-user' }
  | { ok: false; skipped: false; status?: number; message: string };

/**
 * Construye el cuerpo multipart para subir la captura facial.
 * Desacoplado del `fetch` para reutilizar en tests o cliente alternativo.
 */
export function buildFaceImageFormData(image: ImageAsset, userId: string): FormData {
  const fd = new FormData();
  fd.append('user_id', userId);
  fd.append('face_image', {
    uri: image.uri,
    name: 'face_capture.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  return fd;
}

function isNumericUserId(userId: string): boolean {
  return /^\d+$/.test(userId.trim());
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `Error ${res.status}`;
    try {
      const json = JSON.parse(text) as { detail?: string };
      if (json?.detail) return json.detail;
    } catch {
      // no JSON
    }
    return text.slice(0, 200);
  } catch {
    return `Error ${res.status}`;
  }
}

/**
 * Llama al endpoint combinado `/face-analyze` (guarda + IA).
 * Devuelve la respuesta cruda del backend o una razón de fallo/omisión.
 */
export async function analyzeFaceImage(
  image: ImageAsset,
  userId: string,
  options?: { conf?: number; path?: string },
): Promise<FaceAnalyzeResult> {
  if (!getApiBaseUrl()) {
    return { ok: false, skipped: true, reason: 'no-api-url' };
  }
  if (!isNumericUserId(userId)) {
    return { ok: false, skipped: true, reason: 'non-numeric-user' };
  }

  const url = apiUrl(options?.path ?? ANALYSIS_FACE_ANALYZE_PATH);
  try {
    const fd = buildFaceImageFormData(image, userId);
    if (options?.conf !== undefined) {
      fd.append('conf', String(options.conf));
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd,
    });
    if (!res.ok) {
      return {
        ok: false,
        skipped: false,
        status: res.status,
        message: await parseErrorBody(res),
      };
    }
    const data = (await res.json()) as FaceAnalyzeResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, skipped: false, message: formatApiNetworkError() };
  }
}

/**
 * Ejecuta solo el modelo (`best.pt`) sobre una imagen local. No valida usuario en BD.
 * Útil para pruebas en desarrollo (`ModelQuickTest`).
 */
export async function quickInferenceOnImageUri(uri: string, conf = 0.25): Promise<FaceDetection[]> {
  if (!getApiBaseUrl()) {
    throw new Error(ANALYSIS_ERRORS.NO_API_URL);
  }
  const url = apiUrl(ANALYSIS_INFERENCE_PATH);
  try {
    const fd = new FormData();
    fd.append('user_id', '0');
    fd.append('file', {
      uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    fd.append('conf', String(conf));
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd,
    });
    if (!res.ok) {
      throw new Error(await parseErrorBody(res));
    }
    const json = (await res.json()) as { detections: FaceDetection[] };
    return json.detections ?? [];
  } catch (e) {
    if (e instanceof Error && e.message) throw e;
    throw new Error(formatApiNetworkError());
  }
}

export const analysisService = {
  buildFaceImageFormData,
  analyzeFaceImage,

  /**
   * Análisis facial con el modelo YOLO en el servidor (`/face-analyze`).
   * Requiere `EXPO_PUBLIC_API_BASE_URL` y un `userId` numérico (cuenta del API).
   * Si falla la red o el servidor, lanza `Error` con mensaje legible.
   */
  async analyzeImage(params: { image: ImageAsset; userId: string }): Promise<SkinAnalysisResult> {
    if (!getApiBaseUrl()) {
      throw new Error(ANALYSIS_ERRORS.NO_API_URL);
    }
    if (!isNumericUserId(params.userId)) {
      throw new Error(ANALYSIS_ERRORS.OFFLINE_ACCOUNT);
    }

    const outcome = await analyzeFaceImage(params.image, params.userId, { conf: 0.25 });

    if (outcome.ok) {
      return buildAnalysisFromDetections({
        userId: params.userId,
        imageUri: params.image.uri,
        detections: outcome.data.analysis.detections,
      });
    }

    if (outcome.skipped) {
      if (outcome.reason === 'no-api-url') {
        throw new Error(ANALYSIS_ERRORS.NO_API_URL);
      }
      throw new Error(ANALYSIS_ERRORS.OFFLINE_ACCOUNT);
    }

    const detail = outcome.message || 'No se pudo completar el análisis.';
    const prefix =
      outcome.status != null ? `Error del servidor (${outcome.status}). ` : '';
    throw new Error(`${prefix}${detail}`);
  },
};
