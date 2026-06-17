import type { DetectedCondition } from '../../types';
import { SparklesIcon } from '../Icons';
import { DisclaimerBanner } from './DisclaimerBanner';

interface Props {
  conditions: DetectedCondition[];
}

function ConditionSources({ fuentes }: { fuentes: NonNullable<DetectedCondition['fuentes']> }) {
  if (fuentes.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-brand-100">
      <p className="text-xs font-semibold text-brand-700 mb-1.5">Fuente dermatológica</p>
      <ul className="space-y-1">
        {fuentes.map((fuente) => (
          <li key={fuente.url} className="text-xs text-textSecondary">
            <a
              href={fuente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              {fuente.nombre ?? fuente.name} — {fuente.titulo ?? fuente.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecommendationPanel({ conditions }: Props) {
  const withRecs = conditions.filter((c) => c.recomendaciones?.length > 0);

  if (withRecs.length === 0) {
    return (
      <div className="text-center py-6 text-textSecondary text-sm">
        No hay recomendaciones personalizadas disponibles para este análisis.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-900">Recomendaciones personalizadas</h2>
          <p className="text-sm text-textSecondary">
            Orientación educativa adaptada a tus hallazgos · Basada en fuentes dermatológicas
          </p>
        </div>
      </div>

      <DisclaimerBanner
        variant="cosmetic"
        title="Orientación educativa"
        message="Sugerencias generales de cuidado de la piel. No constituyen diagnóstico ni tratamiento médico."
      />

      <div className="space-y-4">
        {withRecs.map((condicion) => (
          <div key={`rec-${condicion.id}`} className="surface-card p-5 border-l-4 border-l-teal-400">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-brand-900">Cuidado para {condicion.label}</h3>
              {condicion.sugiere_consulta_dermatologo && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Consulta sugerida
                </span>
              )}
            </div>
            <ol className="space-y-2.5">
              {condicion.recomendaciones.map((rec, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center border border-teal-200">
                    {i + 1}
                  </span>
                  <span className="text-sm text-textSecondary leading-relaxed">{rec}</span>
                </li>
              ))}
            </ol>

            {condicion.criterios_derivacion && condicion.criterios_derivacion.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-semibold text-amber-900 mb-2">Consultar si presenta:</p>
                <ul className="space-y-1">
                  {condicion.criterios_derivacion.map((criterio) => (
                    <li key={criterio} className="text-xs text-amber-800">• {criterio}</li>
                  ))}
                </ul>
              </div>
            )}

            {condicion.fuentes && condicion.fuentes.length > 0 && (
              <ConditionSources fuentes={condicion.fuentes} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
