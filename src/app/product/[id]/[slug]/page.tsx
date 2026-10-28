// src/app/product/[id]/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  PackageCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getProducts } from '@/lib/catalog.server';

export const dynamic = 'force-dynamic';

export default function ProductDetailPage({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const products = getProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((p) => p.id !== product.id && (p.series === product.series || p.manufacturer === product.manufacturer))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum WOS World of Stickers Shop
          </Link>

          <Link
            href="/admin"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Bild im Admin-Bereich bearbeiten
          </Link>
        </div>

        {/* Main Product Card */}
        <div className="grid md:grid-cols-12 gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Left: Vercel Blob Hosted Product Picture */}
          <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative">
            <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
              #{product.number}
            </span>
            <img
              src={product.blobImageUrl}
              alt={product.title}
              className="w-full max-h-[420px] object-contain"
            />
            <div className="mt-4 w-full pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
              <span>Vercel Blob Storage Asset</span>
              <a
                href={product.blobImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:underline"
              >
                Original Blob öffnen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right: Authentic WOS Specifications */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-400">
                  {product.price.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-xs text-slate-400">
                  inkl. MwSt. • zzgl. 1,00 € Briefversand aus Hamburg (DE/EU)
                </span>
              </div>

              {/* Structured WOS Metadata Block */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Hersteller:</span>
                  <span className="text-white font-bold text-sm">{product.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Produkttyp:</span>
                  <span className="text-white font-bold text-sm">{product.productType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Serie:</span>
                  <span className="text-white font-bold text-sm">{product.series}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Zustand:</span>
                  <span className="text-emerald-400 font-bold text-sm">{product.condition}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Original {product.productType} in sehr gutem Zustand. Direkt nach dem Auspacken aus dem Original-Booster persönlich geprüft und in einer hochwertigen Schutzhülle (Sleeve / Toploader) gelagert – ideal zum gezielten Vervollständigen deiner Sammlung ohne doppelte Päckchen.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="flex-1 text-center py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition"
                >
                  Im Shop zum Warenkorb hinzufügen ({product.price.toFixed(2).replace('.', ',')} €)
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sofort lieferbar ({product.stock}x auf Lager)</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Knicksicher im Sleeve</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>2–5 Werktage aus Hamburg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">
              Weitere Einzelstücke aus dieser Kollektion
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}/${item.slug}`}
                  className="bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 transition space-y-3 block"
                >
                  <img
                    src={item.blobImageUrl}
                    alt={item.title}
                    className="w-full h-44 object-contain bg-slate-950 rounded-xl p-2"
                  />
                  <div>
                    <div className="text-xs font-bold text-amber-400">#{item.number}</div>
                    <div className="text-sm font-extrabold text-white truncate">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.price.toFixed(2).replace('.', ',')} €
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}