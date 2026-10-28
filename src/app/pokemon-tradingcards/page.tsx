// src/app/pokemon-tradingcards/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Pokémon Trading Cards kaufen | Deutsche Sets & Einzelkarten | WOS Hamburg',
  description:
    'Deutsche Pokémon Sammelkarten aus aktuellen Erweiterungen wie Stürmische Funken, Ewige Rivalen, Entwicklungen in Paldea, Obsidian Flammen & mehr.',
};

export const dynamic = 'force-dynamic';

export default async function PokemonTradingcardsPage() {
  const allProducts = getProducts();
  const pokemonProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'pokemon-tradingcards')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={pokemonProducts}
        pageTitle="Pokémon Tradingcards (Deutsche Karten)"
        pageSubtitle={`Entdecke ${pokemonProducts.length} originale deutsche Pokémon Einzelkarten aus aktuellen Erweiterungen (Stürmische Funken, Ewige Rivalen, Paldea, Astralglanz & Zenit der Könige). Frisch gezogen und direkt im Sleeve geschützt!`}
      />
    </SiteShell>
  );
}
