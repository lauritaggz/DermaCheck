import { useCallback, useState } from 'react';
import type { AnalysisConsentPayload, AnalysisWithDiagnosis } from '../types';
import {
  isCombinedFacialAnalysisResponse,
  mapCombinedFacialAnalysis,
} from '../services/analysisMappers';
import {
  pollUntilComplete,
  submitAnalysisJob,
  type QueueProgressUpdate,
} from '../services/analysisJobService';
import { loggerService } from '../services/loggerService';

interface AnalyzeParams {
  imageBlob: Blob;
  userId: string;
  consent: AnalysisConsentPayload;
  onQueueUpdate?: (update: QueueProgressUpdate) => void;
}

interface AnalyzeDoubleParams {
  imageBlob1: Blob;
  imageBlob2: Blob;
  userId: string;
  consent: AnalysisConsentPayload;
  onQueueUpdate?: (update: QueueProgressUpdate) => void;
}

interface UseDermatologyAnalysisResult {
  isRunning: boolean;
  error: string | null;
  analyzeFaceImage: (params: AnalyzeParams) => Promise<AnalysisWithDiagnosis | null>;
  analyzeFaceImagesDouble: (params: AnalyzeDoubleParams) => Promise<AnalysisWithDiagnosis | null>;
  clearError: () => void;
}

function appendConsentFields(formData: FormData, consent: AnalysisConsentPayload) {
  formData.append('consent_accepted', String(consent.consentAccepted));
  formData.append('privacy_accepted', String(consent.privacyAccepted));
  formData.append('allow_training_storage', String(consent.allowTrainingStorage));
  formData.append('legal_version', consent.legalVersion);
  formData.append('session_id', consent.sessionId);
}

async function runAnalysisJob(
  formData: FormData,
  onQueueUpdate: ((update: QueueProgressUpdate) => void) | undefined,
): Promise<AnalysisWithDiagnosis> {
  const submit = await submitAnalysisJob(formData);
  onQueueUpdate?.({ status: submit.status, position: submit.position });

  const raw = await pollUntilComplete(submit.jobId, onQueueUpdate);
  const payload: AnalysisWithDiagnosis = isCombinedFacialAnalysisResponse(raw)
    ? mapCombinedFacialAnalysis(raw)
    : (raw as AnalysisWithDiagnosis);
  return payload;
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
    consent,
    onQueueUpdate,
  }: AnalyzeParams): Promise<AnalysisWithDiagnosis | null> => {
    setError(null);
    setIsRunning(true);
    loggerService.info('Inicio de análisis dermatológico', {
      userId,
      sessionId: consent.sessionId,
      allowTrainingStorage: consent.allowTrainingStorage,
      sizeBytes: imageBlob.size,
    });

    try {
      const formData = new FormData();
      formData.append('face_image', imageBlob, 'capture.jpg');
      formData.append('user_id', userId);
      appendConsentFields(formData, consent);

      const payload = await runAnalysisJob(formData, onQueueUpdate);

      loggerService.info('Análisis facial combinado finalizado', {
        userId,
        sessionId: consent.sessionId,
        totalDetections: payload.analysis.total_detections,
        modelConfThreshold: payload.analysis.model_conf_threshold,
        expressionLinesDetected: payload.expression_lines?.detected ?? false,
        processingTimeMs: payload.analysis.processing_time_ms,
      });
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al analizar la imagen';
      setError(message);
      loggerService.error('Fallo de red o ejecución en análisis dermatológico', {
        userId,
        sessionId: consent.sessionId,
        message,
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const analyzeFaceImagesDouble = useCallback(async ({
    imageBlob1,
    imageBlob2,
    userId,
    consent,
    onQueueUpdate,
  }: AnalyzeDoubleParams): Promise<AnalysisWithDiagnosis | null> => {
    setError(null);
    setIsRunning(true);
    loggerService.info('Inicio de análisis dermatológico doble', {
      userId,
      sessionId: consent.sessionId,
      allowTrainingStorage: consent.allowTrainingStorage,
      sizeBytes1: imageBlob1.size,
      sizeBytes2: imageBlob2.size,
    });

    try {
      const formData = new FormData();
      formData.append('face_image_1', imageBlob1, 'capture_1.jpg');
      formData.append('face_image_2', imageBlob2, 'capture_2.jpg');
      formData.append('user_id', userId);
      appendConsentFields(formData, consent);

      const payload = await runAnalysisJob(formData, onQueueUpdate);

      loggerService.info('Análisis facial doble finalizado', {
        userId,
        sessionId: consent.sessionId,
        totalDetections: payload.analysis.total_detections,
        modelConfThreshold: payload.analysis.model_conf_threshold,
        imagesProcessed: payload.images_processed ?? 2,
        processingTimeMs: payload.analysis.processing_time_ms,
      });
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al analizar las imágenes';
      setError(message);
      loggerService.error('Fallo de red o ejecución en análisis dermatológico doble', {
        userId,
        sessionId: consent.sessionId,
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
    analyzeFaceImagesDouble,
    clearError,
  };
}

export function buildAnalysisConsentPayload(consent: {
  consentAnalysisAccepted: boolean;
  privacyPolicyAccepted: boolean;
  allowTrainingStorage: boolean;
  legalVersion: string | null;
  sessionId: string | null;
}): AnalysisConsentPayload | null {
  if (
    !consent.consentAnalysisAccepted
    || !consent.privacyPolicyAccepted
    || !consent.sessionId
    || !consent.legalVersion
  ) {
    return null;
  }

  return {
    consentAccepted: true,
    privacyAccepted: true,
    allowTrainingStorage: consent.allowTrainingStorage,
    legalVersion: consent.legalVersion,
    sessionId: consent.sessionId,
  };
}
