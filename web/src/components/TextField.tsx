import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, className, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-brand-700 text-sm font-medium mb-2">{label}</label>
      <input
        className={`
          w-full min-h-[52px] px-4 py-3
          border-2 rounded-xl bg-white text-text
          transition-colors
          ${error ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-brand-200'}
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
          ${className || ''}
        `}
        aria-label={label}
        {...rest}
      />
      {error && <p className="text-red-600 text-sm mt-1.5">{error}</p>}
    </div>
  );
}
