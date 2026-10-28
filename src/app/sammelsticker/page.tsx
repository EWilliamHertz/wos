// src/app/sammelsticker/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Sammelsticker online kaufen | Panini & Topps Einzelsticker | WOS Hamburg',
  description:
    'Riesige Auswahl an originalen Sammelstickern: Panini Bundesliga, FIFA World Cup WM 2026, Disney, One Piece, Super Mario & US Sports.',
};

export const dynamic = 'force-dynamic';

export default async function SammelstickerPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const allProducts = getProducts();
  const stickerProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'sammelsticker')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={stickerProducts}
        pageTitle="Sammelsticker & Einzelsticker"
        pageSubtitle={`Stöbere durch ${stickerProducts.length.toLocaleString(
          'de-DE'
        )} originale Sammelsticker von Panini, Topps, Disney & mehr. Jedes Stück wird von Hand auf Unversehrtheit geprüft und im Schutz-Sleeve für 1,00 € Pauschalversand geliefert.`}
      />
    </SiteShell>
  );
}
