/**
 * Configuración de la API para la aplicación web.
 * Lee la URL base de las variables de entorno de Vite.
 *
 * Si VITE_API_BASE_URL está vacío en desarrollo, las rutas son relativas
 * y Vite las proxya al backend (ideal para acceso desde iPad/móvil en LAN).
 */

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

/** Backend accesible: URL explícita o proxy de Vite en dev. */
export function isApiAvailable(): boolean {
  return Boolean(getApiBaseUrl()) || import.meta.env.DEV;
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  if (!base) {
    return normalized;
  }
  return `${base.replace(/\/$/, '')}${normalized}`;
}
