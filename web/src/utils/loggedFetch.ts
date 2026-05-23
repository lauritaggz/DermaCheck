import { loggerService } from '../services/loggerService';

interface LoggedFetchOptions extends RequestInit {
  operationName?: string;
  slowThresholdMs?: number;
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export async function loggedFetch(input: RequestInfo | URL, init?: LoggedFetchOptions): Promise<Response> {
  const startedAt = performance.now();
  const url = resolveUrl(input);
  const operationName = init?.operationName ?? 'http_request';
  const slowThresholdMs = init?.slowThresholdMs ?? 3000;

  try {
    const response = await fetch(input, init);
    const elapsedMs = Math.round(performance.now() - startedAt);

    if (elapsedMs > slowThresholdMs) {
      loggerService.warn('Latencia alta en llamada HTTP', {
        operationName,
        url,
        elapsedMs,
        status: response.status,
      });
    }

    if (!response.ok) {
      loggerService.error('Error HTTP en llamada remota', {
        operationName,
        url,
        elapsedMs,
        status: response.status,
      });
    } else {
      loggerService.info('Llamada HTTP exitosa', {
        operationName,
        url,
        elapsedMs,
        status: response.status,
      });
    }

    return response;
  } catch (error) {
    const elapsedMs = Math.round(performance.now() - startedAt);
    loggerService.error('Fallo de red en llamada remota', {
      operationName,
      url,
      elapsedMs,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    throw error;
  }
}
