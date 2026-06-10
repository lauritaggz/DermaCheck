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

export function collectUniqueIngredients(recommendations: Recommendation[]): string[] {
  const ingredients = new Set<string>();
  recommendations.forEach((rec) => {
    rec.suggestedIngredients.forEach((ing) => ingredients.add(ing));
  });
  return Array.from(ingredients);
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
