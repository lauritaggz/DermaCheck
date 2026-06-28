import { type FormEvent, useEffect, useState } from 'react';
import { formatPrice } from '../services/productSearchService';
import { useProductSearch } from '../hooks/useProductSearch';
import { PHARMACY_LABELS, type ProductSearchItem } from '../types/productSearch';

const EXAMPLE_QUERY = 'limpiador facial gel ácido salicílico niacinamida';

const PHARMACY_KEYS = ['ahumada', 'salcobrand', 'cruz_verde'] as const;

function ProductResultRow({ item }: { item: ProductSearchItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imageFailed;

  return (
    <article className="surface-card p-4 space-y-3">
      <div className="flex gap-3">
        {showImage ? (
          <img
            src={item.imageUrl ?? undefined}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="w-16 h-16 rounded-lg border border-slate-200 bg-white object-contain p-1 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg border border-slate-200 bg-brand-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-brand-900 text-sm sm:text-base">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-textSecondary mt-2 leading-relaxed line-clamp-3">{item.description}</p>
            )}
          </div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors shrink-0 self-start"
            >
              Ver en Farmacompara
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PHARMACY_KEYS.map((key) => {
          const isCheapest = item.minPharmacy === key && item.prices[key] != null;
          const { label } = formatPrice(item.prices[key]);
          return (
            <div
              key={key}
              className={`rounded-lg border px-3 py-2 ${
                isCheapest
                  ? 'border-teal-300 bg-teal-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className="text-xs font-semibold normal-case text-textMuted">
                {PHARMACY_LABELS[key]}
              </p>
              <p className={`text-sm font-bold mt-0.5 ${isCheapest ? 'text-teal-700' : 'text-brand-900'}`}>
                {label}
              </p>
              {isCheapest && (
                <p className="text-[10px] font-semibold text-teal-600 mt-1">Más barato</p>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/**
 * HU22 — Página de prueba del scraper de productos.
 * Ruta aislada: /scraper-test (no aparece en la navegación principal).
 */
export function ScraperTestScreen() {
  const [queryInput, setQueryInput] = useState('');
  // Preparado para el mini agente: cuando esté listo, asignar aquí la query generada.
  const [queryFromAgent, setQueryFromAgent] = useState('');
  const { loading, error, results, lastQuery, searchProducts } = useProductSearch();

  // TODO: cuando el mini agente esté listo, setQueryFromAgent(<resultado del agente>)
  // Ejemplo futuro:
  // useEffect(() => {
  //   runMiniAgent(analysisContext).then((agentQuery) => setQueryFromAgent(agentQuery));
  // }, [analysisContext]);

  useEffect(() => {
    if (!queryFromAgent.trim()) return;
    setQueryInput(queryFromAgent);
    void searchProducts(queryFromAgent);
  }, [queryFromAgent, searchProducts]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void searchProducts(queryInput);
  }

  return (
    <div className="app-shell min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <p className="text-xs font-semibold normal-case text-teal-700 mb-2">HU22 · Prueba interna</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">Scraper de productos</h1>
          <p className="text-sm text-textSecondary mt-2">
            Página aislada para probar <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">POST /api/products/search</code>.
            No forma parte del flujo principal de DermaCheck.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="surface-card p-5 mb-6 space-y-4">
          <label htmlFor="product-query" className="block text-sm font-medium text-brand-900">
            Búsqueda manual
          </label>
          <input
            id="product-query"
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={EXAMPLE_QUERY}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-brand-900 placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-60"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="min-h-[44px] px-6 rounded-xl btn-primary-glow text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setQueryInput(EXAMPLE_QUERY)}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-sm font-medium text-textSecondary hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-50"
            >
              Usar ejemplo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setQueryFromAgent(EXAMPLE_QUERY)}
              className="min-h-[44px] px-4 rounded-xl border border-teal-200 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              Simular query del agente
            </button>
          </div>
        </form>

        {queryFromAgent && (
          <p className="text-xs text-textMuted mb-4">
            Query activa del agente (preview): <span className="font-medium text-brand-700">{queryFromAgent}</span>
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12 text-textSecondary" role="status" aria-live="polite">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Consultando farmacias…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6" role="alert">
            <p className="text-sm font-semibold text-red-800 mb-1">Error en la búsqueda</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && lastQuery && results.length === 0 && (
          <div className="surface-card p-6 text-center text-sm text-textSecondary">
            Sin resultados para &quot;{lastQuery}&quot;.
          </div>
        )}

        {!loading && results.length > 0 && (
          <section aria-label="Resultados de búsqueda">
            <h2 className="text-sm font-semibold text-brand-900 mb-3">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para &quot;{lastQuery}&quot;
            </h2>
            <div className="space-y-3">
              {results.map((item) => (
                <ProductResultRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/*
 * HU22 — Integración futura del mini agente
 * -----------------------------------------
 * Archivos tocados:
 *   - web/src/screens/ScraperTestScreen.tsx (esta página)
 *   - web/src/hooks/useProductSearch.ts (lógica reutilizable)
 *   - web/src/services/productSearchService.ts (POST /api/products/search)
 *   - web/src/types/productSearch.ts (tipos)
 *   - web/src/App.tsx (ruta /scraper-test, sin menú)
 *
 * Cómo conectar el agente:
 *   1. Obtener la query del mini agente (p. ej. a partir del diagnóstico facial).
 *   2. Llamar setQueryFromAgent(queryGenerada) en este componente.
 *   3. El useEffect existente sincronizará el input y ejecutará searchProducts automáticamente.
 *   4. También puedes invocar searchProducts(queryGenerada) directamente desde cualquier pantalla
 *      importando useProductSearch, sin reescribir la UI de resultados.
 *
 * TODO: cuando el mini agente esté listo, setQueryFromAgent(<resultado del agente>)
 */
