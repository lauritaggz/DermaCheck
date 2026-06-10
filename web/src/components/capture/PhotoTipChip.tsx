import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PhotoTipChip({ icon, title, description }: Props) {
  return (
    <div className="surface-card p-4 text-center surface-card-hover">
      <div className="w-11 h-11 mx-auto rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-brand-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-textSecondary leading-relaxed">{description}</p>
    </div>
  );
}
