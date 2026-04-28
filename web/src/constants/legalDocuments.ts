/**
 * Debe alinearse con `seed_legal_documents.py` en el backend (slug + version).
 */
export const LEGAL_DOC_VERSION = '1.0' as const;

export const LEGAL_DOCUMENTS = {
  consent_informed: {
    slug: 'consent_informed' as const,
    version: LEGAL_DOC_VERSION,
    shortTitle: 'Consentimiento informado',
  },
  privacy_policy: {
    slug: 'privacy_policy' as const,
    version: LEGAL_DOC_VERSION,
    shortTitle: 'Política de privacidad',
  },
} as const;
