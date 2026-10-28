// src/app/sticker/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Einzelsticker & Sammelsticker kaufen | WOS World of Stickers Hamburg',
  description:
    'Finde deine fehlenden Panini & Topps Einzelsticker aus Hamburg. Handgeprüft im Schutz-Sleeve und für 1,00 € Briefversand direkt zu dir!',
};

export const dynamic = 'force-dynamic';

export default function StickerPage() {
  const allProducts = getProducts();
  const stickerCount = allProducts.filter((p) => p.productType === 'Sticker').length;

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={allProducts}
        fixedType="Sticker"
        pageTitle="Original Einzelsticker & Sammelsticker"
        pageSubtitle={`Hier findest du alle ${stickerCount.toLocaleString(
          'de-DE'
        )} verfügbaren Einzelsticker von Panini, Topps, Disney, One Piece und mehr. Perfekt zum schnellen Füllen deiner Sammelalben ohne Doppelte!`}
      />
    </SiteShell>
  );
}
