import { PrimaryButton } from '../PrimaryButton';

interface Props {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = 'Algo salió mal',
  message,
  actionLabel = 'Volver al inicio',
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4" role="alert">
      <div className="surface-card max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-900 mb-3">{title}</h2>
        <p className="text-textSecondary text-sm leading-relaxed mb-6">{message}</p>
        {onAction && <PrimaryButton label={actionLabel} onClick={onAction} className="w-full" />}
      </div>
    </div>
  );
}
