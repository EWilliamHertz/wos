// src/app/one-piece-tc/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import { isProductInParentCategory, WOS_MAIN_CATEGORIES } from '@/lib/categories';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const metadata: Metadata = {
  title: 'One Piece TC & Sticker kaufen | WOS World of Stickers Hamburg',
  description:
    'Offizielle One Piece TC & Sticker aus dem Bandai und Netflix Universum direkt aus Hamburg kaufen.',
};

export const dynamic = 'force-dynamic';

export default async function OnePieceTcPage({
  searchParams,
}: {
  searchParams?: Promise<{ sub?: string; q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;
  const subSlug = resolvedParams?.sub;

  const onePieceProducts = products.filter((p) =>
    isProductInParentCategory(p, 'one-piece-tc')
  );

  const categoryDef = WOS_MAIN_CATEGORIES.find(
    (c) => c.slug === 'one-piece-tc' || c.slug === 'one-piece-tradingcards'
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
        initialProducts={onePieceProducts}
        subcategories={subcategoryOptions}
        initialSubSlug={subSlug}
        initialSearchQuery={resolvedParams?.q || ''}
        pageTitle="One Piece TC & Sticker"
        pageSubtitle={`Alle ${onePieceProducts.length} verfügbaren One Piece Sammlerstücke aus den Sets The Time of Battle, Netflix One Piece Official Sticker & Anime TC. Handgeprüft im Sleeve!`}
      />
    </SiteShell>
  );
}
