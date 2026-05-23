/**
 * Umbral de líneas de expresión: lo define el backend en app/config.py
 * (o DERMACHECK_EXPRESSION_LINES_CONF en backend/.env).
 *
 * El frontend NO envía expression_lines_conf por defecto; el API usa esa config.
 * Usa este valor solo si necesitas forzar un umbral puntual en el cliente:
 */
export const EXPRESSION_LINES_CONF_OVERRIDE_EXAMPLE = 0.2;