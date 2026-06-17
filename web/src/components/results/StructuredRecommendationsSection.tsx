import type { Recommendation } from '../../types';
import {
  collectAvoidItems,
  collectSources,
  collectWhenToConsult,
  getStructuredIngredientDetails,
  groupRecommendationsByTime,
} from '../../utils/recommendationMatcher';

interface Props {
  recommendations: Recommendation[];
}

function StepList({ title, icon, steps }: { title: string; icon: string; steps: string[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="surface-card p-5">
      <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={`${title}-${i}`} className="flex gap-3 items-start text-sm text-textSecondary">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SourceAttribution({ sources }: { sources: NonNullable<Recommendation['sources']> }) {
  if (sources.length === 0) return null;
  return (
    <div className="surface-card p-4 border border-brand-100 bg-brand-50/50">
      <p className="text-xs font-semibold text-brand-800 mb-2">
        Recomendaciones educativas basadas en fuentes dermatológicas verificables
      </p>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={source.url} className="text-xs text-textSecondary">
            <span className="font-medium text-brand-700">{source.name ?? source.nombre}</span>
            {' — '}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              {source.title ?? source.titulo}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StructuredRecommendationsSection({ recommendations }: Props) {
  if (recommendations.length === 0) return null;

  const { morningSteps, nightSteps, generalSummaries } = groupRecommendationsByTime(recommendations);
  const ingredients = getStructuredIngredientDetails(recommendations);
  const avoid = collectAvoidItems(recommendations);
  const whenToConsult = collectWhenToConsult(recommendations);
  const sources = collectSources(recommendations);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-900">Rutina sugerida</h2>
        <p className="text-sm text-textSecondary">
          Orientación educativa basada en tus hallazgos · No es prescripción médica
        </p>
      </div>

      <SourceAttribution sources={sources} />

      {generalSummaries.length > 0 && (
        <div className="space-y-2">
          {generalSummaries.map((summary, i) => (
            <p key={i} className="text-sm text-textSecondary leading-relaxed surface-card p-4">
              {summary}
            </p>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <StepList title="Rutina de mañana" icon="☀️" steps={morningSteps} />
        <StepList title="Rutina de noche" icon="🌙" steps={nightSteps} />
      </div>

      {ingredients.length > 0 && (
        <div className="surface-card p-5">
          <h3 className="font-bold text-brand-900 mb-1">Componentes dermatocosméticos</h3>
          <p className="text-xs text-textMuted mb-3">Referencia educativa · No es prescripción médica</p>
          <div className="space-y-3">
            {ingredients.map((ing) => (
              <div key={ing.name} className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                <p className="font-semibold text-sm text-brand-800">{ing.name}</p>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">{ing.purpose}</p>
                {ing.cautions && ing.cautions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {ing.cautions.map((caution) => (
                      <li key={caution} className="text-xs text-amber-800">• {caution}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {avoid.length > 0 && (
        <div className="surface-card p-5">
          <h3 className="font-bold text-brand-900 mb-3">Evitar</h3>
          <ul className="space-y-1.5">
            {avoid.map((item) => (
              <li key={item} className="text-sm text-textSecondary flex gap-2">
                <span className="text-red-500" aria-hidden="true">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {whenToConsult.length > 0 && (
        <div className="surface-card p-5 border-l-4 border-l-amber-400">
          <h3 className="font-bold text-brand-900 mb-3">Cuándo consultar a un dermatólogo</h3>
          <ul className="space-y-1.5">
            {whenToConsult.map((item) => (
              <li key={item} className="text-sm text-textSecondary flex gap-2">
                <span className="text-amber-600" aria-hidden="true">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
