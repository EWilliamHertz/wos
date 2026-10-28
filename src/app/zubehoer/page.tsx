// src/app/zubehoer/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog.server';
import { isProductInParentCategory } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Zubehör für Sammler | Sleeves, Toploader & Sammelordner | WOS Hamburg',
  description:
    'Professioneller Schutz für deine Sammelkarten & Sticker: Ultra Pro Sleeves, Toploader (Hartplastik), 9-Pocket Sammelseiten und Reißverschluss-Binder.',
};

export const dynamic = 'force-dynamic';

export default async function ZubehoerPage() {
  const allProducts = getProducts();
  const zubehoerProducts = allProducts.filter((p) =>
    isProductInParentCategory(p, 'zubehoer')
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <ProductCatalogView
        initialProducts={zubehoerProducts}
        pageTitle="Sammler-Zubehör & Schutzhüllen"
        pageSubtitle="Optimaler Schutz für deine wertvollsten Sticker und Trading Cards. Von passgenauen Penny Sleeves und formstabilen Ultra Pro Toploadern bis hin zu hochwertigen Reißverschluss-Sammelordnern."
      />
    </SiteShell>
  );
}
