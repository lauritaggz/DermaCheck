import type { SkinSeverity } from '../types';

const map: Record<SkinSeverity, string> = {
  none: 'No detectado',
  mild: 'Leve',
  moderate: 'Moderado',
  severe: 'Marcado',
};

export function severityLabel(s: SkinSeverity): string {
  return map[s];
}
