// src/components/ProductCatalogView.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  Check,
  X,
  Package,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatEur, getProductTypeLabel } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';

export interface SubcategoryOption {
  title: string;
  slug: string;
  count: number;
  keywords?: string[];
}

interface ProductCatalogViewProps {
  initialProducts: Product[];
  fixedType?: 'ALL' | 'Sticker' | 'Tradingcard';
  fixedCategory?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  initialSearchQuery?: string;
  subcategories?: SubcategoryOption[];
  initialSubSlug?: string;
}

const ITEMS_PER_PAGE = 36;

export default function ProductCatalogView({
  initialProducts,
  fixedType = 'ALL',
  fixedCategory = 'Alle Kollektionen',
  pageTitle,
  pageSubtitle,
  initialSearchQuery = '',
  subcategories = [],
  initialSubSlug,
}: ProductCatalogViewProps) {
  const { addToCart, addMultipleToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory);
  const [selectedType, setSelectedType] = useState<'ALL' | 'Sticker' | 'Tradingcard'>(fixedType);
  const [selectedSubSlug, setSelectedSubSlug] = useState<string | null>(initialSubSlug || null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [gapFinderInput, setGapFinderInput] = useState('');
  const [sortBy, setSortBy] = useState<'number-asc' | 'price-asc' | 'price-desc' | 'title-asc'>('number-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter subcategories: hide empty ones, preserve designated slot order
  const activeSubcategories = useMemo(() => {
    return subcategories.filter((s) => s.count > 0);
  }, [subcategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedType, selectedSubSlug, searchQuery, gapFinderInput, sortBy]);

  // Dynamically compute categories & counts from products
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of initialProducts) {
      if (fixedType !== 'ALL' && p.productType !== fixedType) continue;
      const cat = p.category || p.series || 'Weitere Kollektionen';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [initialProducts, fixedType]);

  // Parse gap finder input
  const gapNumbers = useMemo(() => {
    if (!gapFinderInput.trim()) return [];
    return gapFinderInput
      .split(/[,;\s]+/)
      .map((s) => s.trim().replace(/^#|^nr\.?/i, '').toUpperCase())
      .filter(Boolean);
  }, [gapFinderInput]);

  const filteredProducts = useMemo(() => {
    const list = initialProducts.filter((product) => {
      // Type match
      const targetType = fixedType !== 'ALL' ? fixedType : selectedType;
      if (targetType !== 'ALL' && product.productType !== targetType) return false;

      // Category match
      const targetCategory = fixedCategory !== 'Alle Kollektionen' ? fixedCategory : selectedCategory;
      const cat = product.category || product.series || 'Weitere Kollektionen';
      const matchesCategory =
        targetCategory === 'Alle Kollektionen' ||
        cat.toLowerCase() === targetCategory.toLowerCase() ||
        product.series.toLowerCase().includes(targetCategory.toLowerCase());
      if (!matchesCategory) return false;

      // Search match
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesSearch =
          product.title.toLowerCase().includes(q) ||
          product.series.toLowerCase().includes(q) ||
          product.manufacturer.toLowerCase().includes(q) ||
          product.number.toLowerCase() === q ||
          `nr.${product.number.toLowerCase()}` === q;
        if (!matchesSearch) return false;
      }

      // Gap finder match
      if (gapNumbers.length > 0 && !gapNumbers.includes(product.number.toUpperCase())) {
        return false;
      }

      // Subcategory match
      if (selectedSubSlug && activeSubcategories.length > 0) {
        const chosenSub = activeSubcategories.find((s) => s.slug === selectedSubSlug);
        if (chosenSub && chosenSub.keywords && chosenSub.keywords.length > 0) {
          const text = `${product.category} ${product.series} ${product.title} ${product.manufacturer}`.toLowerCase();
          const matchesSub = chosenSub.keywords.some((kw) => text.includes(kw.toLowerCase()));
          if (!matchesSub) return false;
        }
      }

      return true;
    });

    // Deterministic sort
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
        const diff = a.number.localeCompare(b.number, 'de', { numeric: true, sensitivity: 'base' });
        if (diff !== 0) return diff;
      }
      return a.id.localeCompare(b.id);
    });
  }, [
    initialProducts,
    fixedType,
    selectedType,
    fixedCategory,
    selectedCategory,
    selectedSubSlug,
    activeSubcategories,
    searchQuery,
    gapNumbers,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleAddAllGaps = () => {
    addMultipleToCart(filteredProducts.slice(0, 50));
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Header Banner */}
      {(pageTitle || pageSubtitle) && (
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-2">
          {pageTitle && <h1 className="text-2xl sm:text-4xl font-black text-white">{pageTitle}</h1>}
          {pageSubtitle && <p className="text-zinc-400 text-sm max-w-3xl">{pageSubtitle}</p>}
        </div>
      )}

      {/* Subcategory Filter Pills (Only populated categories/subcategories are rendered) */}
      {activeSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubSlug(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              !selectedSubSlug
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'bg-[#0c0f16] text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            Alle ({initialProducts.length})
          </button>
          {activeSubcategories.map((sub) => {
            const isSelected = selectedSubSlug === sub.slug;
            return (
              <button
                key={sub.slug}
                type="button"
                onClick={() => setSelectedSubSlug(isSelected ? null : sub.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                    : 'bg-[#0c0f16] text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{sub.title}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* When initial category is empty (e.g. pending stock/extraction) */}
      {initialProducts.length === 0 ? (
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5 my-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto text-amber-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Zurzeit keine Artikel auf Lager
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Unser Sammlerbestand an originalen Einzelstücken wird kontinuierlich erweitert. Sobald neue Lieferungen eintreffen, findest du sie direkt hier!
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition"
            >
              Alle verfügbaren Artikel ansehen →
            </Link>
            <Link
              href="/kollektionen"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold transition"
            >
              Andere Kollektionen durchstöbern
            </Link>
          </div>
        </div>
      ) : (
        /* Main Grid: Sidebar + Products */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Product Type Filter (if not fixed) */}
          {fixedType === 'ALL' && (
            <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Produkttyp</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['ALL', 'Sticker', 'Tradingcard'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center ${
                      selectedType === type
                        ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                        : 'bg-[#06070a] text-zinc-400 hover:text-white border border-zinc-800/80'
                    }`}
                  >
                    {type === 'ALL' ? 'Alle' : type === 'Sticker' ? 'Sticker' : 'TC'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Gap Finder Widget in Sidebar */}
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Nummern-Filter
              </span>
              {gapNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGapFinderInput('')}
                  className="text-[10px] text-zinc-500 hover:text-white underline"
                >
                  Zurücksetzen
                </button>
              )}
            </div>
            <input
              type="text"
              value={gapFinderInput}
              onChange={(e) => setGapFinderInput(e.target.value)}
              placeholder="z.B. 1, 15, 50, 108, KSA19..."
              className="w-full bg-[#06070a] border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 outline-none"
            />
            {gapNumbers.length > 0 && (
              <button
                type="button"
                onClick={handleAddAllGaps}
                className="w-full py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs transition"
              >
                {`Alle ${filteredProducts.length} Treffer in den Korb`}
              </button>
            )}
          </div>

          {/* Categories List */}
          {fixedCategory === 'Alle Kollektionen' && (
            <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Serien &amp; Kollektionen
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {categoryStats.length}
                </span>
              </div>

              <button
                type="button"
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
                    type="button"
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
          )}
        </aside>

        {/* Products Grid & Toolbar */}
        <section className="lg:col-span-9 space-y-6">
          {/* Control Bar */}
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{fixedCategory !== 'Alle Kollektionen' ? fixedCategory : selectedCategory}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {`${filteredProducts.length} Artikel`}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {`Seite ${currentPage} von ${totalPages} • Echte Live-Preise inkl. MwSt.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
                Keine passenden Artikel für diese Filterkriterien gefunden.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Alle Kollektionen');
                  setSelectedType('ALL');
                  setSearchQuery('');
                  setGapFinderInput('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs"
              >
                Filter zurücksetzen
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
                          {getProductTypeLabel(product)}
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
                          ● Auf Lager
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-[#0c0f16] border border-zinc-800/80 rounded-2xl px-4 py-3">
              <button
                type="button"
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
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-bold text-white transition"
              >
                Nächste <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
      )}
    </div>
  );
}
