/** Identificador anónimo por flujo de análisis en tótem (no persistente). */
export function createAnonymousSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
