const STEPS = [
  { id: 1, label: 'Inicio' },
  { id: 2, label: 'Guía' },
  { id: 3, label: 'Captura' },
  { id: 4, label: 'Análisis' },
  { id: 5, label: 'Resultados' },
];

interface Props {
  currentStep: number;
  variant?: 'light' | 'dark';
}

export function FlowStepper({ currentStep, variant = 'light' }: Props) {
  const isDark = variant === 'dark';
  return (
    <nav aria-label="Progreso del análisis" className="mb-8">
      <ol className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = idx === STEPS.length - 1;

          return (
            <li key={step.id} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? 'bg-teal-500 text-white shadow-glow-teal'
                      : isCurrent
                        ? 'bg-hero-gradient text-white shadow-glow ring-4 ring-teal-100'
                        : isDark
                          ? 'bg-white/10 border-2 border-white/20 text-white/40'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium hidden xs:block ${
                    isCurrent
                      ? isDark ? 'text-teal-300' : 'text-brand-600'
                      : isCompleted
                        ? isDark ? 'text-emerald-300' : 'text-teal-600'
                        : isDark ? 'text-white/40' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full ${
                    isCompleted ? 'bg-teal-400' : isDark ? 'bg-white/15' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
