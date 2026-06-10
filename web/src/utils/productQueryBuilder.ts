import type { DetectedCondition, Recommendation } from '../types';

const MAX_QUERIES = 3;
const MAX_QUERY_LENGTH = 120;
const MAX_INGREDIENTS_PER_QUERY = 2;

const FALLBACK_INGREDIENT_PATTERNS: Array<{ pattern: RegExp; query: string }> = [
  { pattern: /ácido salicílico|acido salicilico/i, query: 'limpiador facial ácido salicílico' },
  { pattern: /niacinamida/i, query: 'niacinamida facial' },
  { pattern: /protector solar|fps|spf/i, query: 'protector solar facial' },
  { pattern: /ceramidas/i, query: 'crema ceramidas' },
  { pattern: /ácido hialurónico|acido hialuronico/i, query: 'hidratante ácido hialurónico' },
  { pattern: /pantenol/i, query: 'crema pantenol facial' },
  { pattern: /vitamina c/i, query: 'serum vitamina c facial' },
  { pattern: /peróxido de benzoilo|peroxido de benzoilo/i, query: 'gel peróxido benzoilo facial' },
];

export function normalizeTextForQuery(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function dedupeQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const query of queries) {
    const cleaned = query.replace(/\s+/g, ' ').trim();
    const key = normalizeTextForQuery(cleaned);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function truncateQuery(query: string): string {
  if (query.length <= MAX_QUERY_LENGTH) return query;
  return query.slice(0, MAX_QUERY_LENGTH).trim();
}

function buildQueriesForRecommendation(recommendation: Recommendation): string[] {
  const types = recommendation.suggestedProductTypes ?? [];
  const ingredients = recommendation.suggestedIngredients ?? [];
  const mainIngredients = ingredients.slice(0, MAX_INGREDIENTS_PER_QUERY);
  const queries: string[] = [];

  if (types.length > 0) {
    for (const type of types) {
      queries.push(truncateQuery([type, ...mainIngredients].join(' ')));
    }
    return queries;
  }

  if (ingredients.length > 0) {
    queries.push(truncateQuery(ingredients.slice(0, 3).join(' ')));
  }

  return queries;
}

/**
 * Construye queries para el scraper HU22 a partir de recomendaciones estructuradas.
 */
export function buildProductQueriesFromRecommendations(
  recommendations: Recommendation[],
): string[] {
  const queries = recommendations.flatMap(buildQueriesForRecommendation);

  return dedupeQueries(queries)
    .sort((a, b) => b.length - a.length)
    .slice(0, MAX_QUERIES);
}

/**
 * Fallback cuando no hay recomendaciones estructuradas: extrae ingredientes
 * mencionados en los textos del backend (conditions_catalog).
 */
export function buildFallbackQueriesFromConditions(
  conditions: DetectedCondition[],
): string[] {
  const combinedText = conditions
    .flatMap((condition) => condition.recomendaciones ?? [])
    .join(' ');

  if (!combinedText.trim()) return [];

  const queries = FALLBACK_INGREDIENT_PATTERNS
    .filter(({ pattern }) => pattern.test(combinedText))
    .map(({ query }) => query);

  return dedupeQueries(queries).slice(0, MAX_QUERIES);
}

/**
 * Resuelve las queries finales según prioridad:
 * externalQueries > structured recommendations > backend text fallback.
 */
export function resolveProductSearchQueries(params: {
  externalQueries?: string[];
  matchedRecommendations?: Recommendation[];
  detectedConditions?: DetectedCondition[];
}): string[] {
  const { externalQueries, matchedRecommendations, detectedConditions } = params;

  if (externalQueries?.length) {
    return dedupeQueries(externalQueries).slice(0, MAX_QUERIES);
  }

  if (matchedRecommendations?.length) {
    const structured = buildProductQueriesFromRecommendations(matchedRecommendations);
    if (structured.length > 0) return structured;
  }

  if (detectedConditions?.length) {
    return buildFallbackQueriesFromConditions(detectedConditions);
  }

  return [];
}
