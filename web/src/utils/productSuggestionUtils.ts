import type { Recommendation, SuggestedProduct } from '../types';
import type { ProductSearchItem } from '../types/productSearch';
import { getIngredientName } from './recommendationMatcher';
import { normalizeTextForQuery } from './productQueryBuilder';

export function getProductKey(product: Pick<SuggestedProduct, 'nombre' | 'url'>): string {
  return `${normalizeTextForQuery(product.nombre)}-${product.url ?? ''}`;
}

function countPharmaciesWithPrice(product: SuggestedProduct): number {
  return Object.values(product.precios).filter((price) => price != null && price > 0).length;
}

/**
 * Ranking simple: ingredientes/tipos sugeridos en nombre/descripción,
 * luego precio mínimo válido y cobertura de farmacias.
 */
export function computeRelevanceScore(
  product: SuggestedProduct,
  recommendations: Recommendation[],
): number {
  const searchable = normalizeTextForQuery(
    `${product.nombre} ${product.descripcion ?? ''}`,
  );

  const ingredients = recommendations.flatMap((rec) =>
    (rec.suggestedIngredients ?? []).map(getIngredientName),
  );
  const productTypes = recommendations.flatMap((rec) => rec.suggestedProductTypes ?? []);

  let score = 0;

  for (const ingredient of ingredients) {
    const normalizedIngredient = normalizeTextForQuery(ingredient);
    if (searchable.includes(normalizedIngredient)) score += 3;
  }

  for (const type of productTypes) {
    const normalizedType = normalizeTextForQuery(type);
    if (searchable.includes(normalizedType)) score += 2;
  }

  if (product.precio_minimo != null && product.precio_minimo > 0) score += 1;
  if (countPharmaciesWithPrice(product) >= 2) score += 1;

  return score;
}

export function mergeDuplicateProducts(
  products: SuggestedProduct[],
): SuggestedProduct[] {
  const merged = new Map<string, SuggestedProduct>();

  for (const product of products) {
    const key = getProductKey(product);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, product);
      continue;
    }

    const existingPrice = existing.precio_minimo ?? Number.MAX_SAFE_INTEGER;
    const nextPrice = product.precio_minimo ?? Number.MAX_SAFE_INTEGER;
    const best = nextPrice < existingPrice ? product : existing;
    const other = best === product ? existing : product;

    merged.set(key, {
      ...best,
      precios: {
        ahumada: best.precios.ahumada ?? other.precios.ahumada ?? null,
        salcobrand: best.precios.salcobrand ?? other.precios.salcobrand ?? null,
        cruz_verde: best.precios.cruz_verde ?? other.precios.cruz_verde ?? null,
      },
      matchedQuery: [existing.matchedQuery, product.matchedQuery].filter(Boolean).join(' · ') || best.matchedQuery,
      relevanceScore: Math.max(existing.relevanceScore ?? 0, product.relevanceScore ?? 0),
    });
  }

  return Array.from(merged.values());
}

export function rankSuggestedProducts(
  products: SuggestedProduct[],
  recommendations: Recommendation[],
  limit = 5,
): SuggestedProduct[] {
  const scored = products.map((product) => ({
    ...product,
    relevanceScore: computeRelevanceScore(product, recommendations),
  }));

  return scored
    .sort((a, b) => {
      const scoreDiff = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;

      const priceA = a.precio_minimo ?? Number.MAX_SAFE_INTEGER;
      const priceB = b.precio_minimo ?? Number.MAX_SAFE_INTEGER;
      return priceA - priceB;
    })
    .slice(0, limit);
}

export function mapSearchItemToSuggestedProduct(
  item: ProductSearchItem,
  matchedQuery: string,
  source?: string,
  consultationDate?: string,
): SuggestedProduct {
  return {
    id: item.id,
    nombre: item.name,
    descripcion: item.description,
    precios: item.prices,
    precio_minimo: item.minPrice,
    farmacia_minimo: item.minPharmacy,
    url: item.url ?? null,
    fuente: source,
    fecha_consulta: consultationDate,
    matchedQuery,
  };
}

export const PRODUCT_SUGGESTIONS_DISCLAIMER =
  'Los productos mostrados son sugerencias orientativas basadas en componentes dermatocosméticos. '
  + 'Los precios son referenciales y pueden cambiar. Verifica disponibilidad y precio final en la farmacia correspondiente. '
  + 'Estas recomendaciones no reemplazan una evaluación dermatológica profesional.';
