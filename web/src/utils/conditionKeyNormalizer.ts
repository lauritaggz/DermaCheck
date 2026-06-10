const conditionKeyMap: Record<string, string> = {
  acne: 'acne',
  rosacea: 'rosacea',

  manchas: 'hyperpigmentation',
  mancha: 'hyperpigmentation',
  hyperpigmentation: 'hyperpigmentation',
  hiperpigmentacion: 'hyperpigmentation',
  'hiperpigmentación': 'hyperpigmentation',

  eczema: 'dermatitis',
  dermatitis: 'dermatitis',

  'puntos-negros': 'enlarged_pores',
  puntos_negros: 'enlarged_pores',
  'puntos negros': 'enlarged_pores',
  comedones: 'enlarged_pores',
  enlarged_pores: 'enlarged_pores',
  poros: 'enlarged_pores',

  resequedad: 'dryness',
  sequedad: 'dryness',
  dryness: 'dryness',
  piel_seca: 'dryness',
  'piel-seca': 'dryness',
  'piel seca': 'dryness',

  arrugas: 'fine_lines',
  arruga: 'fine_lines',
  'lineas-expresion': 'fine_lines',
  lineas_de_expresion: 'fine_lines',
  'líneas de expresión': 'fine_lines',
  'lineas de expresion': 'fine_lines',
  fine_lines: 'fine_lines',
  expression_lines: 'expression_lines',
};

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizeKey(value: string): string {
  return stripAccents(value)
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza claves de afección del backend hacia las usadas en recommendationCatalog.ts.
 */
export function normalizeConditionKey(conditionKey: string): string {
  const sanitized = sanitizeKey(conditionKey);
  const compact = sanitized.replace(/\s+/g, '_');
  const hyphenated = sanitized.replace(/\s+/g, '-');

  return (
    conditionKeyMap[sanitized]
    ?? conditionKeyMap[compact]
    ?? conditionKeyMap[hyphenated]
    ?? sanitized.replace(/\s+/g, '_')
  );
}
