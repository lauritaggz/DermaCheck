import type { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description: string;
  variant?: 'success' | 'neutral';
}

export function EmptyState({ icon, title, description, variant = 'neutral' }: Props) {
  const bg = variant === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`rounded-2xl border p-8 text-center ${bg}`} role="status">
      {icon && <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">{icon}</div>}
      <p className="font-bold text-lg text-brand-900 mb-2">{title}</p>
      <p className="text-sm text-textSecondary leading-relaxed">{description}</p>
    </div>
  );
}
