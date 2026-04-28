/** Mensajes cuando la app requiere servidor y no está configurado. */
export const AUTH_ERRORS = {
  SERVER_REQUIRED:
    'No hay servidor configurado. Añade EXPO_PUBLIC_API_BASE_URL en el archivo .env en la raíz del proyecto y reinicia Expo.',
} as const;
