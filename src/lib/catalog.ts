// src/lib/catalog.ts
// Client-safe types and constants. Filesystem access lives in catalog.server.ts.

export interface Product {
  id: string;
  slug: string;
  number: string;
  title: string;
  manufacturer: 'Panini' | 'Topps' | 'Netflix' | 'Disney / StarWars.com' | 'Bandai';
  productType: 'Sticker' | 'Tradingcard';
  series: string;
  category: string;
  condition: string;
  price: number;
  stock: number;
  originalSourceUrl: string;
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
  'One Piece Tradingcards & Sticker',
  'Naruto Tradingcards - Earth Scroll Serie 1',
] as const;
