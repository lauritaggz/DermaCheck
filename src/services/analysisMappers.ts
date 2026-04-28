import { MEDICAL_DISCLAIMER_SHORT } from '../constants/disclaimers';
import { skinAnalysisRecommendations } from '../data/recommendationCatalog';
import type {
  FaceDetection,
  Recommendation,
  SkinAnalysisResult,
  SkinCondition,
  SkinSeverity,
  SkinType,
} from '../types';

/**
 * Mapeo de clases del modelo YOLO entrenado a información clínica/cosmética
 * orientativa. Cada clase apunta a una o más `relatedConditionKeys` del catálogo
 * de recomendaciones para que la pantalla de recomendaciones siga funcionando.
 */
interface ConditionTemplate {
  key: string;
  label: string;
  description: string;
  /** Claves usadas en `Recommendation.relatedConditionKeys` para encontrar recos. */
  recommendationKeys: string[];
  analysisNote?: string;
}

const CLASS_TEMPLATES: Record<string, ConditionTemplate> = {
  acne: {
    key: 'acne',
    label: 'Acné (lesiones inflamatorias)',
    description:
      'Se observan lesiones compatibles con acné inflamatorio (pápulas/pústulas). La intensidad puede variar con el ciclo hormonal, estrés o rutina actual.',
    recommendationKeys: ['acne'],
    analysisNote: 'Los hallazgos son orientativos. Para casos persistentes consulta con dermatología.',
  },
  eczema: {
    key: 'dermatitis',
    label: 'Eczema / dermatitis (signos compatibles)',
    description:
      'Áreas con descamación fina, enrojecimiento o sequedad localizada compatibles con eczema o dermatitis. Suele requerir cuidado de barrera y evitar irritantes.',
    recommendationKeys: ['dermatitis'],
    analysisNote: 'No sustituye un diagnóstico clínico presencial.',
  },
  manchas: {
    key: 'hyperpigmentation',
    label: 'Manchas / hiperpigmentación',
    description:
      'Zonas de tono más oscuro, posiblemente residuales de brotes previos o exposición solar. Se benefician de fotoprotección diaria y activos despigmentantes suaves.',
    recommendationKeys: ['hyperpigmentation'],
    analysisNote: 'Vigilar manchas que cambien de forma o color rápidamente.',
  },
  'puntos-negros': {
    key: 'blackheads',
    label: 'Puntos negros (comedones abiertos)',
    description:
      'Pequeños puntos oscuros en zona T por acumulación de sebo y queratina oxidados. Suelen mejorar con limpieza adecuada y exfoliación gradual.',
    // Los puntos negros forman parte del espectro acneico y comparten cuidados con poros marcados.
    recommendationKeys: ['acne', 'enlarged_pores'],
    analysisNote: 'Evita extracciones agresivas para no irritar la piel.',
  },
  resequedad: {
    key: 'dryness',
    label: 'Resequedad / piel deshidratada',
    description:
      'Zonas con sensación de tirantez, descamación leve o aspecto apagado. La barrera cutánea puede estar debilitada y necesita reforzarse con humectación e ingredientes calmantes.',
    // La resequedad comparte cuidados con dermatitis (barrera, sin alcohol, ceramidas).
    recommendationKeys: ['dermatitis'],
    analysisNote: 'Evita limpiadores agresivos y prioriza hidratación constante.',
  },
  rosacea: {
    key: 'rosacea',
    label: 'Enrojecimiento difuso compatible con rosácea',
    description:
      'Tonos rojizos en mejillas/nariz, posibles vasos visibles. Puede deberse a sensibilidad, temperatura o un cuadro tipo rosácea; requiere correlación clínica si persiste o arde.',
    recommendationKeys: ['rosacea'],
    analysisNote: 'La rosácea requiere confirmación clínica para tratamiento dirigido.',
  },
  wrinkle: {
    key: 'expression_lines',
    label: 'Arrugas / líneas de expresión',
    description:
      'Surcos suaves en contorno de ojos, frente o entrecejo asociados a la gesticulación y al fotoenvejecimiento. Habituales en cualquier edad adulta.',
    recommendationKeys: ['expression_lines'],
    analysisNote: 'Hallazgo estético; no indica patología por sí solo.',
  },
};

/** Limpia espacios y normaliza la clave devuelta por el modelo (`"wrinkle - vdataset ..."`). */
function normalizeClassName(raw: string): string {
  const clean = raw.split(/[\s-]/u)[0]?.toLowerCase() ?? '';
  if (clean === 'puntos') return 'puntos-negros';
  return clean;
}

function severityFromConfidence(avg: number, count: number): SkinSeverity {
  if (avg >= 0.7 && count >= 3) return 'severe';
  if (avg >= 0.5 || count >= 2) return 'moderate';
  return 'mild';
}

