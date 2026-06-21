import { getSeverityLabel } from '../../utils/severityColors';

interface Props {
  level: string;
  size?: 'sm' | 'md';
}

const PILL_CLASS: Record<string, string> = {
  ninguna: 'severity-pill severity-pill--none',
  leve: 'severity-pill severity-pill--low',
  moderada: 'severity-pill severity-pill--moderate',
  severa: 'severity-pill severity-pill--high',
};

export function SeverityBadge({ level, size = 'md' }: Props) {
  const pillClass = PILL_CLASS[level] ?? PILL_CLASS.leve;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : '';

  return (
    <span className={`${pillClass} ${sizeClass}`} role="status" aria-label={`Severidad: ${getSeverityLabel(level)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {getSeverityLabel(level)}
    </span>
  );
}
