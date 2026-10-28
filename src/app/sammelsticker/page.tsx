// src/app/sammelsticker/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
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
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const stickerProducts = products.filter((p) =>
    isProductInParentCategory(p, 'sammelsticker')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find((c) => c.slug === 'sammelsticker');
  const subcategoryOptions = (categoryDef?.subcategories || []).map((sub) => ({
    title: sub.title,
    slug: sub.slug,
    count: categoryCounts.sub[sub.slug] ?? 0,
    keywords: sub.keywords,
  }));

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <ProductCatalogView
        initialProducts={stickerProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="Sammelsticker & Einzelsticker"
        pageSubtitle={`Stöbere durch ${stickerProducts.length.toLocaleString(
          'de-DE'
        )} originale Sammelsticker von Panini, Topps, Disney & mehr. Jedes Stück wird von Hand auf Unversehrtheit geprüft und im Schutz-Sleeve für 1,00 € Pauschalversand geliefert.`}
      />
    </SiteShell>
  );
}
