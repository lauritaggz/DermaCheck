import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function CaptureMethodCard({
  icon,
  title,
  description,
  badge,
  variant = 'secondary',
  onClick,
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        isPrimary
          ? 'ai-card shadow-glow-teal bg-gradient-to-br from-white to-teal-50/30'
          : 'surface-card surface-card-hover'
      }`}
    >
      <div
        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
          isPrimary ? 'bg-hero-gradient shadow-soft' : 'bg-brand-50 border border-brand-100'
        }`}
      >
        {icon}
      </div>
      <h3 className={`text-lg font-bold text-center mb-2 ${isPrimary ? 'text-brand-gradient' : 'text-brand-900'}`}>
        {title}
      </h3>
      <p className="text-sm text-textSecondary text-center mb-3">{description}</p>
      {badge && (
        <p className="text-center text-xs font-semibold text-teal-600 flex items-center justify-center gap-1">
          {badge}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </p>
      )}
    </button>
  );
}
