import { ChartIcon } from '../Icons';
import { GlassCard } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { RotatingAnalysisImages } from './RotatingAnalysisImages';

interface Props {
  imageUrl: string;
  imageUrls?: string[];
  severity: string;
  title: string;
  summary: string;
  advice: string;
}

export function AnalyzedImagePanel({
  imageUrl,
  imageUrls,
  severity,
  title,
  summary,
  advice,
}: Props) {
  const urls = imageUrls?.length ? imageUrls : [imageUrl];

  return (
    <GlassCard className="p-5 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-brand-900">
          {urls.length > 1 ? 'Imágenes analizadas' : 'Imagen analizada'}
        </h2>
        <SeverityBadge level={severity} size="sm" />
      </div>

      <RotatingAnalysisImages imageUrls={urls} className="mb-5" />

      <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
        <div>
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
