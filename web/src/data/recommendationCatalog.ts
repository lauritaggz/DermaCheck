import type { Recommendation } from '../types';

/**
 * Recomendaciones educativas genéricas (sin marcas), asociadas por claves de hallazgo
 * usadas al construir el informe a partir de las detecciones del modelo.
 */
export const skinAnalysisRecommendations: Recommendation[] = [
  {
    id: 'r-cleanse',
    title: 'Limpieza en piel mixta (zona T vs mejillas)',
    body:
      'En pieles mixtas conviene no "despellejar" todo el rostro como si fuera muy grasa: prioriza un paso suave en mejillas y un refuerzo algo más profundo solo donde hay brillo o poros marcados. Introduce activos exfoliantes de forma gradual y observa tolerancia.',
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
    relatedConditionKeys: ['enlarged_pores', 'expression_lines', 'rosacea', 'dermatitis'],
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
    relatedConditionKeys: ['hyperpigmentation', 'expression_lines', 'rosacea', 'dermatitis'],
    suggestedIngredients: ['protector solar SPF 50+'],
    suggestedProductTypes: ['protector solar de uso diario'],
  },
  {
    id: 'r-pro',
    title: 'Cuándo pedir cita con dermatología',
    body:
      'Si el enrojecimiento arde, hay pústulas dolorosas, la sensación es muy sensible o las lesiones cambian rápido, es razonable una valoración presencial. Esta app no puede descartar ni confirmar enfermedades.',
    category: 'professional',
    relatedConditionKeys: ['rosacea', 'acne', 'dermatitis'],
    suggestedIngredients: ['protector solar SPF 50+'],
    suggestedProductTypes: ['protector solar de uso diario'],
  },
  {
    id: 'r-life',
    title: 'Hábitos que suelen acompañar bien a la piel mixta',
    body:
      'Descanso regular, hidratación oral y gestionar el estrés ayudan al aspecto general de la piel. Evita frotar toallas sobre el rostro y limpia fundas de almohada con frecuencia si hay brotes leves.',
    category: 'lifestyle',
    relatedConditionKeys: ['acne', 'dermatitis'],
    suggestedIngredients: ['pantenol'],
    suggestedProductTypes: ['limpiador suave'],
  },
  {
    id: 'r-dermatitis-care',
    title: 'Cuidado específico para zonas con dermatitis',
    body:
      'Evita productos con alcohol o fragancias fuertes en las zonas irritadas. El uso de syndets (limpiadores sin jabón) y cremas con principios activos calmantes ayuda a restaurar la barrera cutánea sin agredir.',
    category: 'routine',
    relatedConditionKeys: ['dermatitis'],
    suggestedIngredients: ['pantenol', 'avena coloidal', 'ceramidas'],
    suggestedProductTypes: ['limpiador syndet', 'crema calmante para rostro'],
  },
];
