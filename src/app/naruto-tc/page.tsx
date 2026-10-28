// src/app/naruto-tc/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Naruto TC kaufen | Earth Scroll Serie 1 | WOS Hamburg',
  description:
    'Originale Naruto Sammelkarten aus der Earth Scroll Serie 1 und Anime TC bei WOS World of Stickers.',
};

export const dynamic = 'force-dynamic';

export default async function NarutoTcPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const narutoProducts = products.filter((p) =>
    isProductInParentCategory(p, 'naruto-tc')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find(
    (c) => c.slug === 'naruto-tc' || c.slug === 'naruto-tradingcards'
  );
  const subcategoryOptions = (categoryDef?.subcategories || []).map((sub) => ({
    title: sub.title,
    slug: sub.slug,
    count: categoryCounts.sub[sub.slug] ?? 0,
    keywords: sub.keywords,
  }));

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <ProductCatalogView
        initialProducts={narutoProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="Naruto TC & Ninja-Karten"
        pageSubtitle="Originale Naruto Sammelkarten aus der Earth Scroll Serie 1 und weiteren Editionen. Jede Karte wird transportsicher verpackt und schnell aus Hamburg geliefert."
      />
    </SiteShell>
  );
}
