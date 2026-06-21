import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'hero' | 'focus';
  className?: string;
}

export function AppShell({ children, variant = 'default', className = '' }: Props) {
  const variantClass =
    variant === 'hero'
      ? 'bg-hero-gradient'
      : variant === 'focus'
        ? 'bg-slate-900'
        : 'app-shell';

  return (
    <div className={`min-h-screen relative ${variantClass} ${className}`}>
      {variant === 'default' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl animate-float-slow" />
          <div
            className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl animate-float-slow"
            style={{ animationDelay: '3s' }}
          />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
