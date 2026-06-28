export interface DetectedCondition {
  id: string;
  label: string;
  confianza_promedio: number;
  cantidad_detecciones: number;
  descripcion: string;
  advertencias: string[];
  color_ui: string;
  recomendaciones: string[];
  criterios_derivacion?: string[];
  fuentes?: ConditionSource[];
  sugiere_consulta_dermatologo: boolean;
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
  images_processed?: number;
  images?: Array<{
    filename: string;
    path: string;
    size_bytes: number;
  }>;
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
  images_processed?: number;
  images?: Array<{
    filename: string;
    path: string;
    size_bytes: number;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type RecommendationCategory = 'routine' | 'sun' | 'professional' | 'lifestyle';

export interface ConditionSource {
  nombre?: string;
  name?: string;
  titulo?: string;
  title?: string;
  url: string;
  uso?: string;
}

export interface SuggestedIngredientDetail {
  name: string;
  purpose: string;
  cautions?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  /** Resumen educativo; reemplaza body en entradas nuevas. */
  summary?: string;
  /** Texto legacy para compatibilidad con entradas antiguas. */
  body?: string;
  category?: RecommendationCategory;
  relatedConditionKeys?: string[];
  suggestedIngredients: SuggestedIngredientDetail[] | string[];
  suggestedProductTypes: string[];
  morningRoutine?: string[];
  nightRoutine?: string[];
  avoid?: string[];
  whenToConsult?: string[];
  sources?: ConditionSource[];
}

/** Precios por farmacia para productos sugeridos en resultados. */
export interface ProductPriceMap {
  ahumada?: number | null;
  salcobrand?: number | null;
  cruz_verde?: number | null;
}

/** Producto sugerido proveniente del scraper HU22 en la pantalla de resultados. */
export interface SuggestedProduct {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  precios: ProductPriceMap;
  precio_minimo?: number | null;
  farmacia_minimo?: 'ahumada' | 'salcobrand' | 'cruz_verde' | null;
  url?: string | null;
  fuente?: string;
  fecha_consulta?: string;
  matchedQuery?: string;
  relevanceScore?: number;
  /** Componentes recomendados detectados en el producto. */
  matchedIngredients?: string[];
  /** Afecciones asociadas según componentes coincidentes. */
  matchedConditions?: string[];
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
  /** true si se aceptaron consentimiento informado y política de privacidad vigentes. */
  accepted: boolean;
  acceptedAt: string | null;
  /** Identificador anónimo del flujo actual (tótem). */
  sessionId: string | null;
  consentAnalysisAccepted: boolean;
  privacyPolicyAccepted: boolean;
  trainingConsentAccepted: boolean;
  /** Flag enviado al backend para conservar imagen con fines de entrenamiento. */
  allowTrainingStorage: boolean;
  consentAnalysisVersion: string | null;
  privacyPolicyVersion: string | null;
  trainingConsentVersion: string | null;
  /** Versión legal vigente del flujo (p. ej. consentimiento informado). */
  legalVersion: string | null;
  /** Registros por documento aceptado en el servidor. */
  acceptances?: DocumentAcceptanceRecord[];
  lastSyncedAt?: string | null;
}

/** Campos de consentimiento enviados con la imagen al analizar. */
export interface AnalysisConsentPayload {
  consentAccepted: boolean;
  privacyAccepted: boolean;
  allowTrainingStorage: boolean;
  legalVersion: string;
  sessionId: string;
}

export type AnalysisJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface AnalysisJobSubmitResponse {
  jobId: string;
  status: AnalysisJobStatus;
  position: number;
  pollIntervalSeconds: number;
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
