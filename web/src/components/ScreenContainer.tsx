import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
}

export function ScreenContainer({ children, scroll = false, className = '' }: Props) {
  const baseClasses = 'min-h-screen p-6';
  const scrollClasses = scroll ? 'overflow-y-auto' : '';

  return (
    <div className={`${baseClasses} ${scrollClasses} ${className}`}>
      <div className="max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
