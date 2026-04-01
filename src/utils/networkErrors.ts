import { getApiBaseUrl } from '../config/api';

/** Mensaje cuando `fetch` falla (timeout, host inalcanzable, sin red). */
export function formatApiNetworkError(): string {
  const u = getApiBaseUrl() || '(sin EXPO_PUBLIC_API_BASE_URL)';
  return (
    'No se pudo conectar al servidor. Arranca el backend (uvicorn en 0.0.0.0:8000), ' +
    'pon en .env la IPv4 de tu Wi‑Fi (ipconfig en Windows, la misma red que el móvil) y reinicia Metro. ' +
    `URL configurada: ${u}.`
  );
}
