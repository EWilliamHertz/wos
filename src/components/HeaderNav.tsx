// src/components/HeaderNav.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Layers,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  Shield,
  HelpCircle,
  Package,
  Flame,
  Info,
} from 'lucide-react';
import {
  WOS_MAIN_CATEGORIES,
  DEFAULT_CATEGORY_COUNTS,
  type CategoryCounts,
} from '@/lib/categories';

export default function HeaderNav({
  categoryCounts = DEFAULT_CATEGORY_COUNTS,
}: {
  categoryCounts?: CategoryCounts;
}) {
  const pathname = usePathname();
  const [activeMenuSlug, setActiveMenuSlug] = useState<string | null>(null);
  const [liveCounts, setLiveCounts] = useState<CategoryCounts | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Periodically refresh category counts in the background to capture live scraper additions
  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.counts) {
          setLiveCounts(data.counts);
        }
      } catch {
        // Ignore network hiccups
      }
    };

    const interval = setInterval(fetchCounts, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    if (!activeMenuSlug) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenuSlug(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuSlug(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [activeMenuSlug]);

  const itemBase =
    'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors';
  const idle = 'text-zinc-300 hover:text-white hover:bg-white/5';
  const activeStyle =
    'text-zinc-950 font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-md shadow-amber-500/20';

  const getIconForCategory = (slug: string) => {
    switch (slug) {
      case 'sammelsticker':
        return Star;
      case 'sammelkarten':
        return Layers;
      case 'one-piece-tradingcards':
        return Sparkles;
      case 'naruto-tradingcards':
        return Flame;
      case 'pokemon-tradingcards':
        return Sparkles;
      case 'zubehoer':
        return Package;
      default:
        return Layers;
    }
  };

  const currentCounts = liveCounts || categoryCounts || DEFAULT_CATEGORY_COUNTS;

  // Filter main categories: hide categories with 0 items, but preserve designated slot order
  const visibleCategories = WOS_MAIN_CATEGORIES.filter((cat) => {
    const catCount =
      currentCounts.main[cat.slug] ??
      DEFAULT_CATEGORY_COUNTS.main[cat.slug] ??
      0;
    return catCount > 0;
  });

  return (
    <nav ref={navRef} aria-label="Hauptkategorien Navigation" className="border-t border-white/5 bg-[#080a0f]/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Home / Alle Artikel */}
          <Link
            href="/"
            className={`${itemBase} ${pathname === '/' ? activeStyle : idle}`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Alle Artikel</span>
          </Link>

          {/* Main Parent Categories (Dynamically hidden if count === 0, slot order preserved) */}
          {visibleCategories.map((cat) => {
            const Icon = getIconForCategory(cat.slug);
            const isCurrentPage = pathname === cat.href || pathname.startsWith(`${cat.href}/`);
            const isMenuOpen = activeMenuSlug === cat.slug;
            const visibleSubcategories = (cat.subcategories || []).filter((sub) => {
              const subCount =
                currentCounts.sub[sub.slug] ??
                DEFAULT_CATEGORY_COUNTS.sub[sub.slug] ??
                0;
              return subCount > 0;
            });
            const hasSubcats = visibleSubcategories.length > 0;

            return (
              <div key={cat.slug} className="relative inline-flex items-center shrink-0">
                <Link
                  href={cat.href}
                  className={`${itemBase} ${hasSubcats ? 'rounded-r-none pr-1.5' : ''} ${
                    isCurrentPage ? activeStyle : idle
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.title}</span>
                  {cat.badge && !isCurrentPage && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20 font-bold hidden xl:inline">
                      {cat.badge}
                    </span>
                  )}
                </Link>

                {hasSubcats && (
                  <button
                    type="button"
                    onClick={() => setActiveMenuSlug((curr) => (curr === cat.slug ? null : cat.slug))}
                    aria-expanded={isMenuOpen}
                    aria-label={`${cat.title} Unterkategorien`}
                    className={`py-1.5 px-1.5 rounded-r-full text-xs transition border-l border-white/10 ${
                      isCurrentPage
                        ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}

                {/* Subcategory Dropdown */}
                <AnimatePresence>
                  {isMenuOpen && hasSubcats && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-auto sm:top-full mt-2.5 sm:w-80 z-50 rounded-2xl border border-white/10 bg-[#090b10]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80"
                    >
                      <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                            {cat.title}
                          </span>
                          {currentCounts.main[cat.slug] !== undefined && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-mono">
                              {currentCounts.main[cat.slug]}
                            </span>
                          )}
                        </div>
                        <Link
                          href={cat.href}
                          onClick={() => setActiveMenuSlug(null)}
                          className="text-[10px] font-bold text-zinc-400 hover:text-white transition"
                        >
                          Alle anzeigen →
                        </Link>
                      </div>

                      <div className="space-y-1">
                        {visibleSubcategories.map((sub) => {
                          const subCount = currentCounts.sub[sub.slug];
                          return (
                            <Link
                              key={sub.slug}
                              href={`${cat.href}?sub=${sub.slug}`}
                              onClick={() => setActiveMenuSlug(null)}
                              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-amber-300 transition group"
                            >
                              <span>{sub.title}</span>
                              {typeof subCount === 'number' && (
                                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-amber-400">
                                  {subCount}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <span className="hidden sm:block mx-1 h-4 w-px bg-white/10 shrink-0" aria-hidden />

          {/* Sticker & Karten Finder */}
          <Link
            href="/sticker-finder"
            className={`${itemBase} shrink-0 ${pathname === '/sticker-finder' ? activeStyle : idle}`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Sticker-Finder</span>
          </Link>

          {/* Versand & FAQ */}
          <Link
            href="/faq"
            className={`${itemBase} shrink-0 ${pathname === '/faq' ? activeStyle : idle}`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Versand &amp; FAQ</span>
          </Link>

          {/* Über uns */}
          <Link
            href="/ueber-uns"
            className={`${itemBase} shrink-0 ${pathname === '/ueber-uns' ? activeStyle : idle}`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Über uns</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
