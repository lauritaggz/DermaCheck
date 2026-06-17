import { apiUrl, isApiAvailable } from '../utils/api';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { formatApiNetworkError } from '../utils/networkErrors';
import type {
  ProductPrices,
  ProductSearchApiItem,
  ProductSearchApiResponse,
  ProductSearchItem,
  ProductSearchResult,
} from '../types/productSearch';

const PRODUCTS_SEARCH_PATH = '/api/products/search';

function formatPrice(value: number | string | null | undefined): { minPrice: number | null; label: string } {
  if (value === null || value === undefined || value === '') {
    return { minPrice: null, label: 'Sin stock' };
  }

  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
  if (Number.isNaN(numeric)) {
    return { minPrice: null, label: String(value) };
  }

  return {
    minPrice: numeric,
    label: new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(numeric),
  };
}

function normalizePrices(raw: ProductSearchApiItem): ProductPrices {
  return {
    ahumada: raw.precios?.ahumada ?? null,
    salcobrand: raw.precios?.salcobrand ?? null,
    cruz_verde: raw.precios?.cruz_verde ?? null,
  };
}

function normalizeItem(raw: ProductSearchApiItem, index: number): ProductSearchItem {
  const name = raw.name ?? raw.nombre ?? 'Producto sin nombre';
  const prices = normalizePrices(raw);
  const rawPrice = raw.min_price ?? raw.precio_minimo ?? raw.price;
  const { minPrice, label } = formatPrice(rawPrice);

  return {
    id: raw.id != null ? String(raw.id) : `${index}-${name}`,
    name,
    prices,
    minPrice,
    minPriceLabel: label,
    minPharmacy: raw.farmacia_minimo ?? null,
    description: raw.descripcion ?? null,
    url: raw.url,
  };
}

function extractItems(payload: ProductSearchApiResponse): ProductSearchApiItem[] {
  return payload.results ?? payload.products ?? payload.items ?? [];
}

/**
 * Busca productos en farmacias vía scraper (HU22).
 * Punto único de integración con POST /api/products/search.
 */
export async function fetchProducts(
  query: string,
): Promise<ProductSearchResult | { error: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { error: 'La búsqueda no puede estar vacía.' };
  }

  if (!isApiAvailable()) {
    return { error: 'No hay servidor configurado. Define VITE_API_BASE_URL en web/.env' };
  }

  const url = apiUrl(PRODUCTS_SEARCH_PATH);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: trimmed }),
    });

    if (!res.ok) {
      return { error: await parseApiErrorMessage(res) };
    }

    const payload = (await res.json()) as ProductSearchApiResponse | ProductSearchApiItem[];
    const items = Array.isArray(payload) ? payload : extractItems(payload);
    const warning = Array.isArray(payload) ? undefined : payload.warning;
    const source = Array.isArray(payload) ? undefined : payload.source;
    const resolvedQuery = Array.isArray(payload) ? trimmed : payload.query ?? trimmed;

    return {
      data: items.map(normalizeItem),
      warning,
      source,
      query: resolvedQuery,
    };
  } catch {
    return { error: formatApiNetworkError() };
  }
}

export const productSearchService = { fetchProducts };

export { formatPrice };
