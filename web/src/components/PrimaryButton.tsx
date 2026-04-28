import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: Variant;
}

export function PrimaryButton({
  label,
  onPress,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  className,
  ...rest
}: Props) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (onPress) onPress();
  };

  const baseClasses = 'min-h-[52px] rounded-xl px-6 flex items-center justify-center font-medium transition-opacity disabled:opacity-45 active:opacity-92';
  
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-surface border border-border text-primary',
    ghost: 'bg-transparent text-primary',
  };

  return (
    <button
      onClick={handleClick}
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
