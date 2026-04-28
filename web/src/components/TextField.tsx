import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, className, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-textSecondary text-sm mb-2">{label}</label>
      <input
        className={`
          w-full min-h-[52px] px-4 py-3 
          border rounded-xl
          bg-surface text-text
          ${error ? 'border-red-500' : 'border-border'}
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${className || ''}
        `}
        aria-label={label}
        {...rest}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
