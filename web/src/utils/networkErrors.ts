export function formatApiNetworkError(): string {
  if (import.meta.env.DEV) {
    return 'No se pudo conectar con el servidor. Comprueba que el backend esté activo (puerto 8001) y reinicia npm run dev.';
  }
  return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
}
