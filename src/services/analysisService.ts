import { apiUrl } from '../config/api';
import { buildMockAnalysisResult } from '../mock';
import type { ImageAsset, SkinAnalysisResult } from '../types';
import { delay } from '../utils/delay';
import { formatApiNetworkError } from '../utils/networkErrors';

const MOCK_PROCESS_MS = 2200;

/** Endpoint previsto en FastAPI (multipart). Ajustar cuando exista el router real. */
export const ANALYSIS_FACE_UPLOAD_PATH = '/api/v1/analysis/face-image';

export type FaceImageUploadResult =
  | { ok: true; status: number }
  | { ok: false; skipped: true }
  | { ok: false; skipped: false; status?: number; message?: string };

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

/**
 * Si `EXPO_PUBLIC_API_BASE_URL` está definido, intenta POST al endpoint de análisis.
 * Si no hay base URL o falla la red, no bloquea la demo: devuelve `skipped` o error suave.
 */
export async function uploadFaceImageForAnalysis(
  image: ImageAsset,
  userId: string,
  options?: { path?: string },
): Promise<FaceImageUploadResult> {
  const path = options?.path ?? ANALYSIS_FACE_UPLOAD_PATH;
  const url = apiUrl(path);
  if (!url) {
    return { ok: false, skipped: true };
  }
  try {
    const body = buildFaceImageFormData(image, userId);
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    });
    if (res.ok) {
      return { ok: true, status: res.status };
    }
    const text = await res.text().catch(() => '');
    return {
      ok: false,
      skipped: false,
      status: res.status,
      message: text ? text.slice(0, 200) : undefined,
    };
  } catch {
    return { ok: false, skipped: false, message: formatApiNetworkError() };
  }
}

export const analysisService = {
  buildFaceImageFormData,
  uploadFaceImageForAnalysis,

  /**
   * Sprint 1: simula pipeline de IA; Sprint 2+ sustituir por API + modelo.
   * Opcionalmente intenta subir la imagen si el backend está configurado.
   */
  async analyzeImage(params: {
    image: ImageAsset;
    userId: string;
    selectedConditionIds?: string[];
  }): Promise<SkinAnalysisResult> {
    await uploadFaceImageForAnalysis(params.image, params.userId);
    await delay(MOCK_PROCESS_MS);
    return buildMockAnalysisResult({
      userId: params.userId,
      imageUri: params.image.uri,
      selectedConditionIds: params.selectedConditionIds,
    });
  },
};
