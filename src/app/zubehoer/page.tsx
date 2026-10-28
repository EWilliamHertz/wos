// src/app/zubehoer/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'Zubehör für Sammler | Sleeves, Toploader & Sammelordner | WOS Hamburg',
  description:
    'Professioneller Schutz für deine Sammelkarten & Sticker: Ultra Pro Sleeves, Toploader (Hartplastik), 9-Pocket Sammelseiten und Reißverschluss-Binder.',
};

export const dynamic = 'force-dynamic';

export default async function ZubehoerPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const zubehoerProducts = products.filter((p) =>
    isProductInParentCategory(p, 'zubehoer')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find((c) => c.slug === 'zubehoer');
  const subcategoryOptions = (categoryDef?.subcategories || []).map((sub) => ({
    title: sub.title,
    slug: sub.slug,
    count: categoryCounts.sub[sub.slug] ?? 0,
    keywords: sub.keywords,
  }));

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <ProductCatalogView
        initialProducts={zubehoerProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="Sammler-Zubehör & Schutzhüllen"
        pageSubtitle="Optimaler Schutz für deine wertvollsten Sticker und TC. Von passgenauen Penny Sleeves und formstabilen Ultra Pro Toploadern bis hin zu hochwertigen Reißverschluss-Sammelordnern."
      />
    </SiteShell>
  );
}
