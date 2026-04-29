/** Mensajes cuando el análisis por IA (API) no puede ejecutarse. */
export const ANALYSIS_ERRORS = {
  NO_API_URL:
    'No hay servidor de análisis configurado. Configura la variable de entorno VITE_API_BASE_URL con la URL del API.',
  OFFLINE_ACCOUNT:
    'El análisis facial con IA solo está disponible si inicias sesión con una cuenta registrada en el servidor.',
} as const;
