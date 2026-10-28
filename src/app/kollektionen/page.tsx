// src/app/kollektionen/page.tsx
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Alle Serien & Kollektionen | WOS World of Stickers Hamburg',
  description:
    'Übersicht aller Panini, Topps, Disney und Anime Sammelkollektionen bei WOS World of Stickers.',
};

export const dynamic = 'force-dynamic';

export default function KollektionenOverviewPage() {
  const { products: allProducts, categoryCounts, totalCount } = getCatalogSnapshot();

  // Group products by collection/category
  const collectionMap = new Map<
    string,
    {
      category: string;
      manufacturer: string;
      productType: string;
      count: number;
      sampleImage: string;
      slug: string;
    }
  >();

  for (const p of allProducts) {
    const cat = p.category || p.series || 'Weitere Kollektionen';
    const slug = cat
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = collectionMap.get(cat);
    if (!existing) {
      collectionMap.set(cat, {
        category: cat,
        manufacturer: p.manufacturer,
        productType: p.productType,
        count: 1,
        sampleImage: p.blobImageUrl,
        slug,
      });
    } else {
      existing.count += 1;
      if (!existing.sampleImage && p.blobImageUrl) {
        existing.sampleImage = p.blobImageUrl;
      }
    }
  }

  const collections = Array.from(collectionMap.values()).sort((a, b) => b.count - a.count);

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alle WOS Serien im Überblick</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Serien &amp; Kollektionen
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Wähle deine Serie aus, um gezielt alle verfügbaren Einzelsticker und Trading Cards dieser Kollektion zu durchstöbern.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/kollektionen/${col.slug}`}
              className="group bg-[#0c0f16] border border-zinc-800/80 hover:border-amber-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div className="space-y-4">
                {/* Sample Card Box */}
                <div className="relative aspect-[16/10] bg-gradient-to-b from-[#121722] to-[#080a0f] rounded-xl p-3 flex items-center justify-center overflow-hidden border border-zinc-800/60">
                  {col.sampleImage ? (
                    <img
                      src={col.sampleImage}
                      alt={col.category}
                      className="h-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Layers className="w-10 h-10 text-zinc-600" />
                  )}
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/90 text-amber-300 border border-amber-400/20 font-mono">
                    {`${col.count} Artikel`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                    {col.manufacturer || 'WOS'}
                  </span>
                  <h2 className="text-base font-black text-white group-hover:text-amber-300 transition line-clamp-2 mt-0.5">
                    {col.category}
                  </h2>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 mt-4 flex items-center justify-between text-xs font-bold text-zinc-400 group-hover:text-white transition">
                <span>Kollektion ansehen</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
