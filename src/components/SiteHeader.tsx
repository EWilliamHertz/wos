// src/components/SiteHeader.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import HeaderNav from './HeaderNav';
import { useCart } from '@/context/CartContext';
import { formatEur } from '@/lib/catalog';
import type { CategoryCounts } from '@/lib/categories';

export default function SiteHeader({
  totalProductsCount,
  categoryCounts,
}: {
  totalProductsCount?: number;
  categoryCounts?: CategoryCounts;
}) {
  const router = useRouter();
  const { subtotal, totalItemsInCart, setIsCartOpen, mounted } = useCart();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <>
      {/* Top Collector Announcement Bar */}
      <div className="bg-[#0c0e14] border-b border-amber-500/20 text-xs py-2 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-300/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>1,00 € Pauschalversand (DE &amp; EU)</strong> aus Hamburg • 100% Original Panini &amp; Topps im Schutz-Sleeve
            </span>
          </div>
          <div className="flex items-center gap-5 text-zinc-400">
            {typeof totalProductsCount === 'number' && totalProductsCount > 0 && (
              <span suppressHydrationWarning className="hidden sm:inline text-zinc-500">
                {`${totalProductsCount.toLocaleString('de-DE')} Einzelstücke auf Lager`}
              </span>
            )}
            <Link href="/faq" className="hover:text-amber-400 transition">
              Versand &amp; FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Main Header */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#06070a]/90 border-b border-zinc-800/80 shadow-xl shadow-black/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/15 group-hover:rotate-[-3deg] transition">
              <div className="w-full h-full bg-[#090b10] rounded-[11px] flex items-center justify-center font-black text-amber-400 text-base tracking-tighter group-hover:bg-transparent group-hover:text-black transition">
                WOS
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
                WORLD OF <span className="text-amber-400">STICKERS</span>
              </span>
              <span
                suppressHydrationWarning
                className="text-[11px] text-amber-400/90 font-semibold tracking-wider uppercase"
              >
                {'Einzelsticker & TC • Hamburg'}
              </span>
            </div>
          </Link>

          {/* Instant Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Suche nach Nummer (z.B. 50, 108, KSA19), Spieler, Serie oder Hersteller..."
              className="w-full bg-[#0e1118] border border-zinc-800 focus:border-amber-400/80 rounded-xl pl-11 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Cart Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/15"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{formatEur(subtotal)}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-950 text-amber-400 font-black">
                {mounted ? totalItemsInCart : 0}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <HeaderNav categoryCounts={categoryCounts} />
      </header>
    </>
  );
}
