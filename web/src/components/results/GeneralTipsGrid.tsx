import { DocumentIcon } from '../Icons';

interface Props {
  tips: string[];
}

export function GeneralTipsGrid({ tips }: Props) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
          <DocumentIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-900">Consejos generales</h2>
          <p className="text-sm text-textSecondary">Para mantener tu piel saludable</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="surface-card p-4 flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <p className="text-sm text-textSecondary leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
