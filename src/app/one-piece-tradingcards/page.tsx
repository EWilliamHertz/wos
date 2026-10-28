// src/app/one-piece-tradingcards/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'One Piece Tradingcards & Sticker kaufen | WOS World of Stickers Hamburg',
  description:
    'Offizielle One Piece Sammelkarten & Sticker aus dem Bandai und Netflix Universum direkt aus Hamburg kaufen.',
};

export const dynamic = 'force-dynamic';

export default async function OnePieceTradingcardsPage() {
  const allProducts = getProducts();
  const onePieceProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'one-piece-tradingcards')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={onePieceProducts}
        pageTitle="One Piece Tradingcards & Sticker"
        pageSubtitle={`Alle ${onePieceProducts.length} verfügbaren One Piece Sammlerstücke aus den Sets The Time of Battle, Netflix One Piece Official Sticker & Anime TCG. Handgeprüft im Sleeve!`}
      />
    </SiteShell>
  );
}
