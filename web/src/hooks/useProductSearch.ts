import { useCallback, useState } from 'react';
import { fetchProducts } from '../services/productSearchService';
import type { ProductSearchItem } from '../types/productSearch';

interface UseProductSearchResult {
  loading: boolean;
  error: string | null;
  results: ProductSearchItem[];
  lastQuery: string;
  searchProducts: (query: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook reutilizable para búsqueda de productos (HU22).
 * Acepta la query como parámetro para poder invocarlo desde la UI manual
 * o desde el mini agente en el futuro.
 */
export function useProductSearch(): UseProductSearchResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProductSearchItem[]>([]);
  const [lastQuery, setLastQuery] = useState('');

  const searchProducts = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Escribe una búsqueda para continuar.');
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setLastQuery(trimmed);

    const response = await fetchProducts(trimmed);

    setLoading(false);

    if ('error' in response) {
      setError(response.error);
      setResults([]);
      return;
    }

    setResults(response.data);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResults([]);
    setLastQuery('');
  }, []);

  return { loading, error, results, lastQuery, searchProducts, reset };
}
