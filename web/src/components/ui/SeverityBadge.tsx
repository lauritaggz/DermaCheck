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

export function ConfidenceBadge({
  level,
}: {
  level: 'bajo' | 'medio' | 'alto';
}) {
  const config = {
    bajo: { label: 'Confianza baja', class: 'bg-slate-100 text-slate-600 border-slate-200' },
    medio: { label: 'Confianza media', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    alto: { label: 'Confianza alta', class: 'bg-teal-50 text-teal-700 border-teal-200' },
  }[level];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.class}`}
      role="status"
    >
      {config.label}
    </span>
  );
}
