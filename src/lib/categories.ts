// src/lib/categories.ts
import type { Product } from './catalog';

export interface SubCategory {
  title: string;
  slug: string;
  description?: string;
  keywords: string[];
}

export interface MainCategory {
  title: string;
  slug: string;
  href: string;
  description: string;
  badge?: string;
  subcategories: SubCategory[];
}

export const WOS_MAIN_CATEGORIES: MainCategory[] = [
  {
    title: 'Sammelsticker',
    slug: 'sammelsticker',
    href: '/sammelsticker',
    description: 'Original Panini & Topps Einzelsticker aus Hamburg für Bundesliga, FIFA WM, Disney und US Sports.',
    badge: 'Klassiker',
    subcategories: [
      {
        title: 'Panini Sticker',
        slug: 'panini-sticker',
        keywords: ['panini sticker', 'bundesliga frauen', 'fifa world cup', 'fifa 365', 'world class', 'premier league', 'foot 2023'],
      },
      {
        title: 'Topps Sticker',
        slug: 'topps-sticker',
        keywords: ['topps sticker', 'bundesliga 2024/25', 'champions league', 'bundesliga 2023/24'],
      },
      {
        title: 'Film & Fernsehen / Disney',
        slug: 'film-fernsehen-disney',
        keywords: ['donald duck', 'stitch', 'paw patrol', 'super mario', 'disney', 'reeperbahn'],
      },
      {
        title: 'American Football Sticker',
        slug: 'american-football-sticker',
        keywords: ['nfl sticker', 'football sticker'],
      },
      {
        title: 'Basketball Sticker',
        slug: 'basketball-sticker',
        keywords: ['basketball sticker', 'euro league', 'nba sticker'],
      },
      {
        title: 'Panini PDC Dart Sticker',
        slug: 'pdc-dart-sticker',
        keywords: ['pdc', 'dart', 'world champions'],
      },
    ],
  },
  {
    title: 'Sammelkarten',
    slug: 'sammelkarten',
    href: '/sammelkarten',
    description: 'Boosterfrische Trading Cards von Panini Adrenalyn XL, Topps Match Attax, NBA und Star Wars im Toploader.',
    badge: 'Top-Zustand',
    subcategories: [
      {
        title: 'Panini Tradingcards',
        slug: 'panini-tradingcards',
        keywords: ['adrenalyn xl', 'fifa 365', 'fifa wm', 'top class', 'fifa score'],
      },
      {
        title: 'Topps Tradingcards',
        slug: 'topps-tradingcards',
        keywords: ['topps tradingcards', 'champions league 2026', 'champions league 2025', 'topps premier league'],
      },
      {
        title: 'Basketball & US Sports',
        slug: 'us-sports-tradingcards',
        keywords: ['donruss', 'hoops', 'topps chrome nba', 'top class nba', 'nfl score', 'baseball'],
      },
      {
        title: 'Eishockey & Formel 1',
        slug: 'eishockey-formel-1',
        keywords: ['upperdeck', 'mvp', 'turbo attax', 'formel 1'],
      },
      {
        title: 'Film & Fernsehen',
        slug: 'film-fernsehen-cards',
        keywords: ['star wars unlimited', 'wizarding world', 'harry potter'],
      },
    ],
  },
  {
    title: 'One Piece Tradingcards',
    slug: 'one-piece-tradingcards',
    href: '/one-piece-tradingcards',
    description: 'Offizielle One Piece Sammelkarten & Sticker aus dem Bandai & Netflix Universum.',
    badge: 'Anime Hit',
    subcategories: [
      {
        title: 'The Time of Battle 2026',
        slug: 'the-time-of-battle',
        keywords: ['the time of battle'],
      },
      {
        title: 'Netflix One Piece Official',
        slug: 'netflix-one-piece',
        keywords: ['netflix one piece', 'one piece official'],
      },
      {
        title: 'Alle One Piece Karten',
        slug: 'alle-one-piece',
        keywords: ['one piece'],
      },
    ],
  },
  {
    title: 'Naruto Tradingcards',
    slug: 'naruto-tradingcards',
    href: '/naruto-tradingcards',
    description: 'Originale Naruto Sammelkarten, Earth Scroll Serie und Ninja-Tradingcards.',
    badge: 'Anime',
    subcategories: [
      {
        title: 'Earth Scroll Serie 1',
        slug: 'earth-scroll-serie-1',
        keywords: ['earth scroll', 'earth scroll serie 1'],
      },
      {
        title: 'Alle Naruto Karten',
        slug: 'alle-naruto',
        keywords: ['naruto'],
      },
    ],
  },
  {
    title: 'Pokemon Tradingcards',
    slug: 'pokemon-tradingcards',
    href: '/pokemon-tradingcards',
    description: 'Deutsche Pokémon Sammelkarten aus aktuellen Sets wie Stürmische Funken, Ewige Rivalen & Paldea.',
    badge: 'Pokémon TCG',
    subcategories: [
      {
        title: 'Stürmische Funken',
        slug: 'stuermische-funken',
        keywords: ['stürmische funken', 'stuermische funken'],
      },
      {
        title: 'Ewige Rivalen',
        slug: 'ewige-rivalen',
        keywords: ['ewige rivalen', 'ewigel rivalen'],
      },
      {
        title: 'Entwicklungen in Paldea',
        slug: 'entwicklungen-in-paldea',
        keywords: ['entwicklungen in paldea', 'paldea'],
      },
      {
        title: 'Astralglanz & Zenit der Könige',
        slug: 'astralglanz-zenit',
        keywords: ['astralglanz', 'zenit der könige', 'zenit'],
      },
      {
        title: 'Paradoxrift & Obsidian Flammen',
        slug: 'paradoxrift-obsidian',
        keywords: ['paradoxrift', 'obsidian flammen', 'flammen'],
      },
      {
        title: 'Prismatische Entwicklungen',
        slug: 'prismatische-entwicklungen',
        keywords: ['prismatische entwicklungen', 'prisma'],
      },
    ],
  },
  {
    title: 'Zubehör',
    slug: 'zubehoer',
    href: '/zubehoer',
    description: 'Professioneller Sammlerschutz: Penny Sleeves, Ultra Pro Toploader, 9-Pocket Pages & Sammelordner.',
    badge: 'Schutz',
    subcategories: [
      {
        title: 'Schutzhüllen (Sleeves)',
        slug: 'sleeves',
        keywords: ['sleeve', 'schutzhülle', 'penny sleeve'],
      },
      {
        title: 'Toploader (Hartplastik)',
        slug: 'toploader',
        keywords: ['toploader', 'hartplastik', 'ultra pro'],
      },
      {
        title: 'Sammelordner & Binder',
        slug: 'binder',
        keywords: ['binder', 'sammelordner', 'album', '9-pocket'],
      },
    ],
  },
];

