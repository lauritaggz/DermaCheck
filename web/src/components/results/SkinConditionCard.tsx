import type { DetectedCondition } from '../../types';
import { AlertIcon } from '../Icons';
import { getConfidenceLevel } from '../../utils/severityColors';
import { ConfidenceBadge } from '../ui/SeverityBadge';

const COLOR_BORDER: Record<string, string> = {
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  green: 'border-l-emerald-500',
  red: 'border-l-red-500',
};

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-50',
  amber: 'bg-amber-50',
  green: 'bg-emerald-50',
  red: 'bg-red-50',
};

interface Props {
  condition: DetectedCondition;
  index: number;
}

export function SkinConditionCard({ condition, index }: Props) {
  const confidenceLevel = getConfidenceLevel(condition.confianza_promedio);
  const confidencePercent = Math.round(condition.confianza_promedio * 100);
  const borderColor = COLOR_BORDER[condition.color_ui] ?? COLOR_BORDER.blue;
  const bgColor = COLOR_BG[condition.color_ui] ?? COLOR_BG.blue;

  return (
    <article
      className={`surface-card surface-card-hover border-l-4 ${borderColor} overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-hero-gradient text-white text-sm font-bold flex items-center justify-center">
                {index}
              </span>
              <h3 className="font-bold text-lg text-brand-900">{condition.label}</h3>
              <ConfidenceBadge level={confidenceLevel} />
            </div>
            <p className="text-sm text-textSecondary leading-relaxed">{condition.descripcion}</p>
          </div>

          <div className={`flex-shrink-0 ${bgColor} rounded-xl p-4 min-w-[110px] text-center border border-white`}>
            <div className="text-3xl font-bold text-brand-700 leading-none">{confidencePercent}%</div>
            <p className="text-xs font-semibold text-textMuted normal-case mt-1">Confianza</p>
            <p className="text-xs text-textSecondary mt-2">
              {condition.cantidad_detecciones} detección{condition.cantidad_detecciones !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {condition.recomendaciones.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-teal-50 border border-teal-100">
            <p className="text-xs font-semibold text-teal-700 mb-1">Recomendación inicial</p>
            <p className="text-sm text-teal-900">{condition.recomendaciones[0]}</p>
          </div>
        )}

        {condition.advertencias.length > 0 && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <AlertIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <ul className="space-y-1">
              {condition.advertencias.map((adv, i) => (
                <li key={i} className="text-sm text-amber-800">{adv}</li>
              ))}
            </ul>
          </div>
        )}

        {condition.sugiere_consulta_dermatologo && (
          <p className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1.5">
            🩺 Consulta dermatológica sugerida
          </p>
        )}
      </div>
    </article>
  );
}
