// src/components/WosClientShell.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Filter,
  PackageCheck,
  Mail,
  MapPin,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatEur, getProductTypeLabel } from '@/lib/catalog';
import HeaderNav from '@/components/HeaderNav';

interface CartItem {
  product: Product;
  quantity: number;
}

const ITEMS_PER_PAGE = 36;

export default function WosClientShell({ initialProducts }: { initialProducts: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle Kollektionen');
  const [selectedType, setSelectedType] = useState<'ALL' | 'Sticker' | 'Tradingcard'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [gapFinderInput, setGapFinderInput] = useState('');
  const [sortBy, setSortBy] = useState<'number-asc' | 'price-asc' | 'price-desc' | 'title-asc'>('number-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [shippingZone, setShippingZone] = useState<'DE_EU' | 'WORLD'>('DE_EU');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mark client mount & load cart from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('wos_collector_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('wos_collector_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, mounted]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedType, searchQuery, gapFinderInput, sortBy]);

  // Dynamically compute categories & counts from actual products
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of initialProducts) {
      const cat = p.category || p.series || 'Weitere Kollektionen';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [initialProducts]);

  // Parse missing sticker/card numbers from the Sticker- & Karten-Finder
  const gapNumbers = useMemo(() => {
    if (!gapFinderInput.trim()) return [];
    return gapFinderInput
      .split(/[,;\s]+/)
      .map((s) => s.trim().replace(/^#|^nr\.?/i, '').toUpperCase())
      .filter(Boolean);
  }, [gapFinderInput]);

  const filteredProducts = useMemo(() => {
    const list = initialProducts.filter((product) => {
      const cat = product.category || product.series || 'Weitere Kollektionen';
      const matchesCategory =
        selectedCategory === 'Alle Kollektionen' ||
        cat === selectedCategory ||
        product.series.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesType =
        selectedType === 'ALL' || product.productType === selectedType;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.series.toLowerCase().includes(q) ||
        product.manufacturer.toLowerCase().includes(q) ||
        product.number.toLowerCase() === q ||
        `nr.${product.number.toLowerCase()}` === q;

      const matchesGapFinder =
        gapNumbers.length === 0 ||
        gapNumbers.includes(product.number.toUpperCase());

      return matchesCategory && matchesType && matchesSearch && matchesGapFinder;
    });

    // Deterministic sort: identical on both Node.js (SSR) and Browser (Client)
    return list.sort((a, b) => {
      if (sortBy === 'price-asc') {
        const diff = a.price - b.price;
        if (diff !== 0) return diff;
      } else if (sortBy === 'price-desc') {
        const diff = b.price - a.price;
        if (diff !== 0) return diff;
      } else if (sortBy === 'title-asc') {
        const diff = a.title.localeCompare(b.title, 'de');
        if (diff !== 0) return diff;
      } else {
        // Natural sort by sticker/card number
        const diff = a.number.localeCompare(b.number, 'de', { numeric: true, sensitivity: 'base' });
        if (diff !== 0) return diff;
      }
      return a.id.localeCompare(b.id);
    });
  }, [initialProducts, selectedCategory, selectedType, searchQuery, gapNumbers, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const addToCart = (product: Product, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
    if (openDrawer) setIsCartOpen(true);
  };

  const addAllGapMatchesToCart = () => {
    if (filteredProducts.length === 0) return;
    setCart((prev) => {
      const map = new Map(prev.map((i) => [i.product.id, i]));
      for (const p of filteredProducts.slice(0, 50)) {
        const existing = map.get(p.id);
        if (existing) {
          map.set(p.id, { ...existing, quantity: existing.quantity + 1 });
        } else {
          map.set(p.id, { product: p, quantity: 1 });
        }
      }
      return Array.from(map.values());
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalItemsInCart = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = cart.length === 0 ? 0 : shippingZone === 'DE_EU' ? 1.0 : 5.0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Collector Bar */}
      <div className="bg-[#0c0e14] border-b border-amber-500/20 text-xs py-2 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-300/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>1,00 € Pauschalversand (DE &amp; EU)</strong> aus Hamburg • 100% Original Panini &amp; Topps im Schutz-Sleeve
            </span>
          </div>
          <div className="flex items-center gap-5 text-zinc-400">
            <span className="hidden sm:inline text-zinc-500">
              {`${initialProducts.length.toLocaleString('de-DE')} Einzelstücke auf Lager`}
            </span>
            <a href="#faq" className="hover:text-amber-400 transition">
              Versand &amp; FAQ
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Glass Header */}
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
              <span className="text-[11px] text-amber-400/90 font-semibold tracking-wider uppercase">
                Einzelsticker &amp; TC • Hamburg
              </span>
            </div>
          </Link>

          {/* Instant Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Nummer (z.B. 50, 108, KSA19), Spieler, Serie oder Hersteller..."
              className="w-full bg-[#0e1118] border border-zinc-800 focus:border-amber-400/80 rounded-xl pl-11 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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

        {/* Clean Secondary Navigation Menu */}
        <HeaderNav />
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-[#0e121a] via-[#080a0f] to-[#06070a] py-10 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Original Panini &amp; Topps Einzelsticker-Shop Hamburg</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
                Kaufe genau deine{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                  fehlenden Sticker &amp; Karten
                </span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Schluss mit doppelten Päckchen! Bei <strong>WOS World of Stickers</strong> wählst du direkt deine gesuchten Nummern aus. Jedes Einzelstück wird von Hand geprüft und geschützt im Sleeve versendet.
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

            {/* Sticker- & Gap-Finder Widget */}
            <div
              id="sticker-finder"
              className="lg:col-span-5 scroll-mt-36 bg-[#0c0f16] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-500/5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <Search className="w-4 h-4" /> Sticker- &amp; Karten-Finder
                </span>
                <span className="text-[11px] text-zinc-400">Kommagetrennt eingeben</span>
              </div>
              <p className="text-xs text-zinc-300 leading-normal">
                Kopiere deine Fehlstellen-Liste (z.B.{' '}
                <code className="text-amber-300 font-mono">1, 15, 30, 50, 108, KSA19</code>) – wir filtern sofort alle Treffer heraus:
              </p>
              <textarea
                value={gapFinderInput}
                onChange={(e) => setGapFinderInput(e.target.value)}
                placeholder="z.B. 1, 15, 30, 50, 108, 166, 177, 305, 307, 320, 372, 540..."
                rows={3}
                className="w-full bg-[#06070a] border border-zinc-800 focus:border-amber-400/80 rounded-xl p-3 text-xs sm:text-sm font-mono text-white placeholder:text-zinc-600 outline-none resize-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-zinc-400">
                  {gapNumbers.length > 0
                    ? `${gapNumbers.length} Nummer(n) gesucht`
                    : 'Alle Nummern verfügbar'}
                </span>
                {gapNumbers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addAllGapMatchesToCart}
                      className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs transition"
                    >
                      Alle Treffer in Korb ({filteredProducts.length})
                    </button>
                    <button
                      onClick={() => setGapFinderInput('')}
                      className="text-xs text-zinc-400 hover:text-white underline"
                    >
                      Leeren
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Shop Explorer: Sidebar & Products */}
      <main id="shop" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 flex-1 grid lg:grid-cols-12 gap-8 scroll-mt-32">
        {/* Left Sidebar: Type & Dynamic Category Filters */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Product Type Filter */}
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Produkttyp</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['ALL', 'Sticker', 'Tradingcard'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center ${
                    selectedType === type
                      ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                      : 'bg-[#06070a] text-zinc-400 hover:text-white border border-zinc-800/80'
                  }`}
                >
                  {type === 'ALL' ? 'Alle' : type === 'Sticker' ? 'Sticker' : 'Karten'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Categories */}
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Kollektionen
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {categoryStats.length}
              </span>
            </div>

            <button
              onClick={() => setSelectedCategory('Alle Kollektionen')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                selectedCategory === 'Alle Kollektionen'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <span>Alle Kollektionen</span>
              <span className="text-[10px] opacity-75 font-mono">{initialProducts.length}</span>
            </button>

            <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {categoryStats.map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                    selectedCategory === category
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="truncate">{category}</span>
                  <span className="text-[10px] opacity-75 font-mono shrink-0">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Toolbar, Card Grid & Pagination */}
        <section className="lg:col-span-9 space-y-6">
          {/* Control Bar */}
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{selectedCategory}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {`${filteredProducts.length} Artikel`}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {`Seite ${currentPage} von ${totalPages} • Echte Live-Preise inkl. MwSt.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Mobile search */}
              <div className="md:hidden w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Nummer oder Name..."
                  className="w-full bg-[#06070a] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-[#06070a] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-amber-400"
                >
                  <option value="number-asc">Sortierung: Nummer (aufsteigend)</option>
                  <option value="price-asc">Preis: Günstigste zuerst</option>
                  <option value="price-desc">Preis: Höchste zuerst</option>
                  <option value="title-asc">Name (A–Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {paginatedProducts.length === 0 ? (
            <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
              <p className="text-base font-bold text-white">
                Keine passenden Sticker oder Karten für diesen Filter gefunden.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Alle Kollektionen');
                  setSelectedType('ALL');
                  setSearchQuery('');
                  setGapFinderInput('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs"
              >
                Alle Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => {
                const isAdded = justAddedId === product.id;
                return (
                  <div
                    key={product.id}
                    className="group bg-[#0c0f16] border border-zinc-800/90 hover:border-amber-400/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div>
                      {/* Collector Sleeve Image Box */}
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
                          {getProductTypeLabel(product)}
                        </span>
                      </Link>

                      {/* Card Details */}
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

                    {/* Price & Action Footer */}
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-black text-white block leading-none">
                          {formatEur(product.price)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          ● Auf Lager
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-[#0c0f16] border border-zinc-800/80 rounded-2xl px-4 py-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-bold text-white transition"
              >
                <ChevronLeft className="w-4 h-4" /> Vorherige
              </button>

              <span className="text-xs text-zinc-400 font-mono">
                {`Seite ${currentPage} von ${totalPages}`}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-bold text-white transition"
              >
                Nächste <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Authentic WOS Collector Guarantees */}
      <section id="faq" className="scroll-mt-32 border-t border-zinc-800/80 bg-[#090b10] py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-6">
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
            <div className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 100% Original &amp; Handgeprüft
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Jeder Sticker und jede TC wird in Hamburg frisch aus Original-Boostern gezogen und direkt in einer Schutzhülle gelagert.
            </p>
          </div>

          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
            <div className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" /> 1,00 € Pauschalversand (DE &amp; EU)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Egal wie viele Einzelsticker oder Karten du kombinierst: Du zahlst nur einmalig 1,00 € für den knicksicheren Versand innerhalb Deutschlands &amp; Europas (5,00 € weltweit).
            </p>
          </div>

          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
            <div className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4" /> Mengenrabatt ab 20 Stück
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Große Sammelliste? Schreib uns an{' '}
              <a href="mailto:info@wosworldofstickers.de" className="text-amber-400 underline">
                info@wosworldofstickers.de
              </a>{' '}
              für ein individuelles Komplettangebot.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#050608] py-8 text-xs text-zinc-500">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-white font-bold">
              WOS World of Stickers • Michaela Schulze Stohr
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Sonninstr. 18e, 20097 Hamburg
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> info@wosworldofstickers.de
              </span>
              <span>USt-IdNr.: DE 360644666</span>
            </div>
          </div>
          <Link href="/admin" className="text-amber-400 hover:underline font-semibold">
            Admin &amp; Vercel Blob Registry →
          </Link>
        </div>
      </footer>

      {/* Slide-Over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#090b10] border-l border-zinc-800 z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{`Warenkorb (${totalItemsInCart})`}</h3>
                    <p className="text-xs text-zinc-400">
                      Knicksicher im Sleeve &amp; Toploader aus Hamburg
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-14 text-zinc-500 text-sm">
                    Dein Warenkorb ist noch leer.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 bg-[#0e121a] border border-zinc-800/80 rounded-xl p-2.5"
                      >
                        <img
                          src={product.blobImageUrl}
                          alt={product.title}
                          className="w-12 h-16 object-contain bg-zinc-950 rounded-lg p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {`#${product.number} • ${formatEur(product.price)} / Stück`}
                          </div>
                          <div className="text-xs font-black text-amber-400 mt-0.5">
                            {formatEur(product.price * quantity)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
                          <button
                            onClick={() => updateCartQty(product.id, -1)}
                            className="p-1 hover:text-amber-400 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-white font-mono">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(product.id, 1)}
                            className="p-1 hover:text-amber-400 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Checkout Footer */}
              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setShippingZone('DE_EU')}
                    className={`p-2.5 rounded-xl border text-left ${
                      shippingZone === 'DE_EU'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    DE &amp; EU: 1,00 €
                  </button>
                  <button
                    onClick={() => setShippingZone('WORLD')}
                    className={`p-2.5 rounded-xl border text-left ${
                      shippingZone === 'WORLD'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Weltweit: 5,00 €
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Zwischensumme</span>
                    <span>{formatEur(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Versand (Hamburg)</span>
                    <span>{formatEur(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-base pt-1">
                    <span>Gesamtbetrag</span>
                    <span className="text-amber-400">{formatEur(total)}</span>
                  </div>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() =>
                    alert(`Bestellung über ${formatEur(total)} bereit zur Zahlung!`)
                  }
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-black text-xs sm:text-sm transition"
                >
                  {`Zur Kasse (${formatEur(total)})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
