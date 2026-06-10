interface Step {
  label: string;
  threshold: number;
}

interface Props {
  progress: number;
  steps: Step[];
}

export function AnalysisProgress({ progress, steps }: Props) {
  return (
    <div className="surface-card p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-textSecondary">Progreso del análisis</span>
          <span className="text-lg font-bold text-brand-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-hero-gradient transition-all duration-300 ease-out rounded-full relative"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isCompleted = progress > step.threshold;
          const isActive =
            progress > (steps[idx - 1]?.threshold ?? 0) && progress <= step.threshold;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-teal-50 border-teal-200'
                  : isActive
                    ? 'bg-brand-50 border-brand-200 shadow-soft'
                    : 'bg-white border-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  isCompleted
                    ? 'bg-teal-500 text-white'
                    : isActive
                      ? 'bg-hero-gradient text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted ? 'text-teal-700' : isActive ? 'text-brand-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
