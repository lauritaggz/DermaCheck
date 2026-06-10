import { ChartIcon } from '../Icons';
import { GlassCard } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';

interface Props {
  imageUrl: string;
  severity: string;
  title: string;
  summary: string;
  advice: string;
}

function ConfidenceRing({ percent }: { percent: number }) {
  const deg = Math.round(percent * 3.6);
  return (
    <div
      className="confidence-ring w-16 h-16"
      style={{ ['--confidence-deg' as string]: `${deg}deg` }}
    >
      <div className="confidence-ring-inner w-full h-full">
        <span className="text-sm font-bold text-brand-700">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

export function AnalyzedImagePanel({ imageUrl, severity, title, summary, advice }: Props) {
  const severityPercent = { ninguna: 10, leve: 35, moderada: 65, severa: 90 }[severity] ?? 35;

  return (
    <GlassCard className="p-5 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-brand-900">Imagen analizada</h2>
        <SeverityBadge level={severity} size="sm" />
      </div>

      <div className="scan-corners ai-card aspect-[3/4] overflow-hidden mb-5 relative">
        <img src={imageUrl} alt="Imagen analizada" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-teal-700 border border-teal-200">
          IA · Analizada
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
        <ConfidenceRing percent={severityPercent} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ChartIcon className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <h3 className="font-bold text-sm text-brand-900 leading-tight">{title}</h3>
          </div>
          <p className="text-sm text-textSecondary leading-relaxed mb-2">{summary}</p>
          <p className="text-xs text-textMuted border-t border-brand-100 pt-2">{advice}</p>
        </div>
      </div>
    </GlassCard>
  );
}
