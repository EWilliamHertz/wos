// src/app/sticker-finder/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';
import StickerFinderTool from './StickerFinderTool';

export const metadata: Metadata = {
  title: 'Sticker- & Karten-Finder | Fehlende Nummern direkt finden | WOS Hamburg',
  description:
    'Füge deine Liste fehlender Stickernummern ein (z.B. 1, 15, 50, 108, KSA19) und kaufe alle Treffer auf einmal knicksicher verpackt bei WOS World of Stickers.',
};

export const dynamic = 'force-dynamic';

export default function StickerFinderPage() {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <StickerFinderTool products={products} />
    </SiteShell>
  );
}
