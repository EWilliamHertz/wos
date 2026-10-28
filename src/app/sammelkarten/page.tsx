// src/app/sammelkarten/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Sammelkarten & TC kaufen | Panini Adrenalyn XL & Topps | WOS Hamburg',
  description:
    'Boosterfrische Sammelkarten von Panini Adrenalyn XL, Topps Champions League, NBA, NFL & Star Wars Unlimited im Toploader aus Hamburg.',
};

export const dynamic = 'force-dynamic';

export default async function SammelkartenPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const cardProducts = products.filter((p) =>
    isProductInParentCategory(p, 'sammelkarten')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find((c) => c.slug === 'sammelkarten');
  const subcategoryOptions = (categoryDef?.subcategories || []).map((sub) => ({
    title: sub.title,
    slug: sub.slug,
    count: categoryCounts.sub[sub.slug] ?? 0,
    keywords: sub.keywords,
  }));

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <ProductCatalogView
        initialProducts={cardProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="Sammelkarten & TC"
        pageSubtitle={`Finde deine Wunschkarten aus über ${cardProducts.length.toLocaleString(
          'de-DE'
        )} originalen TC (Panini Adrenalyn XL, Topps Match Attax, NBA, NFL, Eishockey & Star Wars). Jede Karte wird geschützt im Sleeve & Toploader versendet!`}
      />
    </SiteShell>
  );
}
