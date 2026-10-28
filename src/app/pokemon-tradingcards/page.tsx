// src/app/pokemon-tradingcards/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Pokémon Trading Cards kaufen | Deutsche Sets & Einzelkarten | WOS Hamburg',
  description:
    'Deutsche Pokémon Sammelkarten aus aktuellen Erweiterungen wie Stürmische Funken, Ewige Rivalen, Entwicklungen in Paldea, Obsidian Flammen & mehr.',
};

export const dynamic = 'force-dynamic';

export default async function PokemonTradingcardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const pokemonProducts = products.filter((p) =>
    isProductInParentCategory(p, 'pokemon-tradingcards')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find((c) => c.slug === 'pokemon-tradingcards');
  const subcategoryOptions = (categoryDef?.subcategories || []).map((sub) => ({
    title: sub.title,
    slug: sub.slug,
    count: categoryCounts.sub[sub.slug] ?? 0,
    keywords: sub.keywords,
  }));

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <ProductCatalogView
        initialProducts={pokemonProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="Pokémon Tradingcards (Deutsche Karten)"
        pageSubtitle={`Entdecke ${pokemonProducts.length} originale deutsche Pokémon Einzelkarten aus aktuellen Erweiterungen (Stürmische Funken, Ewige Rivalen, Paldea, Astralglanz & Zenit der Könige). Frisch gezogen und direkt im Sleeve geschützt!`}
      />
    </SiteShell>
  );
}
