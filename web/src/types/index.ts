export interface DetectedCondition {
  id: string;
  label: string;
  confianza_promedio: number;
  cantidad_detecciones: number;
  descripcion: string;
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

export interface ExpressionLinesBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ExpressionLinesDetection {
  class_name: string;
  confidence: number;
  box?: ExpressionLinesBox;
}

export interface ExpressionLinesResult {
  detected: boolean;
  count: number;
  average_confidence: number;
  model_name?: string;
  task?: string;
  detections: ExpressionLinesDetection[];
  error?: string;
}

export interface CombinedDiagnosis {
  has_affection_findings: boolean;
  has_expression_lines: boolean;
  summary: string;
}

/** Respuesta cruda de POST /api/v1/analysis/face-analyze-total */
export interface CombinedFacialAnalysisApiResponse {
  ok: boolean;
  user_id: string;
  image: {
    filename: string;
    path: string;
    size_bytes: number;
  };
  analysis_type: string;
  affections: {
    analysis: {
      model_conf_threshold?: number;
      total_detections: number;
      detections: FaceDetection[];
      processing_time_ms?: number;
    };
    diagnosis: DiagnosisResult;
  };
  expression_lines: ExpressionLinesResult;
  combined_diagnosis: CombinedDiagnosis;
  timestamp: string;
  processing_time_ms?: number;
}

// Análisis completo con diagnóstico (face-analyze o normalizado desde face-analyze-total)
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
  /** Presente cuando el análisis proviene del endpoint combinado (HU17). */
  analysis_type?: string;
  expression_lines?: ExpressionLinesResult;
  combined_diagnosis?: CombinedDiagnosis;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  source: 'camera' | 'gallery' | 'upload';
}

/** Detección individual devuelta por el modelo YOLO desde el backend. */
export interface FaceDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}
