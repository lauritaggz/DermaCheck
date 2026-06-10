import type { ExpressionLinesResult } from '../types';
import { getConfidenceLevel } from '../utils/severityColors';
import { ConfidenceBadge } from './ui/SeverityBadge';

interface Props {
  expressionLines: ExpressionLinesResult;
  cardIndex: number;
}

export function ExpressionLinesFindingCard({ expressionLines, cardIndex }: Props) {
  const confidencePercent = Math.round(expressionLines.average_confidence * 100);
  const confidenceLevel = getConfidenceLevel(expressionLines.average_confidence);

  return (
    <article className="surface-card surface-card-hover border-l-4 border-l-violet-500">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-bold flex items-center justify-center">
                {cardIndex}
              </span>
              <h3 className="font-bold text-lg text-brand-900">Líneas de expresión</h3>
              <ConfidenceBadge level={confidenceLevel} />
            </div>
            <p className="text-sm text-textSecondary">
              Zonas asociadas a líneas de expresión detectadas en la imagen.
            </p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 min-w-[110px] text-center border border-violet-100">
            <div className="text-3xl font-bold text-violet-700">{confidencePercent}%</div>
            <p className="text-[10px] font-semibold text-textMuted uppercase">Confianza</p>
            <p className="text-xs text-textSecondary mt-1">
              {expressionLines.count} detección{expressionLines.count !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-textMuted border-t border-slate-100 pt-3">
          Hallazgo visual preliminar. Recomendaciones específicas en próxima etapa.
        </p>
      </div>
    </article>
  );
}
