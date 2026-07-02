import type { Recommendation, SuggestedProduct } from '../types';
import type { ProductSearchItem } from '../types/productSearch';
import { getIngredientName, getRecommendationDisplayLabel } from './recommendationMatcher';
import { normalizeTextForQuery } from './productQueryBuilder';

export const MAX_SUGGESTED_PRODUCTS = 4;

export function getProductKey(product: Pick<SuggestedProduct, 'nombre' | 'url'>): string {
  return `${normalizeTextForQuery(product.nombre)}-${product.url ?? ''}`;
}

function getProductSearchableText(product: SuggestedProduct): string {
  return normalizeTextForQuery(`${product.nombre} ${product.descripcion ?? ''}`);
}

/** Alias y tokens cortos para emparejar ingredientes en nombre/descripción del producto. */
const INGREDIENT_SEARCH_ALIASES: Record<string, string[]> = {
  'acido hialuronico': ['acido hialuronico', 'hialuronico', 'hyaluronic'],
  glicerina: ['glicerina', 'glycerin', 'glycerina'],
  ceramidas: ['ceramidas', 'ceramide'],
  urea: ['urea'],
  niacinamida: ['niacinamida'],
  pantenol: ['pantenol'],
  'acido salicilico': ['acido salicilico', 'salicilico'],
  'acido azelaico': ['acido azelaico', 'azelaico'],
  'avena coloidal': ['avena coloidal', 'avena'],
  'vitamina c': ['vitamina c', 'ascorbico'],
  'peroxido de benzoilo': ['peroxido de benzoilo', 'benzoilo'],
};

const QUERY_INGREDIENT_PATTERNS: Array<{ pattern: RegExp; ingredientLabel: string }> = [
  { pattern: /glicerina/i, ingredientLabel: 'Glicerina' },
  { pattern: /ceramidas/i, ingredientLabel: 'Ceramidas' },
  { pattern: /hialuronico|hyaluronic/i, ingredientLabel: 'Ácido hialurónico' },
  { pattern: /\burea\b/i, ingredientLabel: 'Urea' },
  { pattern: /niacinamida/i, ingredientLabel: 'Niacinamida' },
  { pattern: /pantenol/i, ingredientLabel: 'Pantenol' },
  { pattern: /salicilico/i, ingredientLabel: 'Ácido salicílico' },
  { pattern: /azelaico/i, ingredientLabel: 'Ácido azelaico' },
  { pattern: /avena/i, ingredientLabel: 'Avena coloidal' },
  { pattern: /vitamina\s*c/i, ingredientLabel: 'Vitamina C' },
  { pattern: /benzoilo/i, ingredientLabel: 'Peróxido de benzoílo' },
  { pattern: /protector solar|spf|fps/i, ingredientLabel: 'Protector solar' },
];

export function getIngredientSearchTokens(ingredientName: string): string[] {
  const normalized = normalizeTextForQuery(ingredientName);
  const primary = normalized.split('(')[0].trim();
  const tokens = new Set<string>([normalized, primary]);

  for (const [key, aliases] of Object.entries(INGREDIENT_SEARCH_ALIASES)) {
    if (primary === key || normalized.includes(key)) {
      aliases.forEach((alias) => tokens.add(alias));
    }
  }

  primary
    .split(' ')
    .filter((word) => word.length > 3)
    .forEach((word) => tokens.add(word));

  return Array.from(tokens).filter(Boolean);
}

export function ingredientMatchesSearchable(
  ingredientName: string,
  searchable: string,
): boolean {
  return getIngredientSearchTokens(ingredientName).some((token) => searchable.includes(token));
}

/** Ingredientes inferidos por la query usada en el scraper (p. ej. crema hidratante ceramidas). */
export function getIngredientsMatchedByQuery(matchedQuery?: string): string[] {
  if (!matchedQuery?.trim()) return [];

  const normalized = normalizeTextForQuery(matchedQuery);
  const matched: string[] = [];
  const seen = new Set<string>();

  for (const { pattern, ingredientLabel } of QUERY_INGREDIENT_PATTERNS) {
    if (!pattern.test(normalized)) continue;
    const key = ingredientLabel.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    matched.push(ingredientLabel);
  }

  return matched;
}

function dedupeIngredientLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const label of labels) {
    const key = label.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(label);
  }
  return result;
}

function countPharmaciesWithPrice(product: SuggestedProduct): number {
  return Object.values(product.precios).filter((price) => price != null && price > 0).length;
}

/** Componentes recomendados que aparecen en el nombre o descripción del producto. */
export function getMatchingRecommendedIngredients(
  product: SuggestedProduct,
  recommendations: Recommendation[],
): string[] {
  const searchable = getProductSearchableText(product);
  const matched: string[] = [];
  const seen = new Set<string>();

  for (const rec of recommendations) {
    for (const ingredient of rec.suggestedIngredients ?? []) {
      const name = getIngredientName(ingredient);
      const key = name.toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      if (ingredientMatchesSearchable(name, searchable)) {
        seen.add(key);
        matched.push(name);
      }
    }
  }

  return matched;
}

/** Afecciones cuyos componentes sugeridos aparecen en el producto. */
export function getMatchingConditionLabels(
  product: SuggestedProduct,
  recommendations: Recommendation[],
  detectedConditions: { id: string; label: string }[] = [],
): string[] {
  const searchable = getProductSearchableText(product);
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const rec of recommendations) {
    const hasIngredientMatch = (rec.suggestedIngredients ?? []).some((ingredient) => {
      const name = getIngredientName(ingredient);
      return name && ingredientMatchesSearchable(name, searchable);
    });
    if (!hasIngredientMatch) continue;

    const label = getRecommendationDisplayLabel(rec, detectedConditions);
    const labelKey = label.toLowerCase();
    if (seen.has(labelKey)) continue;
    seen.add(labelKey);
    labels.push(label);
  }

  return labels;
}

/**
 * Ranking simple: ingredientes/tipos sugeridos en nombre/descripción,
 * luego precio mínimo válido y cobertura de farmacias.
 */
export function computeRelevanceScore(
  product: SuggestedProduct,
  recommendations: Recommendation[],
): number {
  const searchable = getProductSearchableText(product);
  const productTypes = recommendations.flatMap((rec) => rec.suggestedProductTypes ?? []);

  let score = getMatchingRecommendedIngredients(product, recommendations).length * 3;

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
      imagen_url: best.imagen_url ?? other.imagen_url ?? null,
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
  limit = MAX_SUGGESTED_PRODUCTS,
  detectedConditions: { id: string; label: string }[] = [],
): SuggestedProduct[] {
  const scored = products
    .map((product) => {
      const matchedIngredients = dedupeIngredientLabels([
        ...getMatchingRecommendedIngredients(product, recommendations),
        ...getIngredientsMatchedByQuery(product.matchedQuery),
      ]);
      return {
        ...product,
        matchedIngredients,
        matchedConditions: getMatchingConditionLabels(
          product,
          recommendations,
          detectedConditions,
        ),
        relevanceScore: computeRelevanceScore(product, recommendations),
      };
    })
    .filter((product) => product.matchedIngredients.length > 0);

  return scored
    .sort((a, b) => {
      const ingredientDiff = b.matchedIngredients.length - a.matchedIngredients.length;
      if (ingredientDiff !== 0) return ingredientDiff;

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
    imagen_url: item.imageUrl ?? null,
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
