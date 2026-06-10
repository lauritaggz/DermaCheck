import type { SuggestedProduct } from '../../types';
import { getProductKey, PRODUCT_SUGGESTIONS_DISCLAIMER } from '../../utils/productSuggestionUtils';
import { ProductSuggestionCard } from './ProductSuggestionCard';

interface Props {
  products?: SuggestedProduct[];
  loading?: boolean;
  error?: string | null;
  queriesUsed?: string[];
  warning?: string | null;
}

export function ProductSuggestionsSection({
  products = [],
  loading = false,
  error = null,
  queriesUsed = [],
  warning = null,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-900">Productos sugeridos</h2>
        <p className="text-sm text-textSecondary">
          Productos relacionados con tus recomendaciones — orientación cosmética, no prescripción médica
        </p>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3">
        <p className="text-xs text-textSecondary leading-relaxed">
          {PRODUCT_SUGGESTIONS_DISCLAIMER}
        </p>
      </div>

      {queriesUsed.length > 0 && !loading && (
        <p className="text-xs text-textMuted">
          Búsquedas utilizadas: {queriesUsed.join(' · ')}
        </p>
      )}

      {loading && (
        <div className="surface-card p-8 text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" aria-hidden="true" />
          <p className="font-medium text-brand-900">Buscando productos relacionados con tus recomendaciones…</p>
          <p className="text-sm text-textSecondary mt-2">
            El análisis y las recomendaciones siguen visibles mientras cargamos sugerencias.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="surface-card p-6 border border-amber-200 bg-amber-50/60">
          <p className="font-semibold text-amber-900">No pudimos obtener productos en este momento.</p>
          <p className="text-sm text-amber-800 mt-2">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="surface-card p-8 text-center dot-pattern">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="font-semibold text-brand-900 mb-1">
            No se encontraron productos relacionados con las recomendaciones actuales.
          </p>
          <p className="text-sm text-textSecondary max-w-sm mx-auto">
            Puedes revisar las recomendaciones anteriores como orientación general de cuidado.
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          {warning && (
            <p className="text-xs text-textSecondary">{warning}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductSuggestionCard key={getProductKey(product)} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
