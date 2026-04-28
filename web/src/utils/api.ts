/**
 * Configuración de la API para la aplicación web.
 * Lee la URL base de las variables de entorno de Vite.
 */

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('API base URL no está configurada. Define VITE_API_BASE_URL en .env');
  }
  return `${base}${path}`;
}
