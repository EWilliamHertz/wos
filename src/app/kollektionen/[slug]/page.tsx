// src/app/kollektionen/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getProducts } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const allProducts = getProducts();
  const match = allProducts.find((p) => slugify(p.category || p.series) === slug);
  const title = match ? match.category || match.series : 'Kollektion';

  return {
    title: `${title} | WOS World of Stickers Hamburg`,
    description: `Alle Einzelstücke der Kollektion ${title} bei WOS World of Stickers kaufen.`,
  };
}

export default async function SingleKollektionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProducts = getProducts();

  // Find category matching the slug
  const match = allProducts.find(
    (p) => slugify(p.category || p.series) === slug
  );

  if (!match) {
    notFound();
  }

  const categoryName = match.category || match.series;
  const collectionProducts = allProducts.filter(
    (p) => (p.category || p.series).toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <SiteShell totalProductsCount={allProducts.length}>
      <div className="space-y-6">
        <Link
          href="/kollektionen"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Alle Kollektionen
        </Link>

        <ProductCatalogView
          initialProducts={allProducts}
          fixedCategory={categoryName}
          pageTitle={categoryName}
          pageSubtitle={`Alle ${collectionProducts.length} verfügbaren Einzelsticker und Karten dieser Kollektion. Handgeprüft im Schutz-Sleeve und direkt lieferbar aus Hamburg.`}
        />
      </div>
    </SiteShell>
  );
}
