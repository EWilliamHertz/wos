// src/app/sticker-finder/StickerFinderTool.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShoppingBag,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatEur } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';

export default function StickerFinderTool({ products }: { products: Product[] }) {
  const { addToCart, addMultipleToCart } = useCart();
  const [inputText, setInputText] = useState('1, 15, 30, 50, 61, 73, 91, 108, KSA19, 305, 320, 540');
  const [selectedSeries, setSelectedSeries] = useState<string>('ALLE');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Parse missing numbers
  const searchedNumbers = useMemo(() => {
    if (!inputText.trim()) return [];
    return Array.from(
      new Set(
        inputText
          .split(/[,;\s\n\t]+/)
          .map((s) => s.trim().replace(/^#|^nr\.?/i, '').toUpperCase())
          .filter(Boolean)
      )
    );
  }, [inputText]);

  // All unique series
  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.series) set.add(p.series);
    }
    return Array.from(set).sort();
  }, [products]);

  // Matched products
  const matchedProducts = useMemo(() => {
    if (searchedNumbers.length === 0) return [];
    return products.filter((p) => {
      if (selectedSeries !== 'ALLE' && p.series !== selectedSeries) return false;
      return searchedNumbers.includes(p.number.toUpperCase());
    });
  }, [products, searchedNumbers, selectedSeries]);

  // Which searched numbers were found and which are still missing
  const foundNumberSet = useMemo(() => {
    return new Set(matchedProducts.map((p) => p.number.toUpperCase()));
  }, [matchedProducts]);

  const matchedSubtotal = useMemo(() => {
    return matchedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [matchedProducts]);

  const handleAddAll = () => {
    if (!matchedProducts.length) return;
    addMultipleToCart(matchedProducts);
  };

  const handleSingleAdd = (product: Product) => {
    addToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c0f16] border border-amber-500/30 rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl shadow-amber-500/5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fehlende Sticker &amp; Karten Sofort-Finder</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Sticker- &amp; Karten-Finder
        </h1>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          Fülle dein Sammelalbum ohne mühsames Suchen: Füge einfach deine Liste fehlender Nummern (durch Kommas, Leerzeichen oder Zeilenumbrüche getrennt) ein. Wir prüfen sofort unseren Hamburger Bestand und zeigen dir alle Treffer mit Original-Preisen!
        </p>
      </div>

      {/* Input Box Card */}
      <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="grid md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
              Deine gesuchten Stickernummern
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="z.B. 1, 15, 30, 50, 73, 108, KSA19, 166, 305, 320, 540..."
              rows={4}
              className="w-full bg-[#06070a] border border-zinc-800 focus:border-amber-400 rounded-2xl p-4 text-sm font-mono text-white placeholder:text-zinc-600 outline-none resize-y"
            />
            <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
              <span>{`${searchedNumbers.length} eindeutige Nummern eingegeben`}</span>
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-zinc-500 hover:text-white underline"
              >
                Eingabe leeren
              </button>
            </div>
          </div>

          {/* Series Filter & Action Card */}
          <div className="md:col-span-4 bg-[#06070a] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300">
                Serie einschränken (optional)
              </label>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full bg-[#0c0f16] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="ALLE">Alle Serien &amp; Kollektionen</option>
                {seriesOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-zinc-800/80 pt-3 space-y-2">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Gefundene Treffer:</span>
                <strong className="text-emerald-400">{matchedProducts.length}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Zwischensumme Treffer:</span>
                <strong className="text-amber-400">{formatEur(matchedSubtotal)}</strong>
              </div>

              <button
                type="button"
                disabled={matchedProducts.length === 0}
                onClick={handleAddAll}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-30 text-zinc-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{`Alle ${matchedProducts.length} Treffer in den Korb`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Checklist Pills */}
        {searchedNumbers.length > 0 && (
          <div className="border-t border-zinc-800/80 pt-4 space-y-3">
            <span className="text-xs font-bold text-zinc-400 block">
              Status deiner gesuchten Nummern:
            </span>
            <div className="flex flex-wrap gap-2">
              {searchedNumbers.map((num) => {
                const found = foundNumberSet.has(num);
                return (
                  <span
                    key={num}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                      found
                        ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/30'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {found ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                    {`#${num}`}
                    {found ? '' : ' (nicht lagernd)'}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Passende gefundene Artikel</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">
              {`${matchedProducts.length} Treffer`}
            </span>
          </h2>
        </div>

        {matchedProducts.length === 0 ? (
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-bold text-white">
              Keine Treffer für die eingegebenen Nummern gefunden.
            </p>
            <p className="text-xs text-zinc-400">
              Überprüfe deine Eingabe oder wähle „Alle Serien“.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {matchedProducts.map((product) => {
              const isAdded = justAddedId === product.id;
              return (
                <div
                  key={product.id}
                  className="group bg-[#0c0f16] border border-zinc-800/90 hover:border-amber-400/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div>
                    {/* Image Box */}
                    <Link
                      href={`/product/${product.id}/${product.slug}`}
                      className="block relative aspect-[3/4] bg-gradient-to-b from-[#121722] to-[#080a0f] p-3 overflow-hidden"
                    >
                      <img
                        src={product.blobImageUrl}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-zinc-950/90 text-amber-400 border border-amber-400/30 font-mono">
                          {`#${product.number}`}
                        </span>
                      </div>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700/70">
                        {product.productType}
                      </span>
                    </Link>

                    {/* Details */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider truncate">
                        {`${product.manufacturer || 'Panini'} • ${product.series || ''}`}
                      </div>
                      <Link
                        href={`/product/${product.id}/${product.slug}`}
                        className="block text-xs sm:text-sm font-extrabold text-white group-hover:text-amber-300 transition line-clamp-2 min-h-[2.5rem]"
                      >
                        {product.title}
                      </Link>
                    </div>
                  </div>

                  {/* Price & Cart Button */}
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base sm:text-lg font-black text-white block leading-none">
                        {formatEur(product.price)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        ● Sofort lieferbar
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSingleAdd(product)}
                      className={`px-3 py-2 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                        isAdded
                          ? 'bg-emerald-400 text-zinc-950'
                          : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Im Korb
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Kaufen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
