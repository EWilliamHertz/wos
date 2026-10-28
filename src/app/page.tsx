// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { Sparkles, Truck, ShieldCheck, Search } from 'lucide-react';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';
import ProductCatalogView from '@/components/ProductCatalogView';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const resolvedParams = await searchParams;

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <div className="space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden border border-zinc-800/80 rounded-3xl bg-gradient-to-b from-[#0e121a] via-[#080a0f] to-[#06070a] p-6 sm:p-10 shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Original Panini &amp; Topps Einzelstücke aus Hamburg</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
                Kaufe genau deine{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                  fehlenden Sticker &amp; Karten
                </span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Schluss mit doppelten Päckchen! Bei <strong>WOS World of Stickers</strong> wählst du direkt deine gesuchten Nummern aus. Jedes Einzelstück wird von Hand geprüft und knicksicher im Sleeve versendet.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <Truck className="w-3.5 h-3.5 text-amber-400" /> 1,00 € Briefversand (Hamburg)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Schutzhülle inklusive
                </span>
              </div>
            </div>

            {/* Teaser Box: Sticker-Finder */}
            <div className="lg:col-span-5 bg-[#0c0f16] border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <Search className="w-4 h-4" /> Fehlende Nummern finden?
                </span>
                <span className="text-[11px] text-zinc-400">Album-Lücken füllen</span>
              </div>
              <p className="text-xs text-zinc-300 leading-normal">
                Nutze unseren spezialisierten <strong>Sticker-Finder</strong>: Füge deine Fehlstellen-Liste ein und lege alle Treffer mit einem Klick in den Korb!
              </p>
              <Link
                href="/sticker-finder"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
              >
                Zum interaktiven Sticker-Finder →
              </Link>
            </div>
          </div>
        </section>

        {/* Complete Catalog */}
        <ProductCatalogView
          initialProducts={products}
          initialSearchQuery={resolvedParams?.q || ''}
          pageTitle="Alle verfügbaren Einzelsticker & Karten"
          pageSubtitle="Stöbere durch unseren gesamten Hamburger Sammlerbestand oder nutze die Filter nach Kollektion, Hersteller und Nummer."
        />
      </div>
    </SiteShell>
  );
}
