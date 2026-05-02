import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'none';
  centered?: boolean;
  fillScreen?: boolean;
}

export function ScreenContainer({ 
  children, 
  scroll = false, 
  className = '',
  maxWidth = '2xl',
  centered = true,
  fillScreen = false
}: Props) {
  const maxWidthClasses = {
    'sm': 'max-w-screen-sm',
    'md': 'max-w-screen-md',
    'lg': 'max-w-screen-lg',
    'xl': 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '3xl': 'max-w-screen-3xl',
    'full': 'max-w-full',
    'none': ''
  };

  const heightClass = fillScreen ? 'h-screen' : 'min-h-screen';
  const scrollClasses = scroll ? 'overflow-y-auto' : '';
  const centerClasses = centered ? 'mx-auto' : '';
  const paddingClasses = maxWidth === 'full' || maxWidth === 'none' ? '' : 'px-4 sm:px-6 lg:px-8';

  return (
    <div className={`${heightClass} ${scrollClasses} ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} ${centerClasses} ${paddingClasses} h-full`}>
        {children}
      </div>
    </div>
  );
}
