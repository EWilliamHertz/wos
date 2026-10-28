// src/components/HeaderNav.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Layers, LayoutGrid, Search, Sparkles, Star, HelpCircle } from 'lucide-react';
import { WOS_CATEGORIES } from '@/lib/catalog';

export default function HeaderNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the collections menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const primaryNav = [
    {
      href: '/',
      label: 'Alle Artikel',
      icon: LayoutGrid,
      isActive: pathname === '/',
    },
    {
      href: '/sticker',
      label: 'Sticker',
      icon: Star,
      isActive: pathname === '/sticker',
    },
    {
      href: '/tradingcards',
      label: 'Trading Cards',
      icon: Layers,
      isActive: pathname === '/tradingcards',
    },
  ];

  const isCollectionsActive = pathname.startsWith('/kollektionen');
  const isFinderActive = pathname === '/sticker-finder';
  const isFaqActive = pathname === '/faq';

  const itemBase =
    'relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors';
  const idle = 'text-zinc-300 hover:text-white hover:bg-white/5';
  const activeStyle = 'text-zinc-950 font-bold bg-gradient-to-r from-amber-300 to-amber-500 shadow-md shadow-amber-500/20';

  return (
    <nav aria-label="Hauptnavigation" className="border-t border-white/5 bg-[#080a0f]/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primaryNav.map(({ href, label, icon: Icon, isActive }) => (
            <Link
              key={href}
              href={href}
              className={`${itemBase} ${isActive ? activeStyle : idle}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}

          {/* Kollektionen Mega-Menu / Separate Page */}
          <div ref={menuRef} className="relative">
            <div className="inline-flex items-center">
              <Link
                href="/kollektionen"
                className={`${itemBase} rounded-r-none ${
                  isCollectionsActive ? activeStyle : idle
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Kollektionen</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label="Kollektionen Menü öffnen"
                className={`py-2 px-2 rounded-r-full text-[13px] font-semibold border-l border-white/10 transition ${
                  isCollectionsActive
                    ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-auto sm:top-full mt-3 sm:w-[640px] z-50 rounded-2xl border border-white/10 bg-[#090b10]/95 backdrop-blur-2xl p-4 shadow-2xl shadow-black/80"
                >
                  <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-white/10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                      Alle Serien &amp; Kollektionen
                    </span>
                    <Link
                      href="/kollektionen"
                      onClick={() => setMenuOpen(false)}
                      className="text-[11px] font-bold text-amber-300 hover:text-white transition"
                    >
                      Kollektionen-Übersicht →
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                    {WOS_CATEGORIES.map((category) => {
                      const slug = category
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                      return (
                        <Link
                          key={category}
                          href={`/kollektionen/${slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="text-left px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-amber-300 transition"
                        >
                          {category}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="hidden sm:block mx-1.5 h-5 w-px bg-white/10" aria-hidden />

          {/* Sticker-Finder Page */}
          <Link
            href="/sticker-finder"
            className={`${itemBase} ${isFinderActive ? activeStyle : idle}`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Sticker-Finder</span>
          </Link>

          {/* FAQ & Shipping Page */}
          <Link
            href="/faq"
            className={`${itemBase} ${isFaqActive ? activeStyle : idle}`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>FAQ &amp; Versand</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
