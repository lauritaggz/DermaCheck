import type { RecommendationCategory } from '../types';

const map: Record<RecommendationCategory, string> = {
  routine: 'Rutina diaria',
  sun: 'Protección solar',
  professional: 'Derivación profesional',
  lifestyle: 'Estilo de vida',
};

export function recommendationCategoryLabel(c: RecommendationCategory): string {
  return map[c];
}
