import { skinAnalysisRecommendations } from '../data/recommendationCatalog';
import type { Recommendation } from '../types';
import { normalizeConditionKey } from './conditionKeyNormalizer';

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
      const key = ing.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      ingredients.push(ing);
    }
  }

  return ingredients;
}

export function groupRecommendationsByTime(recommendations: Recommendation[]) {
  const morning = recommendations.filter(
    (r) => r.category === 'sun' || r.id === 'r-cleanse',
  );
  const night = recommendations.filter(
    (r) => r.category === 'routine' && r.id !== 'r-cleanse',
  );
  const general = recommendations.filter(
    (r) => r.category === 'lifestyle' || r.category === 'professional',
  );
  return { morning, night, general };
}
