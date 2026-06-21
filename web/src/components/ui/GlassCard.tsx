import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'ai' | 'flat';
  hover?: boolean;
}

export function GlassCard({ children, className = '', variant = 'default', hover = false }: Props) {
  const base =
    variant === 'ai'
      ? 'ai-card'
      : variant === 'flat'
        ? 'bg-white border border-slate-100 rounded-2xl shadow-soft'
        : 'surface-card';

  const hoverClass = hover ? 'surface-card-hover' : '';

  return <div className={`${base} ${hoverClass} ${className}`}>{children}</div>;
}
