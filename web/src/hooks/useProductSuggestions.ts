import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchProducts } from '../services/productSearchService';
import type { DetectedCondition, Recommendation, SuggestedProduct } from '../types';
import { resolveProductSearchQueries } from '../utils/productQueryBuilder';
import {
  mapSearchItemToSuggestedProduct,
  mergeDuplicateProducts,
  rankSuggestedProducts,
} from '../utils/productSuggestionUtils';

export type UseProductSuggestionsParams = {
  detectedConditions?: DetectedCondition[];
  matchedRecommendations?: Recommendation[];
  /** TODO HU20: queries generadas por el mini agente con Ollama. */
  externalQueries?: string[];
  enabled?: boolean;
};

export type UseProductSuggestionsResult = {
  products: SuggestedProduct[];
  loading: boolean;
  error: string | null;
  queriesUsed: string[];
  warning: string | null;
  source: string | null;
  refetch: () => void;
};

const MAX_PRODUCTS = 5;

function buildStableKey(
  externalQueries?: string[],
  matchedRecommendations?: Recommendation[],
  detectedConditions?: DetectedCondition[],
): string {
  const external = externalQueries?.join('|') ?? '';
  const recommendations = matchedRecommendations?.map((rec) => rec.id).join('|') ?? '';
  const conditions = detectedConditions?.map((condition) => condition.id).join('|') ?? '';
  return [external, recommendations, conditions].join('::');
}

export function useProductSuggestions({
  detectedConditions,
  matchedRecommendations,
  externalQueries,
  enabled = true,
}: UseProductSuggestionsParams): UseProductSuggestionsResult {
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fetchToken, setFetchToken] = useState(0);
  const requestIdRef = useRef(0);
  const recommendationsRef = useRef<Recommendation[]>(matchedRecommendations ?? []);
  recommendationsRef.current = matchedRecommendations ?? [];

  const stableKey = buildStableKey(externalQueries, matchedRecommendations, detectedConditions);

  const resolvedQueries = useMemo(
    () => resolveProductSearchQueries({
      externalQueries,
      matchedRecommendations,
      detectedConditions,
    }),
    [stableKey],
  );

  const queryFingerprint = resolvedQueries.join('||');

  const runSearch = useCallback(async () => {
    if (!enabled) {
      setProducts([]);
      setLoading(false);
      setError(null);
      setQueriesUsed([]);
      setWarning(null);
      setSource(null);
      return;
    }

    if (resolvedQueries.length === 0) {
      setProducts([]);
      setLoading(false);
      setError(null);
      setQueriesUsed([]);
      setWarning(null);
      setSource(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setQueriesUsed(resolvedQueries);

    const responses = await Promise.all(resolvedQueries.map((query) => fetchProducts(query)));

    if (requestId !== requestIdRef.current) return;

    const errors = responses
      .filter((response): response is { error: string } => 'error' in response)
      .map((response) => response.error);

    const successful = responses.filter(
      (response): response is Exclude<typeof response, { error: string }> => !('error' in response),
    );

    const collected: SuggestedProduct[] = [];

    for (const response of successful) {
      for (const item of response.data) {
        collected.push(
          mapSearchItemToSuggestedProduct(
            item,
            response.query ?? '',
            response.source,
          ),
        );
      }
    }

    const merged = mergeDuplicateProducts(collected);
    const ranked = rankSuggestedProducts(
      merged,
      recommendationsRef.current,
      MAX_PRODUCTS,
    );

    setProducts(ranked);
    setLoading(false);

    if (ranked.length === 0 && errors.length > 0) {
      setError('No pudimos obtener productos en este momento.');
    } else {
      setError(null);
    }

    const warnings = successful
      .map((response) => response.warning)
      .filter((value): value is string => Boolean(value));
    setWarning(warnings[0] ?? null);

    const sources = successful
      .map((response) => response.source)
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
    setSource(sources[0] ?? null);
  }, [enabled, resolvedQueries]);

  useEffect(() => {
    void runSearch();
  }, [runSearch, queryFingerprint, fetchToken, enabled]);

  const refetch = useCallback(() => {
    setFetchToken((value) => value + 1);
  }, []);

  return {
    products,
    loading,
    error,
    queriesUsed,
    warning,
    source,
    refetch,
  };
}

/*
 * TODO HU20:
 * Cuando se integre el mini agente con Ollama, las queries vendrán desde el agente.
 * En ese caso, se debe pasar externalQueries al hook y se saltará la construcción
 * desde recommendationCatalog.ts.
 *
 * useProductSuggestions({
 *   externalQueries: agentResponse.scraper_queries,
 *   detectedConditions,
 *   matchedRecommendations,
 * });
 */
