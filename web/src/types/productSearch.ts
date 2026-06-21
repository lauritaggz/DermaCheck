/** Precios por farmacia devueltos por POST /api/products/search (HU22). */
export interface ProductPrices {
  ahumada: number | null;
  salcobrand: number | null;
  cruz_verde: number | null;
}

/** Item normalizado devuelto por POST /api/products/search (HU22). */
export interface ProductSearchItem {
  id: string;
  name: string;
  prices: ProductPrices;
  minPrice: number | null;
  minPriceLabel: string;
  minPharmacy: 'ahumada' | 'salcobrand' | 'cruz_verde' | null;
  description: string | null;
  url?: string;
}

/** Forma cruda tolerada del backend del scraper. */
export interface ProductSearchApiItem {
  id?: string | number;
  name?: string;
  nombre?: string;
  pharmacy?: string;
  farmacia?: string;
  farmacia_minimo?: 'ahumada' | 'salcobrand' | 'cruz_verde';
  precios?: ProductPrices;
  min_price?: number | string | null;
  precio_minimo?: number | string | null;
  price?: number | string | null;
  descripcion?: string | null;
  url?: string;
}

export interface ProductSearchApiResponse {
  source?: 'farmacompara' | 'fallback' | 'cache';
  query?: string;
  results?: ProductSearchApiItem[];
  products?: ProductSearchApiItem[];
  items?: ProductSearchApiItem[];
  warning?: string;
}

export interface ProductSearchResult {
  data: ProductSearchItem[];
  warning?: string;
  source?: 'farmacompara' | 'fallback' | 'cache';
  query?: string;
}

export const PHARMACY_LABELS: Record<'ahumada' | 'salcobrand' | 'cruz_verde', string> = {
  ahumada: 'Ahumada',
  salcobrand: 'Salcobrand',
  cruz_verde: 'Cruz Verde',
};
