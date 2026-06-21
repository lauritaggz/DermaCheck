import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  variant?: Variant;
}

export function PrimaryButton({
  label,
  disabled,
  loading,
  variant = 'primary',
  className,
  ...rest
}: Props) {
  const base =
    'min-h-[52px] rounded-xl px-6 flex items-center justify-center font-semibold text-sm sm:text-base transition-all duration-250 disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

  const variants = {
    primary: 'btn-primary-glow text-white',
    secondary: 'bg-white border-2 border-brand-200 text-brand-600 hover:border-brand-400 hover:bg-brand-50 shadow-soft',
    ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
    outline: 'bg-transparent border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className || ''}`}
      {...rest}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}
