/** Mensajes cuando el análisis por IA (API) no puede ejecutarse. */
export const ANALYSIS_ERRORS = {
  NO_API_URL:
    'No hay servidor de análisis configurado. Añade EXPO_PUBLIC_API_BASE_URL en el .env (raíz del proyecto) con la URL del API, por ejemplo http://TU_IP:8000, y reinicia Expo.',
  OFFLINE_ACCOUNT:
    'El análisis facial con IA solo está disponible si inicias sesión con una cuenta registrada en el servidor. Cierra sesión y regístrate o entra con una cuenta creada mientras el API está en marcha.',
} as const;