export function isProductInParentCategory(product: Product, parentSlug: string): boolean {
  const combined = `${product.category} ${product.series} ${product.title} ${product.manufacturer}`.toLowerCase();

  switch (parentSlug) {
    case 'pokemon-tradingcards':
      return (
        combined.includes('pokemon') ||
        combined.includes('pokémon') ||
        combined.includes('funken') ||
        combined.includes('rivalen') ||
        combined.includes('paldea') ||
        combined.includes('astralglanz') ||
        combined.includes('paradox') ||
        combined.includes('obsidian') ||
        combined.includes('stellarkrone') ||
        combined.includes('zenit')
      );

    case 'one-piece-tradingcards':
      return combined.includes('one piece');

    case 'naruto-tradingcards':
      return combined.includes('naruto') || combined.includes('earth scroll');

    case 'zubehoer':
      return (
        product.productType === ('Zubehör' as unknown) ||
        combined.includes('toploader') ||
        combined.includes('sleeve') ||
        combined.includes('binder') ||
        combined.includes('schutzhülle') ||
        combined.includes('zubehör')
      );

    case 'sammelsticker':
      if (
        isProductInParentCategory(product, 'pokemon-tradingcards') ||
        isProductInParentCategory(product, 'one-piece-tradingcards') ||
        isProductInParentCategory(product, 'naruto-tradingcards') ||
        isProductInParentCategory(product, 'zubehoer')
      ) {
        return false;
      }
      return product.productType === 'Sticker' || combined.includes('sticker');

    case 'sammelkarten':
      if (
        isProductInParentCategory(product, 'pokemon-tradingcards') ||
        isProductInParentCategory(product, 'one-piece-tradingcards') ||
        isProductInParentCategory(product, 'naruto-tradingcards') ||
        isProductInParentCategory(product, 'zubehoer')
      ) {
        return false;
      }
      return product.productType === 'Tradingcard' || combined.includes('tradingcard') || combined.includes('card');

    default:
      return true;
  }
}
