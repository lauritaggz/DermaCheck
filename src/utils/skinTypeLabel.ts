import type { SkinType } from '../types';

const labels: Record<SkinType, string> = {
  oily: 'Grasa',
  dry: 'Seca',
  combination: 'Mixta',
  sensitive: 'Sensible',
  normal: 'Normal',
};

export function skinTypeLabel(t: SkinType): string {
  return labels[t];
}
