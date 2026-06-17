import { formatPrice } from '../../services/productSearchService';
import type { SuggestedProduct } from '../../types';
import { PHARMACY_LABELS } from '../../types/productSearch';

interface Props {
  product: SuggestedProduct;
}

const PHARMACY_KEYS = ['ahumada', 'salcobrand', 'cruz_verde'] as const;

function formatConsultationDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-CL');
}

export function ProductSuggestionCard({ product }: Props) {
  const consultationDate = formatConsultationDate(product.fecha_consulta);
  const cheapestPharmacy = product.farmacia_minimo;
  const cheapestLabel = cheapestPharmacy ? PHARMACY_LABELS[cheapestPharmacy] : null;
  const cheapestPrice = cheapestPharmacy ? product.precios[cheapestPharmacy] : product.precio_minimo;
  const { label: cheapestPriceLabel } = formatPrice(cheapestPrice ?? null);

  return (
    <article className="surface-card surface-card-hover p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-brand-900 text-sm sm:text-base">{product.nombre}</h3>
          {product.descripcion && (
            <p className="text-xs text-textSecondary mt-2 leading-relaxed line-clamp-3">
              {product.descripcion}
            </p>
          )}
        </div>
        {cheapestLabel && cheapestPrice != null && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-200 shrink-0">
            Más económico
          </span>
        )}
      </div>

      {cheapestLabel && (
        <p className="text-sm font-semibold text-brand-800">
          Más económico: {cheapestPriceLabel} en {cheapestLabel}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PHARMACY_KEYS.map((key) => {
          const isCheapest = cheapestPharmacy === key && product.precios[key] != null;
          const { label } = formatPrice(product.precios[key] ?? null);
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
                {product.precios[key] != null ? label : 'No disponible'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div className="text-xs text-textMuted space-y-1">
          {consultationDate && <p>Consultado el {consultationDate}</p>}
          {product.matchedQuery && (
            <p className="line-clamp-1">Búsqueda: {product.matchedQuery}</p>
          )}
          <p>Precios referenciales. Verifica disponibilidad y precio final en la farmacia.</p>
        </div>

        {product.url ? (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-lg btn-primary-glow text-white shrink-0 self-start"
          >
            Ver producto
          </a>
        ) : (
          <span className="text-xs text-textMuted shrink-0">Enlace no disponible</span>
        )}
      </div>
    </article>
  );
}
