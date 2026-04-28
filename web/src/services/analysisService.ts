import { apiUrl, getApiBaseUrl } from '../utils/api';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { formatApiNetworkError } from '../utils/networkErrors';
import type { FaceDetection } from '../types';

const API_V1 = '/api/v1';

interface AnalysisResponse {
  user_id: string;
  filename: string;
  total_detections: number;
  detections: FaceDetection[];
}

/**
 * Servicio para análisis facial con el modelo YOLO.
 */
export const analysisService = {
  /**
   * Envía una imagen al backend para análisis con el modelo YOLO.
   * @param imageBlob - Blob de la imagen
   * @param userId - ID del usuario
   * @param confidenceThreshold - Umbral de confianza (default: 0.25)
   */
  async analyzeImage(
    imageBlob: Blob,
    userId: string,
    confidenceThreshold: number = 0.25
  ): Promise<{ data: AnalysisResponse } | { error: string }> {
    if (!getApiBaseUrl()) {
      return { error: 'No hay servidor de análisis configurado. Verifica VITE_API_BASE_URL en .env' };
    }

    const url = apiUrl(`${API_V1}/analysis/inference`);
    
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, 'capture.jpg');
      formData.append('user_id', userId);
      formData.append('conf', confidenceThreshold.toString());

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        return { error: await parseApiErrorMessage(res) };
      }

      const data = (await res.json()) as AnalysisResponse;
      return { data };
    } catch (err) {
      return { error: formatApiNetworkError() };
    }
  },
};
