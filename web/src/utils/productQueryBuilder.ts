import type { DetectedCondition, Recommendation } from '../types';
import { collectUniqueIngredients } from './recommendationMatcher';

const MAX_QUERIES = 3;

/**
 * Términos cortos para FarmaCompara: ingrediente o tipo de producto, nunca diagnóstico.
 */
const INGREDIENT_SCRAPER_QUERIES: Record<string, string> = {
  'acido salicilico': 'acido salicilico limpiador',
  niacinamida: 'niacinamida facial',
  'acido hialuronico': 'acido hialuronico hidratante',
  ceramidas: 'crema hidratante ceramidas',
  pantenol: 'crema pantenol facial',
  'vitamina c': 'serum vitamina c facial',
  'acido azelaico': 'acido azelaico facial',
  'protector solar spf 50+': 'protector solar facial spf 50',
  'protector solar mineral': 'protector solar mineral facial',
  'protector solar': 'protector solar facial',
  'avena coloidal': 'crema avena coloidal',
  'peroxido de benzoilo': 'peroxido de benzoilo facial',
  glicerina: 'hidratante glicerina facial',
  urea: 'crema hidratante urea',
};

const PRODUCT_TYPE_SCRAPER_QUERIES: Record<string, string> = {
  'limpiador suave': 'limpiador suave piel sensible',
  'limpiador suave piel sensible': 'limpiador suave piel sensible',
  'hidratante no comedogenica': 'hidratante no comedogenica',
  'hidratante ligera': 'hidratante ligera facial',
  'emoliente para piel seca': 'emoliente piel seca',
  'crema hidratante con ceramidas': 'crema hidratante ceramidas',
  'limpiador syndet sin jabon': 'limpiador syndet facial',
};

const INGREDIENT_TEXT_PATTERNS: Array<{ pattern: RegExp; ingredientKey: string }> = [
  { pattern: /ácido salicílico|acido salicilico/i, ingredientKey: 'acido salicilico' },
  { pattern: /niacinamida/i, ingredientKey: 'niacinamida' },
  { pattern: /protector solar|fps|spf/i, ingredientKey: 'protector solar' },
  { pattern: /ceramidas/i, ingredientKey: 'ceramidas' },
  { pattern: /ácido hialurónico|acido hialuronico/i, ingredientKey: 'acido hialuronico' },
  { pattern: /pantenol/i, ingredientKey: 'pantenol' },
  { pattern: /vitamina c/i, ingredientKey: 'vitamina c' },
  { pattern: /peróxido de benzoilo|peroxido de benzoilo/i, ingredientKey: 'peroxido de benzoilo' },
  { pattern: /ácido azelaico|acido azelaico/i, ingredientKey: 'acido azelaico' },
  { pattern: /avena coloidal/i, ingredientKey: 'avena coloidal' },
  { pattern: /glicerina/i, ingredientKey: 'glicerina' },
  { pattern: /urea/i, ingredientKey: 'urea' },
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

/**
 * Convierte un componente dermatocosmético en una query corta para el scraper.
 */
export function ingredientToScraperQuery(ingredient: string): string {
  const key = normalizeTextForQuery(ingredient);
  const mapped = INGREDIENT_SCRAPER_QUERIES[key];
  if (mapped) return mapped;

  if (key.includes('protector') || key.includes('spf') || key.includes('fps')) {
    return 'protector solar facial';
  }

  if (key.includes('limpiador')) return 'limpiador suave facial';
  if (key.includes('hidratante') || key.includes('emoliente')) return 'hidratante facial';
  if (key.includes('urea')) return 'crema hidratante urea';

  return `${ingredient.trim()} facial`;
}

function productTypeToScraperQuery(productType: string): string {
  const key = normalizeTextForQuery(productType);
  return PRODUCT_TYPE_SCRAPER_QUERIES[key] ?? productType.trim();
}

/**
 * Construye queries desde ingredientes y tipos de producto del catálogo.
 */
export function buildProductQueriesFromRecommendations(
  recommendations: Recommendation[],
): string[] {
  const ingredientQueries = collectUniqueIngredients(recommendations).map(
    ingredientToScraperQuery,
  );

  const typeQueries = recommendations
    .flatMap((rec) => rec.suggestedProductTypes ?? [])
    .slice(0, 2)
    .map(productTypeToScraperQuery);

  return dedupeQueries([...ingredientQueries, ...typeQueries])
    .sort((a, b) => a.length - b.length)
    .slice(0, MAX_QUERIES);
}

/**
 * Fallback: extrae componentes mencionados en recomendaciones de texto del backend.
 */
export function buildFallbackQueriesFromConditions(
  conditions: DetectedCondition[],
): string[] {
  const combinedText = conditions
    .flatMap((condition) => [
      ...(condition.recomendaciones ?? []),
      ...(condition.descripcion ? [condition.descripcion] : []),
    ])
    .join(' ');

  if (!combinedText.trim()) return [];

  const queries: string[] = [];

  for (const { pattern, ingredientKey } of INGREDIENT_TEXT_PATTERNS) {
    if (!pattern.test(combinedText)) continue;
    const mapped = INGREDIENT_SCRAPER_QUERIES[ingredientKey];
    if (mapped) queries.push(mapped);
  }

  if (queries.length === 0) {
    queries.push('limpiador suave piel sensible');
  }

  return dedupeQueries(queries).slice(0, MAX_QUERIES);
}

/**
 * Resuelve las queries finales según prioridad:
 * externalQueries > ingredientes del catálogo > textos del backend.
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
