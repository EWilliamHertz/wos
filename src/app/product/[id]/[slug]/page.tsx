// src/app/product/[id]/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Truck,
  PackageCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getProducts, getCatalogSnapshot } from '@/lib/catalog.server';
import { formatEur, getProductTypeLabel } from '@/lib/catalog';
import SiteShell from '@/components/SiteShell';
import ProductAddButton from './ProductAddButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const products = getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return { title: 'Produkt nicht gefunden' };
  }

  const typeLabel = getProductTypeLabel(product);

  return {
    title: `${product.title} #${product.number} | WOS World of Stickers Hamburg`,
    description: `Original ${product.manufacturer} ${typeLabel} #${product.number} (${product.series}) kaufen. Zustand: ${product.condition}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  const { products, categoryCounts, totalCount } = getCatalogSnapshot();
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const typeLabel = getProductTypeLabel(product);

  const related = products
    .filter((p) => p.id !== product.id && p.series === product.series)
    .slice(0, 4);

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <div className="space-y-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Shop
          </Link>

          <Link
            href="/admin"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Im Admin-Bereich verwalten →
          </Link>
        </div>

        {/* Main Product Card */}
        <div className="grid md:grid-cols-12 gap-8 bg-[#0c0f16] border border-zinc-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="md:col-span-5 bg-[#07090e] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center relative">
            <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-black text-xs font-mono">
              {`#${product.number}`}
            </span>
            <img
              src={product.blobImageUrl}
              alt={product.title}
              className="w-full max-h-[420px] object-contain drop-shadow-2xl"
            />
            <div className="mt-4 w-full pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Vercel Blob Bild</span>
              <a
                href={product.blobImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:underline"
              >
                Vollbild öffnen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.category || product.series}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-400">
                  {formatEur(product.price)}
                </span>
                <span className="text-xs text-zinc-400">
                  inkl. MwSt. • zzgl. 1,00 € Pauschalversand (DE &amp; EU)
                </span>
              </div>

              <div className="bg-[#07090e] border border-zinc-800/80 rounded-2xl p-5 grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Hersteller</span>
                  <span className="text-white font-bold text-sm">{product.manufacturer}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Produkttyp</span>
                  <span className="text-white font-bold text-sm">{getProductTypeLabel(product)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Serie</span>
                  <span className="text-white font-bold text-sm">{product.series}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Zustand</span>
                  <span className="text-emerald-400 font-bold text-sm">{product.condition}</span>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {product.description ||
                  `Original ${typeLabel} in geprüfter Sammlerqualität. Direkt nach dem Öffnen des Boosters im Schutz-Sleeve gelagert.`}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <ProductAddButton product={product} />

              <div className="grid sm:grid-cols-3 gap-3 text-xs text-zinc-400 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sofort lieferbar</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Im Schutz-Sleeve</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1,00 € Versand (Hamburg)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">
              {`Weitere Einzelstücke aus ${product.series}`}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}/${item.slug}`}
                  className="bg-[#0c0f16] border border-zinc-800 hover:border-amber-400/50 rounded-2xl p-4 transition space-y-3 block"
                >
                  <img
                    src={item.blobImageUrl}
                    alt={item.title}
                    className="w-full h-40 object-contain bg-[#07090e] rounded-xl p-2"
                  />
                  <div>
                    <div className="text-xs font-bold text-amber-400 font-mono">{`#${item.number}`}</div>
                    <div className="text-xs font-extrabold text-white truncate">{item.title}</div>
                    <div className="text-xs font-black text-amber-300 mt-1">
                      {formatEur(item.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
