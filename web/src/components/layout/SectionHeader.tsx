import type { ReactNode } from 'react';

interface Props {
  badge?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
}

export function SectionHeader({
  badge,
  title,
  description,
  icon,
  align = 'left',
  light = false,
}: Props) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-3 mb-8 ${alignClass}`}>
      {badge && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-700 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
          {badge}
        </span>
      )}
      <div className={`flex items-center gap-3 ${align === 'center' ? 'flex-col' : ''}`}>
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-hero-gradient flex items-center justify-center shadow-soft flex-shrink-0">
            {icon}
          </div>
        )}
        <div className={align === 'center' ? 'text-center' : ''}>
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              light ? 'text-white' : 'text-brand-900'
            }`}
          >
            {title}
          </h2>
          {description && (
            <p className={`mt-1.5 text-sm sm:text-base max-w-xl ${light ? 'text-white/75' : 'text-textSecondary'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
