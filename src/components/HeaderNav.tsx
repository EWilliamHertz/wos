// src/components/HeaderNav.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Layers, LayoutGrid, Search, Sparkles, Star, HelpCircle } from 'lucide-react';
import { WOS_CATEGORIES } from '@/lib/catalog';

type ProductType = 'ALL' | 'Sticker' | 'Tradingcard';

interface HeaderNavProps {
  selectedType: ProductType;
  selectedCategory: string;
  onSelectType: (type: ProductType) => void;
  onSelectCategory: (category: string) => void;
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function HeaderNav({
  selectedType,
  selectedCategory,
  onSelectType,
  onSelectCategory,
}: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the collections menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const showAll = () => {
    onSelectType('ALL');
    onSelectCategory('Alle Kollektionen');
    scrollTo('shop');
  };
  const showType = (type: ProductType) => {
    onSelectType(type);
    onSelectCategory('Alle Kollektionen');
    scrollTo('shop');
  };
  const showCategory = (category: string) => {
    onSelectCategory(category);
    setMenuOpen(false);
    scrollTo('shop');
  };

  const primary = [
    {
      key: 'ALL',
      label: 'Alle Artikel',
      icon: LayoutGrid,
      active: selectedType === 'ALL' && selectedCategory === 'Alle Kollektionen',
      onClick: showAll,
    },
    {
      key: 'Sticker',
      label: 'Sticker',
      icon: Star,
      active: selectedType === 'Sticker',
      onClick: () => showType('Sticker'),
    },
    {
      key: 'Tradingcard',
      label: 'Trading Cards',
      icon: Layers,
      active: selectedType === 'Tradingcard',
      onClick: () => showType('Tradingcard'),
    },
  ];

  const itemBase =
    'relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors';
  const idle = 'text-slate-300 hover:text-white hover:bg-white/5';

  return (
    <nav aria-label="Hauptnavigation" className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primary.map(({ key, label, icon: Icon, active, onClick }) => (
            <button
              key={key}
              onClick={onClick}
              aria-current={active ? 'page' : undefined}
              className={`${itemBase} ${active ? 'text-slate-950' : idle}`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-lg shadow-amber-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative w-3.5 h-3.5" />
              <span className="relative">{label}</span>
            </button>
          ))}

          {/* Collections mega menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className={`${itemBase} ${
                menuOpen || selectedCategory !== 'Alle Kollektionen'
                  ? 'text-amber-300 bg-amber-400/10 ring-1 ring-amber-400/30'
                  : idle
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {selectedCategory !== 'Alle Kollektionen' ? 'Kollektion gewählt' : 'Kollektionen'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-auto sm:top-full mt-3 sm:w-[640px] z-50 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/60"
                >
                  <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                      Serien &amp; Kollektionen
                    </span>
                    <button
                      onClick={() => showCategory('Alle Kollektionen')}
                      className="text-[11px] font-semibold text-slate-400 hover:text-white transition"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto pr-1">
                    {WOS_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => showCategory(category)}
                        className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                          selectedCategory === category
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="hidden sm:block mx-1 h-5 w-px bg-white/10" aria-hidden />

          <button onClick={() => scrollTo('sticker-finder')} className={`${itemBase} ${idle}`}>
            <Search className="w-3.5 h-3.5" />
            Sticker-Finder
          </button>
          <button onClick={() => scrollTo('faq')} className={`${itemBase} ${idle}`}>
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ &amp; Versand
          </button>
        </div>
      </div>
    </nav>
  );
}
