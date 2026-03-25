export type SkinSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/** Clasificación cosmética orientativa (simulada en Sprint 1). */
export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SkinCondition {
  id: string;
  key: string;
  label: string;
  description: string;
  severity: SkinSeverity;
  /** Nota para la demo: clarifica que la confianza es simulada */
  analysisNote?: string;
}

export type RecommendationCategory = 'routine' | 'sun' | 'professional' | 'lifestyle';

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  category: RecommendationCategory;
  relatedConditionKeys?: string[];
  /** Ingredientes frecuentes en cosmética; solo orientativos, sin marcas. */
  suggestedIngredients: string[];
  /** Formatos de producto genéricos sugeridos. */
  suggestedProductTypes: string[];
}

export interface SkinAnalysisResult {
  id: string;
  userId: string;
  analyzedAt: string;
  /** Tipo de piel aparente (simulado). */
  skinType: SkinType;
  /** Por qué se asigna ese tipo en la demo (no es diagnóstico). */
  skinTypeRationale: string;
  /** Panorama global de severidad de los hallazgos visibles. */
  severityOverview: string;
  /** Resumen breve para el usuario */
  overallSummary: string;
  /** Estado general legible (p. ej. "Equilibrada con signos leves de fotoenvejecimiento") */
  generalSkinState: string;
  conditions: SkinCondition[];
  recommendations: Recommendation[];
  /** Aviso legal visible en informe */
  medicalDisclaimer: string;
  imageUri?: string;
}

/** Fila devuelta por el backend (#116) o reconstruida en modo local. */
export interface DocumentAcceptanceRecord {
  documentSlug: string;
  title: string;
  versionAccepted: string;
  acceptedAt: string;
  status: string;
}

export interface ConsentStatus {
  accepted: boolean;
  acceptedAt: string | null;
  /** Versión agregada de la demo (alineada con catálogo legal). */
  policyVersion: string;
  /** Registros por documento aceptado (consentimiento, privacidad, etc.). */
  acceptances?: DocumentAcceptanceRecord[];
  /** Última sincronización con API (ISO), si aplica. */
  lastSyncedAt?: string | null;
}

export interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  source: 'camera' | 'gallery';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}
