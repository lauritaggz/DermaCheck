import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

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
  const baseClasses = 'min-h-[52px] rounded-xl px-6 flex items-center justify-center font-medium transform transition-all duration-200 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none font-sans';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-[0_4px_14px_0_rgba(27,94,150,0.35)] hover:shadow-[0_6px_20px_0_rgba(27,94,150,0.45)] hover:scale-[1.02]',
    secondary: 'bg-white border-2 border-primary/20 text-primary hover:border-primary/45 hover:bg-secondary/40 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-primary hover:bg-secondary/40',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
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
