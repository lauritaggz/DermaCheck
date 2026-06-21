import type { ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: Props) {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <BrandLogo size="md" />
        </div>
        <h2 className="text-xl font-bold text-brand-900 mb-1">{title}</h2>
        <p className="text-sm text-textSecondary">{description}</p>
      </div>

      <div className="surface-card p-6 sm:p-8">
        {children}
      </div>

      <p className="text-center text-xs text-textMuted mt-6">
        Análisis orientativo con IA · No sustituye consulta dermatológica
      </p>
    </div>
  );
}
