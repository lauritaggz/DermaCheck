import type { Recommendation } from '../../types';
import { IngredientChip } from '../ui/IngredientChip';
import { collectUniqueIngredients, groupRecommendationsByTime } from '../../utils/recommendationMatcher';

interface Props {
  recommendations: Recommendation[];
}

function RoutineBlock({ title, icon, items }: { title: string; icon: string; items: Recommendation[] }) {
  if (items.length === 0) return null;
  return (
    <div className="surface-card p-5">
      <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((rec) => (
          <div key={rec.id} className="p-3 rounded-xl bg-brand-50 border border-brand-100">
            <p className="font-semibold text-sm text-brand-800 mb-1">{rec.title}</p>
            <p className="text-xs text-textSecondary leading-relaxed">{rec.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StructuredRecommendationsSection({ recommendations }: Props) {
  if (recommendations.length === 0) return null;

  const { morning, night, general } = groupRecommendationsByTime(recommendations);
  const ingredients = collectUniqueIngredients(recommendations);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-900">Rutina sugerida</h2>
        <p className="text-sm text-textSecondary">Orientación general basada en tus hallazgos</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RoutineBlock title="Rutina de mañana" icon="☀️" items={morning} />
        <RoutineBlock title="Rutina de noche" icon="🌙" items={night} />
      </div>

      <RoutineBlock title="Recomendación general" icon="💡" items={general} />

      {ingredients.length > 0 && (
        <div className="surface-card p-5">
          <h3 className="font-bold text-brand-900 mb-1">Componentes dermatocosméticos</h3>
          <p className="text-xs text-textMuted mb-3">Referencia educativa · No es prescripción médica</p>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <IngredientChip key={ing} label={ing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
