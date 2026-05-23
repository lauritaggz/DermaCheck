import { useCallback, useState } from 'react';
import type { AnalysisWithDiagnosis } from '../types';
import { apiUrl } from '../utils/api';
import { loggedFetch } from '../utils/loggedFetch';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { loggerService } from '../services/loggerService';

interface AnalyzeParams {
  imageBlob: Blob;
  userId: string;
  confidenceThreshold?: number;
}

interface UseDermatologyAnalysisResult {
  isRunning: boolean;
  error: string | null;
  analyzeFaceImage: (params: AnalyzeParams) => Promise<AnalysisWithDiagnosis | null>;
  clearError: () => void;
}

export function useDermatologyAnalysis(): UseDermatologyAnalysisResult {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const analyzeFaceImage = useCallback(async ({
    imageBlob,
    userId,
    confidenceThreshold = 0.25,
  }: AnalyzeParams): Promise<AnalysisWithDiagnosis | null> => {
    setError(null);
    setIsRunning(true);
    loggerService.info('Inicio de análisis dermatológico', {
      userId,
      confidenceThreshold,
      sizeBytes: imageBlob.size,
    });

    try {
      const formData = new FormData();
      formData.append('face_image', imageBlob, 'capture.jpg');
      formData.append('user_id', userId);
      formData.append('conf', confidenceThreshold.toString());

      const response = await loggedFetch(apiUrl('/api/v1/analysis/face-analyze'), {
        method: 'POST',
        body: formData,
        operationName: 'face_analyze',
      });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response);
        setError(message);
        loggerService.warn('Análisis dermatológico retornó error HTTP', {
          userId,
          message,
          status: response.status,
        });
        return null;
      }

      const payload = (await response.json()) as AnalysisWithDiagnosis;
      loggerService.info('Análisis dermatológico finalizado', {
        userId,
        totalDetections: payload.analysis.total_detections,
        processingTimeMs: payload.analysis.processing_time_ms,
      });
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al analizar la imagen';
      setError(message);
      loggerService.error('Fallo de red o ejecución en análisis dermatológico', {
        userId,
        message,
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    isRunning,
    error,
    analyzeFaceImage,
    clearError,
  };
}
