import { skinAnalysisRecommendations } from '../data/recommendationCatalog';
import type { Recommendation, SuggestedIngredientDetail } from '../types';
import { normalizeConditionKey } from './conditionKeyNormalizer';

export function getIngredientName(
  ingredient: string | SuggestedIngredientDetail,
): string {
  return typeof ingredient === 'string' ? ingredient : ingredient.name;
}

export function getMatchedRecommendations(
  conditionIds: string[],
  includeExpressionLines = false,
): Recommendation[] {
  const keys = new Set(conditionIds.map((id) => normalizeConditionKey(id)));
  if (includeExpressionLines) {
    keys.add('expression_lines');
  }

  return skinAnalysisRecommendations.filter((rec) =>
    rec.relatedConditionKeys?.some((key) => keys.has(normalizeConditionKey(key))),
  );
}

/**
 * Ingredientes únicos en orden de aparición (fuente para queries del scraper).
 */
export function collectUniqueIngredients(recommendations: Recommendation[]): string[] {
  const ingredients: string[] = [];
  const seen = new Set<string>();

  for (const rec of recommendations) {
    for (const ing of rec.suggestedIngredients ?? []) {
      const name = getIngredientName(ing);
      const key = name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      ingredients.push(name);
    }
  }

  return ingredients;
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function collectRoutineSteps(
  recommendations: Recommendation[],
  field: 'morningRoutine' | 'nightRoutine',
): string[] {
  return dedupeStrings(
    recommendations.flatMap((rec) => rec[field] ?? []),
  );
}

export function collectAvoidItems(recommendations: Recommendation[]): string[] {
  return dedupeStrings(recommendations.flatMap((rec) => rec.avoid ?? []));
}

export function collectWhenToConsult(recommendations: Recommendation[]): string[] {
  return dedupeStrings(recommendations.flatMap((rec) => rec.whenToConsult ?? []));
}

export function collectSources(recommendations: Recommendation[]) {
  const seen = new Set<string>();
  const sources: NonNullable<Recommendation['sources']> = [];

  for (const rec of recommendations) {
    for (const source of rec.sources ?? []) {
      const key = source.url.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push(source);
    }
  }

  return sources;
}

export function groupRecommendationsByTime(recommendations: Recommendation[]) {
  const morningSteps = collectRoutineSteps(recommendations, 'morningRoutine');
  const nightSteps = collectRoutineSteps(recommendations, 'nightRoutine');
  const generalSummaries = recommendations
    .map((rec) => rec.summary ?? rec.body ?? '')
    .filter(Boolean);

  return { morningSteps, nightSteps, generalSummaries };
}

export function getRecommendationDisplayLabel(
  rec: Recommendation,
  detectedConditions: { id: string; label: string }[] = [],
): string {
  for (const key of rec.relatedConditionKeys ?? []) {
    const normalized = normalizeConditionKey(key);
    const found = detectedConditions.find(
      (condition) => normalizeConditionKey(condition.id) === normalized,
    );
    if (found) return found.label;
  }
  return rec.title;
}

/** Ordena recomendaciones según el orden de afecciones detectadas en el análisis. */
export function sortRecommendationsByDetectedConditions(
  recommendations: Recommendation[],
  detectedConditions: { id: string }[],
): Recommendation[] {
  if (detectedConditions.length === 0) return recommendations;

  const order = new Map(
    detectedConditions.map((condition, index) => [
      normalizeConditionKey(condition.id),
      index,
    ]),
  );

  return [...recommendations].sort((a, b) => {
    const indexA = Math.min(
      ...(a.relatedConditionKeys ?? []).map((key) => order.get(normalizeConditionKey(key)) ?? Number.MAX_SAFE_INTEGER),
    );
    const indexB = Math.min(
      ...(b.relatedConditionKeys ?? []).map((key) => order.get(normalizeConditionKey(key)) ?? Number.MAX_SAFE_INTEGER),
    );
    return indexA - indexB;
  });
}

export function getStructuredIngredientDetails(
  recommendations: Recommendation[],
): SuggestedIngredientDetail[] {
  const seen = new Set<string>();
  const details: SuggestedIngredientDetail[] = [];

  for (const rec of recommendations) {
    for (const ing of rec.suggestedIngredients ?? []) {
      if (typeof ing === 'string') {
        const key = ing.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);
        details.push({ name: ing, purpose: 'Componente cosmético de apoyo orientativo.' });
        continue;
      }
      const key = ing.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      details.push(ing);
    }
  }

  return details;
}
