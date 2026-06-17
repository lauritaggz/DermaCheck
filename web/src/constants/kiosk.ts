/**
 * Usuario técnico de tótem para registrar análisis en backend sin login del cliente final.
 * Debe existir en app_users (p. ej. usuario kiosk creado en despliegue).
 */
export const KIOSK_USER_ID = import.meta.env.VITE_KIOSK_USER_ID?.trim() || '1';
