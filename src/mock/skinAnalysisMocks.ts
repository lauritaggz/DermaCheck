import { MEDICAL_DISCLAIMER_SHORT } from '../constants/disclaimers';
import type { Recommendation, SkinAnalysisResult, SkinCondition } from '../types';

/**
 * Escenario demo coherente: piel mixta con varios hallazgos visibles simulados.
 * Las recomendaciones enlazan tipo de piel + hallazgos; ingredientes y formatos son genéricos (sin marcas).
 */
const demoConditions: SkinCondition[] = [
  {
    id: 'c-acne',
    key: 'acne',
    label: 'Acné comedoniano y papular leve',
    description:
      'Algunas lesiones cerradas y pequeñas elevaciones en frente y mentón, compatibles con un grado leve de acné. La intensidad puede variar con el ciclo hormonal o el estrés.',
    severity: 'mild',
    analysisNote: 'Patrón simulado; solo un especialista puede confirmar el tipo de acné.',
  },
  {
    id: 'c-pores',
    key: 'enlarged_pores',
    label: 'Poros visibles en zona T',
    description:
      'Poros más marcados en frente y nariz, frecuentes en pieles con mayor actividad sebácea localizada. No implica por sí solo una enfermedad.',
    severity: 'mild',
    analysisNote: 'Observación visual simulada desde la imagen.',
  },
  {
    id: 'c-pigment',
    key: 'hyperpigmentation',
    label: 'Hiperpigmentación postinflamatoria leve',
    description:
      'Manchas residuales de tono ligeramente más oscuro, posiblemente tras brotes previos o exposición solar intermitente.',
    severity: 'moderate',
    analysisNote: 'Cualquier mancha nueva o que cambie rápido debe revisarse en consulta.',
  },
  {
    id: 'c-lines',
    key: 'expression_lines',
    label: 'Líneas de expresión finas',
    description:
      'Surcos suaves en contorno de ojos y frente asociados a la gesticulación; habituales a cualquier edad adulta.',
    severity: 'mild',
    analysisNote: 'Simulación estética; no indica patología por sí sola.',
  },
  {
    id: 'c-rosacea',
    key: 'rosacea',
    label: 'Enrojecimiento difuso leve a moderado',
    description:
      'Tonos rojizos en pómulos que podrían deberse a sensibilidad, temperatura o un cuadro tipo rosácea; requiere correlación clínica si persiste o arde.',
    severity: 'moderate',
    analysisNote: 'No es diagnóstico: la rosácea se confirma en consulta médica.',
  },
];

const demoRecommendations: Recommendation[] = [
  {
    id: 'r-cleanse',
    title: 'Limpieza en piel mixta (zona T vs mejillas)',
    body:
      'En pieles mixtas conviene no “despellejar” todo el rostro como si fuera muy grasa: prioriza un paso suave en mejillas y un refuerzo algo más profundo solo donde hay brillo o poros marcados. Introduce activos exfoliantes de forma gradual y observa tolerancia.',
    category: 'routine',
    relatedConditionKeys: ['acne', 'enlarged_pores'],
    suggestedIngredients: ['ácido salicílico', 'niacinamida'],
    suggestedProductTypes: ['limpiador en gel', 'limpiador suave'],
  },
  {
    id: 'r-moist',
    title: 'Hidratación que equilibra sin obstruir',
    body:
      'Aunque la zona T luzca más brillante, las mejillas suelen agradecer humectación ligera para mantener la barrera. Texturas en gel-cream o lociones suelen encajar bien en perfiles mixtos similares al tuyo (orientación general, no prescripción).',
    category: 'routine',
    relatedConditionKeys: ['enlarged_pores', 'expression_lines', 'rosacea'],
    suggestedIngredients: ['ácido hialurónico', 'ceramidas', 'pantenol'],
    suggestedProductTypes: ['hidratante ligera', 'crema reparadora'],
  },
  {
    id: 'r-tone',
    title: 'Uniformidad de tono y manchas residuales',
    body:
      'Para un aspecto más homogéneo, los activos clarificantes suelen usarse en sérum y con paciencia (semanas), siempre con fotoprotección diaria. Si notas irritación, reduce frecuencia y consulta.',
    category: 'routine',
    relatedConditionKeys: ['hyperpigmentation', 'expression_lines'],
    suggestedIngredients: ['niacinamida', 'vitamina C', 'ácido azelaico'],
    suggestedProductTypes: ['sérum', 'hidratante ligera'],
  },
  {
    id: 'r-sun',
    title: 'Fotoprotección diaria',
    body:
      'La exposición solar puede intensificar manchas y enrojecimiento. Un protector de amplio espectro ayuda a mantener los resultados de cualquier rutina y a prevenir fotoenvejecimiento.',
    category: 'sun',
    relatedConditionKeys: ['hyperpigmentation', 'expression_lines', 'rosacea'],
    suggestedIngredients: ['protector solar SPF 50+'],
    suggestedProductTypes: ['protector solar de uso diario'],
  },
  {
    id: 'r-pro',
    title: 'Cuándo pedir cita con dermatología',
    body:
      'Si el enrojecimiento arde, hay pústulas dolorosas, la sensación es muy sensible o las lesiones cambian rápido, es razonable una valoración presencial. Esta app no puede descartar ni confirmar enfermedades.',
    category: 'professional',
    relatedConditionKeys: ['rosacea', 'acne'],
    suggestedIngredients: ['protector solar SPF 50+'],
    suggestedProductTypes: ['protector solar de uso diario'],
  },
  {
    id: 'r-life',
    title: 'Hábitos que suelen acompañar bien a la piel mixta',
    body:
      'Descanso regular, hidratación oral y gestionar el estrés ayudan al aspecto general de la piel. Evita frotar toallas sobre el rostro y limpia fundas de almohada con frecuencia si hay brotes leves.',
    category: 'lifestyle',
    relatedConditionKeys: ['acne'],
    suggestedIngredients: ['pantenol'],
    suggestedProductTypes: ['limpiador suave'],
  },
];

export function buildMockAnalysisResult(params: {
  userId: string;
  imageUri?: string;
}): SkinAnalysisResult {
  const now = new Date();
  return {
    id: `analysis_${now.getTime()}`,
    userId: params.userId,
    analyzedAt: now.toISOString(),
    skinType: 'combination',
    skinTypeRationale:
      'En la imagen se aprecia algo más de brillo en frente y nariz, con mejillas relativamente más mate: patrón compatible con piel mixta en una valoración visual simulada (no sustituye una clasificación profesional).',
    severityOverview:
      'La mayoría de hallazgos son leves; la hiperpigmentación focal y el enrojecimiento difuso se marcan como moderados y merecen observación sin interpretarse como urgencia.',
    overallSummary:
      'Perfil compatible con piel mixta y buen estado general de la barrera, con acné leve localizado, poros visibles en zona T, manchas residuales suaves, líneas de expresión finas y rubor leve en pómulos. Todo el conjunto es coherente con un seguimiento cosmético prudente y consulta médica si aparecen síntomas molestos.',
    generalSkinState: 'Hidratación aparentemente adecuada en mejillas; zona T con mayor actividad sebácea visible.',
    conditions: demoConditions,
    recommendations: demoRecommendations,
    medicalDisclaimer: MEDICAL_DISCLAIMER_SHORT,
    imageUri: params.imageUri,
  };
}
