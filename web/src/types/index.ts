// ============================================================================
// Tipos para Diagnóstico Preliminar (HU 6)
// ============================================================================

export interface DetectedCondition {
  id: string;
  label: string;
  confianza_promedio: number;
  cantidad_detecciones: number;
  descripcion: string;
  recomendaciones: string[];
  advertencias: string[];
  color_ui: string;
}

export interface MensajeSeveridad {
  titulo: string;
  mensaje: string;
  consejo: string;
}

export interface DiagnosisResult {
  resumen_general: string;
  severidad_general: 'ninguna' | 'leve' | 'moderada' | 'severa';
  requiere_evaluacion: boolean;
  condiciones_detectadas: DetectedCondition[];
  disclaimer: string;
  mensaje_severidad: MensajeSeveridad;
  advertencias_generales: string[];
  consejos_generales: string[];
}

// Análisis completo con diagnóstico (respuesta del endpoint face-analyze)
export interface AnalysisWithDiagnosis {
  ok: boolean;
  user_id: string;
  image: {
    filename: string;
    path: string;
    size_bytes: number;
  };
  analysis: {
    model_conf_threshold: number;
    total_detections: number;
    detections: FaceDetection[];
    processing_time_ms: number;
  };
  diagnosis: DiagnosisResult;
  timestamp: string;
}

// ============================================================================
// Tipos Legacy (anteriores a HU 6)
// ============================================================================

export type SkinSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/** Clasificación cosmética orientativa (inferida junto con el modelo de visión). */
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
  /** Nota aclaratoria (p. ej. confianza del modelo). */
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
  /** Tipo de piel aparente (heurístico a partir de hallazgos). */
  skinType: SkinType;
  /** Por qué se asigna ese tipo (orientativo; no es diagnóstico). */
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
  /** Versión alineada con el catálogo legal del servidor. */
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
  source: 'camera' | 'gallery' | 'upload';
}

/** Detección individual devuelta por el modelo YOLO desde el backend. */
export interface FaceDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number];
}

/** Respuesta del endpoint /api/v1/analysis/face-analyze (subida + IA). */
export interface FaceAnalyzeResponse {
  ok: true;
  user_id: string;
  image: {
    filename: string;
    path: string;
  };
  analysis: {
    model_conf_threshold: number;
    total_detections: number;
    detections: FaceDetection[];
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}
