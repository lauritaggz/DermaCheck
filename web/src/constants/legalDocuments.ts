/**
 * Debe alinearse con `seed_legal_documents.py` en el backend (slug + version).
 */
export const LEGAL_DOCUMENTS = {
  consent_informed: {
    slug: 'consent_informed' as const,
    version: '2.0' as const,
    shortTitle: 'Consentimiento informado para análisis dermatológico orientativo',
  },
  privacy_policy: {
    slug: 'privacy_policy' as const,
    version: '2.0' as const,
    shortTitle: 'Política de privacidad resumida',
  },
  consent_training: {
    slug: 'consent_training' as const,
    version: '1.0' as const,
    shortTitle: 'Autorización opcional para mejora del modelo',
  },
} as const;

/** Versión vigente de la política de privacidad (compatibilidad con código legacy). */
export const LEGAL_DOC_VERSION = LEGAL_DOCUMENTS.privacy_policy.version;