function inferSkinType(keys: Set<string>): { type: SkinType; rationale: string } {
  const hasOily = keys.has('acne') || keys.has('blackheads');
  const hasDry = keys.has('dryness') || keys.has('dermatitis');
  const hasSensitive = keys.has('rosacea');

  if (hasOily && hasDry) {
    return {
      type: 'combination',
      rationale:
        'Se detectan signos típicos de zonas grasas (acné/comedones) junto con áreas más secas o sensibles, compatible con piel mixta.',
    };
  }
  if (hasOily) {
    return {
      type: 'oily',
      rationale:
        'La presencia de comedones y/o lesiones acneicas sugiere mayor producción sebácea en zona T.',
    };
  }
  if (hasDry) {
    return {
      type: 'dry',
      rationale:
        'Los hallazgos de resequedad o dermatitis sugieren una barrera cutánea debilitada que requiere refuerzo de humectación.',
    };
  }
  if (hasSensitive) {
    return {
      type: 'sensitive',
      rationale:
        'El enrojecimiento difuso sugiere una piel sensible o reactiva que conviene tratar con productos suaves.',
    };
  }
  return {
    type: 'normal',
    rationale:
      'No se identifican signos predominantes de grasa, sequedad o reactividad; piel aparentemente equilibrada.',
  };
}

function severityOverview(conditions: SkinCondition[]): string {
  if (conditions.length === 0) {
    return 'No se han identificado hallazgos visibles relevantes con el umbral configurado.';
  }
  if (conditions.some((c) => c.severity === 'severe')) {
    return 'Se detectan hallazgos importantes; conviene una valoración profesional para precisar diagnóstico.';
  }
  if (conditions.some((c) => c.severity === 'moderate')) {
    return 'Se detectan algunos hallazgos de severidad moderada que pueden mejorarse con rutina y constancia.';
  }
  return 'La mayoría de hallazgos detectados son de intensidad leve.';
}

function buildConditions(detections: FaceDetection[]): SkinCondition[] {
  const grouped = new Map<string, FaceDetection[]>();
  for (const det of detections) {
    const cls = normalizeClassName(det.class_name);
    if (!CLASS_TEMPLATES[cls]) continue;
    const list = grouped.get(cls) ?? [];
    list.push(det);
    grouped.set(cls, list);
  }

  const conditions: SkinCondition[] = [];
  for (const [cls, items] of grouped) {
    const tpl = CLASS_TEMPLATES[cls];
    const avg = items.reduce((s, d) => s + d.confidence, 0) / items.length;
    const sev = severityFromConfidence(avg, items.length);
    const confPct = Math.round(avg * 100);
    conditions.push({
      id: `det-${tpl.key}`,
      key: tpl.key,
      label: tpl.label,
      description:
        items.length > 1
          ? `${tpl.description} (${items.length} regiones detectadas, confianza media ${confPct}%).`
          : `${tpl.description} (confianza ${confPct}%).`,
      severity: sev,
      analysisNote: tpl.analysisNote,
    });
  }
  return conditions;
}

function pickRecommendations(detections: FaceDetection[]): Recommendation[] {
  const recoKeys = new Set<string>();
  for (const det of detections) {
    const cls = normalizeClassName(det.class_name);
    const tpl = CLASS_TEMPLATES[cls];
    if (!tpl) continue;
    for (const k of tpl.recommendationKeys) recoKeys.add(k);
  }
  return skinAnalysisRecommendations.filter((r) =>
    r.relatedConditionKeys?.some((k) => recoKeys.has(k)),
  );
}

/** Construye un `SkinAnalysisResult` a partir de la respuesta real del backend. */
export function buildAnalysisFromDetections(params: {
  userId: string;
  imageUri?: string;
  detections: FaceDetection[];
}): SkinAnalysisResult {
  const now = new Date();
  const conditions = buildConditions(params.detections);
  const recommendations = pickRecommendations(params.detections);
  const keys = new Set(conditions.map((c) => c.key));
  const skin = inferSkinType(keys);

  const overallSummary =
    conditions.length === 0
      ? 'No se detectaron hallazgos por encima del umbral del modelo. Esto no descarta condiciones que requieran valoración presencial.'
      : `El modelo identificó ${conditions.length} hallazgo${
          conditions.length === 1 ? '' : 's'
        } principal${conditions.length === 1 ? '' : 'es'}: ${conditions
          .map((c) => c.label.split(' ')[0].toLowerCase())
          .join(', ')}.`;

  const generalSkinState =
    conditions.length === 0
      ? 'Estado cutáneo aparentemente equilibrado en el momento del análisis.'
      : `Estado compatible con seguimiento cosmético orientado a: ${conditions
          .map((c) => c.label.split(' ')[0].toLowerCase())
          .join(', ')}.`;

  return {
    id: `analysis_${now.getTime()}`,
    userId: params.userId,
    analyzedAt: now.toISOString(),
    skinType: skin.type,
    skinTypeRationale: skin.rationale,
    severityOverview: severityOverview(conditions),
    overallSummary,
    generalSkinState,
    conditions,
    recommendations,
    medicalDisclaimer: MEDICAL_DISCLAIMER_SHORT,
    imageUri: params.imageUri,
  };
}
