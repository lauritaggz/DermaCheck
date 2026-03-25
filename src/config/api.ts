/**
 * URL base del API FastAPI (sin barra final).
 * En desarrollo: `http://<tu-ip-LAN>:8000` para que el móvil alcance el PC.
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) return '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
