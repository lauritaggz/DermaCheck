import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DetectedCondition, Recommendation, SuggestedIngredientDetail } from '../../types';
import {
  collectSources,
  collectWhenToConsult,
  getRecommendationDisplayLabel,
  sortRecommendationsByDetectedConditions,
} from '../../utils/recommendationMatcher';
import { scrollToStableViewAfterExpand } from '../../utils/scrollAnchor';
import { ExpandToggleButton } from './ExpandToggleButton';

const routineStagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const routineItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' as const },
  },
};

interface Props {
  recommendations: Recommendation[];
  detectedConditions?: DetectedCondition[];
}

function StepList({ title, icon, steps }: { title: string; icon: string; steps: string[] }) {
  if (steps.length === 0) return null;
  return (
    <div>
      <h4 className="font-semibold text-brand-900 mb-3 flex items-center gap-2 text-sm">
        <span className="text-base" aria-hidden="true">{icon}</span>
        {title}
      </h4>
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

function IngredientCard({ ingredient }: { ingredient: SuggestedIngredientDetail }) {
  return (
    <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
      <p className="font-semibold text-sm text-brand-800">{ingredient.name}</p>
      <p className="text-xs text-textSecondary mt-1 leading-relaxed">{ingredient.purpose}</p>
      {ingredient.cautions && ingredient.cautions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {ingredient.cautions.map((caution) => (
            <li key={caution} className="text-xs text-amber-800">• {caution}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConditionRecommendationBlock({
  rec,
  label,
  index,
}: {
  rec: Recommendation;
  label: string;
  index: number;
}) {
  const ingredients = (rec.suggestedIngredients ?? []).map((ing) =>
    typeof ing === 'string'
      ? { name: ing, purpose: 'Componente cosmético de apoyo orientativo.' }
      : ing,
  );
  const morningSteps = rec.morningRoutine ?? [];
  const nightSteps = rec.nightRoutine ?? [];
  const avoid = rec.avoid ?? [];
  const summary = rec.summary ?? rec.body ?? '';

  if (
    ingredients.length === 0
    && morningSteps.length === 0
    && nightSteps.length === 0
    && avoid.length === 0
    && !summary
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-brand-100">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-hero-gradient text-white text-sm font-bold flex items-center justify-center">
          {index}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Recomendado para
          </p>
          <h3 className="font-bold text-brand-900 text-base leading-snug">{label}</h3>
        </div>
      </div>

      {summary && (
        <p className="text-sm text-textSecondary leading-relaxed">{summary}</p>
      )}

      {(morningSteps.length > 0 || nightSteps.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          <StepList title="Rutina de mañana" icon="☀️" steps={morningSteps} />
          <StepList title="Rutina de noche" icon="🌙" steps={nightSteps} />
        </div>
      )}

      {ingredients.length > 0 && (
        <div>
          <h4 className="font-semibold text-brand-900 text-sm mb-2">
            Componentes dermatocosméticos sugeridos
          </h4>
          <p className="text-xs text-textMuted mb-3">
            Referencia educativa para esta afección · No es prescripción médica
          </p>
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <IngredientCard key={`${rec.id}-${ing.name}`} ingredient={ing} />
            ))}
          </div>
        </div>
      )}

      {avoid.length > 0 && (
        <div>
          <h4 className="font-semibold text-brand-900 text-sm mb-2">Evitar en este caso</h4>
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

export function StructuredRecommendationsSection({
  recommendations,
  detectedConditions = [],
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  if (recommendations.length === 0) return null;

  const orderedRecommendations = sortRecommendationsByDetectedConditions(
    recommendations,
    detectedConditions,
  );
  const multipleFindings = orderedRecommendations.length > 1;
  const whenToConsult = collectWhenToConsult(recommendations);
  const sources = collectSources(recommendations);

  return (
    <div ref={sectionRef} className="surface-card p-5 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-brand-900">Rutina sugerida</h2>
        <ExpandToggleButton
          expanded={expanded}
          onToggle={() => setExpanded((value) => !value)}
          scrollAnchorRef={sectionRef}
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="routine-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="overflow-hidden"
            onAnimationComplete={() => {
              if (expanded && sectionRef.current) {
                scrollToStableViewAfterExpand(sectionRef.current);
              }
            }}
          >
            <motion.div
              className="space-y-5 pt-5"
              variants={routineStagger}
              initial="initial"
              animate="animate"
            >
              <motion.p variants={routineItem} className="text-sm text-textSecondary">
                {multipleFindings
                  ? 'Cada bloque corresponde a un hallazgo detectado · No es prescripción médica'
                  : 'Orientación educativa basada en tu hallazgo · No es prescripción médica'}
              </motion.p>

              <motion.div variants={routineItem}>
                <SourceAttribution sources={sources} />
              </motion.div>

              <div className="space-y-4">
                {orderedRecommendations.map((rec, i) => (
                  <motion.div key={rec.id} variants={routineItem}>
                    <ConditionRecommendationBlock
                      rec={rec}
                      index={i + 1}
                      label={getRecommendationDisplayLabel(rec, detectedConditions)}
                    />
                  </motion.div>
                ))}
              </div>

              {whenToConsult.length > 0 && (
                <motion.div variants={routineItem} className="surface-card p-5 border-l-4 border-l-amber-400">
                  <h3 className="font-bold text-brand-900 mb-3">Cuándo consultar a un dermatólogo</h3>
                  <ul className="space-y-1.5">
                    {whenToConsult.map((item) => (
                      <li key={item} className="text-sm text-textSecondary flex gap-2">
                        <span className="text-amber-600" aria-hidden="true">!</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
