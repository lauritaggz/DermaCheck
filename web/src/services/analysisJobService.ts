import type {
  AnalysisJobStatus,
  AnalysisJobSubmitResponse,
  CombinedFacialAnalysisApiResponse,
} from '../types';
import { apiUrl } from '../utils/api';
import { loggedFetch } from '../utils/loggedFetch';
import { parseApiErrorMessage } from '../utils/apiErrors';

export interface QueueProgressUpdate {
  status: AnalysisJobStatus;
  position: number;
}

export async function submitAnalysisJob(formData: FormData): Promise<AnalysisJobSubmitResponse> {
  const response = await loggedFetch(apiUrl('/api/v1/analysis/jobs'), {
    method: 'POST',
    body: formData,
    operationName: 'submit_analysis_job',
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();
  return {
    jobId: data.job_id,
    status: data.status,
    position: data.position,
    pollIntervalSeconds: data.poll_interval_seconds,
  };
}

export async function getAnalysisJobStatus(jobId: string): Promise<{
  status: AnalysisJobStatus;
  position: number;
  pollIntervalSeconds: number;
  result: CombinedFacialAnalysisApiResponse | null;
  error: string | null;
}> {
  const response = await loggedFetch(apiUrl(`/api/v1/analysis/jobs/${jobId}`), {
    method: 'GET',
    operationName: 'get_analysis_job_status',
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();
  return {
    status: data.status,
    position: data.position,
    pollIntervalSeconds: data.poll_interval_seconds,
    result: data.result ?? null,
    error: data.error ?? null,
  };
}

export async function pollUntilComplete(
  jobId: string,
  onProgress?: (update: QueueProgressUpdate) => void,
): Promise<CombinedFacialAnalysisApiResponse> {
  let intervalMs = 1500;

  for (;;) {
    const statusPayload = await getAnalysisJobStatus(jobId);
    onProgress?.({ status: statusPayload.status, position: statusPayload.position });

    if (statusPayload.status === 'completed') {
      if (!statusPayload.result) {
        throw new Error('Análisis completado sin resultado.');
      }
      return statusPayload.result;
    }

    if (statusPayload.status === 'failed') {
      throw new Error(statusPayload.error ?? 'Error al procesar el análisis.');
    }

    intervalMs = Math.max(500, statusPayload.pollIntervalSeconds * 1000);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
