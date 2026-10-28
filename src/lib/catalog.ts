// src/lib/catalog.ts
export interface Product {
  id: string;
  slug: string;
  number: string;
  title: string;
  manufacturer: string;
  productType: 'Sticker' | 'Tradingcard';
  series: string;
  category: string;
  condition: string;
  price: number;
  currency?: string;
  stock: number;
  inStock?: boolean;
  description?: string;
  originalSourceUrl: string;
  originalImageUrl?: string;
  blobImageUrl: string;
  updatedAt: string;
}

export const WOS_CATEGORIES = [
  'Panini Bundesliga Frauen 2026/27',
  'Panini FIFA World Cup WM 2026',
  'Panini Deutschland & die Besten aus Europa 2024',
  'Topps Bundesliga 2024/25',
  'Panini Donald Duck 90 Jahre',
  'Panini Stitch Scrap Book 2026',
  'PAW Patrol - Die besten Abenteuer aller Zeiten',
  'Panini Paw Patrol Search Rescue 2026',
  'Topps Chrome NBA 2025 & US Sports',
  'Panini Adrenalyn XL Fifa 365 2026/27 Golden Elite',
  'Topps Champions League 2026/27',
  'Topps Premier League 2026/27',
  'Star Wars Unlimited Legenden der Macht',
  'One Piece TC & Sticker',
  'Naruto TC - Earth Scroll Serie 1',
] as const;

export function formatEur(price: number): string {
  const safePrice = typeof price === 'number' && !Number.isNaN(price) ? price : 1.0;
  return `${safePrice.toFixed(2).replace('.', ',')} €`;
}

export function getProductTypeLabel(product: Pick<Product, 'productType' | 'category' | 'series' | 'title'>): string {
  if (product.productType === 'Tradingcard') {
    const combined = `${product.category || ''} ${product.series || ''} ${product.title || ''}`.toLowerCase();
    const isPokemon = combined.includes('pokemon') || combined.includes('pokémon');
    return isPokemon ? 'TCG' : 'TC';
  }
  return product.productType;
}