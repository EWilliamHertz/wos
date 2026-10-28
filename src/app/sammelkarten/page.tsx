// src/app/sammelkarten/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Sammelkarten & Trading Cards kaufen | Panini Adrenalyn XL & Topps | WOS Hamburg',
  description:
    'Boosterfrische Sammelkarten von Panini Adrenalyn XL, Topps Champions League, NBA, NFL & Star Wars Unlimited im Toploader aus Hamburg.',
};

export const dynamic = 'force-dynamic';

export default async function SammelkartenPage() {
  const allProducts = getProducts();
  const cardProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'sammelkarten')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={cardProducts}
        pageTitle="Sammelkarten & Trading Cards"
        pageSubtitle={`Finde deine Wunschkarten aus über ${cardProducts.length.toLocaleString(
          'de-DE'
        )} originalen Trading Cards (Panini Adrenalyn XL, Topps Match Attax, NBA, NFL, Eishockey & Star Wars). Jede Karte wird geschützt im Sleeve & Toploader versendet!`}
      />
    </SiteShell>
  );
}
