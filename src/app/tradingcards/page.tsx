// src/app/tradingcards/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Trading Cards & Sammelkarten kaufen | WOS World of Stickers Hamburg',
  description:
    'Boosterfrische Trading Cards (Match Attax, Panini Adrenalyn XL, Star Wars Unlimited, One Piece) im Toploader & Sleeve aus Hamburg.',
};

export const dynamic = 'force-dynamic';

export default function TradingCardsPage() {
  const allProducts = getProducts();
  const cardsCount = allProducts.filter((p) => p.productType === 'Tradingcard').length;

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={allProducts}
        fixedType="Tradingcard"
        pageTitle="Trading Cards & Sammelkarten"
        pageSubtitle={`Entdecke ${cardsCount.toLocaleString(
          'de-DE'
        )} originale Trading Cards von Panini Adrenalyn XL, Topps Match Attax, Star Wars Unlimited, One Piece und mehr. Jede Karte wird geschützt im Sleeve & Toploader versendet!`}
      />
    </SiteShell>
  );
}
