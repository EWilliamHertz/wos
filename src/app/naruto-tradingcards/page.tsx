// src/app/naruto-tradingcards/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Naruto Tradingcards kaufen | Earth Scroll Serie 1 | WOS Hamburg',
  description:
    'Originale Naruto Sammelkarten aus der Earth Scroll Serie 1 und Anime TCG bei WOS World of Stickers.',
};

export const dynamic = 'force-dynamic';

export default async function NarutoTradingcardsPage() {
  const allProducts = getProducts();
  const narutoProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'naruto-tradingcards')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={narutoProducts}
        pageTitle="Naruto Tradingcards & Ninja-Karten"
        pageSubtitle={`Originale Naruto Sammelkarten aus der Earth Scroll Serie 1 und weiteren Editionen. Jede Karte wird transportsicher verpackt und schnell aus Hamburg geliefert.`}
      />
    </SiteShell>
  );
}
