// src/components/WosClientShell.tsx
'use client';

import React, { useState, useMemo } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { WOS_CATEGORIES } from '@/lib/catalog';
import HeaderNav from '@/components/HeaderNav';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function WosClientShell({ initialProducts }: { initialProducts: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle Kollektionen');
  const [selectedType, setSelectedType] = useState<'ALL' | 'Sticker' | 'Tradingcard'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [gapFinderInput, setGapFinderInput] = useState('');
  const [shippingZone, setShippingZone] = useState<'DE_EU' | 'WORLD'>('DE_EU');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Parse missing sticker/card numbers from the Sticker- & Karten-Finder (e.g., "15, 50, 108, KSA19")
  const gapNumbers = useMemo(() => {
    if (!gapFinderInput.trim()) return [];
    return gapFinderInput
      .split(/[,;\s]+/)
      .map((s) => s.trim().replace(/^#|^nr\.?/i, '').toUpperCase())
      .filter(Boolean);
  }, [gapFinderInput]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Alle Kollektionen' ||
        product.category === selectedCategory ||
        product.series.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesType =
        selectedType === 'ALL' || product.productType === selectedType;

      const matchesSearch =
        !searchQuery.trim() ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGapFinder =
        gapNumbers.length === 0 ||
        gapNumbers.includes(product.number.toUpperCase());

      return matchesCategory && matchesType && matchesSearch && matchesGapFinder;
    });
  }, [initialProducts, selectedCategory, selectedType, searchQuery, gapNumbers]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
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

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = cart.length === 0 ? 0 : shippingZone === 'DE_EU' ? 1.0 : 5.0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Collector Announcement Bar */}
      <div className="relative bg-gradient-to-r from-amber-500/15 via-slate-950 to-sky-500/15 border-b border-white/5 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-2 font-medium text-amber-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>1,00 € Briefversand aus Hamburg</strong> (DE &amp; EU) • Jede Karte &amp; jeder Sticker handgeprüft im Sleeve/Toploader!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" /> Versand aus Hamburg
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 14 Tage Widerrufsrecht
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#07090e]/85 border-b border-white/10 shadow-xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30 ring-1 ring-white/20 group-hover:rotate-[-4deg] group-hover:scale-105 transition">
              WOS
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-none">
                WORLD OF <span className="text-amber-400">STICKERS</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-[0.18em] uppercase">
                Einzelsticker &amp; Trading Cards • Hamburg
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Nr. (z.B. 15, 108, KSA19), Spieler, One Piece, Panini..."
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-400/70 focus:bg-white/[0.07] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/25"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Warenkorb</span>
            <span className="min-w-6 h-6 px-1.5 inline-flex items-center justify-center text-xs rounded-full bg-slate-950 text-amber-400 font-extrabold">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </button>
        </div>

        <HeaderNav
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          onSelectType={setSelectedType}
          onSelectCategory={setSelectedCategory}
        />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-[#07090e] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>✨ Willkommen bei WOS World of Stickers aus Hamburg</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.12]">
              Einzelsticker &amp; Sammelkarten kaufen –{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-sky-400">
                ganz ohne ganze Päckchen!
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Du suchst noch einen bestimmten Sticker für dein Sammelalbum oder dir fehlt eine Karte deiner Lieblingsmannschaft? Bei <strong>WOS World of Stickers</strong> packe ich jeden Panini &amp; Topps Booster selbst von Hand aus und schütze jedes Stück sofort im Sleeve.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">100% Original</div>
                  <div className="text-xs text-slate-400">Frisch aus Panini &amp; Topps Boostern</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <PackageCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Im Sleeve &amp; Toploader</div>
                  <div className="text-xs text-slate-400">Knicksicher &amp; wasserfest verpackt</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">1,00 € Wohlfühlversand</div>
                  <div className="text-xs text-slate-400">Pauschal für Deutschland &amp; Europa</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sticker- & Karten-Finder Widget */}
          <div
            id="sticker-finder"
            className="scroll-mt-40 lg:col-span-5 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-500/5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm">
                🔍 Sticker- &amp; Karten-Finder
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Sammellücken schließen
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Finde deine fehlenden Nummern sofort!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gib deine fehlenden Nummern durch Komma getrennt ein (z.B.{' '}
              <code className="text-amber-300 font-mono">1, 15, 30, 50, 108, KSA19, 540</code>) – wir filtern dir sofort alle passenden Einzelsticker &amp; Karten heraus:
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={gapFinderInput}
                onChange={(e) => setGapFinderInput(e.target.value)}
                placeholder="z.B. 15, 50, 108, KSA19, 540 ..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none font-mono"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setGapFinderInput('15, 50, 108, KSA19, 540')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  ✨ Beispiel-Nummern testen
                </button>
                {gapFinderInput && (
                  <button
                    onClick={() => setGapFinderInput('')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            </div>
            {gapNumbers.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                🎯 Es werden <strong>{filteredProducts.length}</strong> verfügbare Artikel für deine gesuchten Nummern ({gapNumbers.join(', ')}) angezeigt!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Shop & Category Explorer */}
      <main id="shop" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 grid lg:grid-cols-12 gap-8 scroll-mt-32">
        {/* Sidebar Categories (Authentic WOS Collections) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Produkttyp</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['ALL', 'Sticker', 'Tradingcard'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold transition ${
                    selectedType === type
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'Alle' : type === 'Sticker' ? 'Sticker' : 'Karten'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Serien &amp; Kollektionen
            </div>
            <button
              onClick={() => setSelectedCategory('Alle Kollektionen')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                selectedCategory === 'Alle Kollektionen'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span>Alle Kollektionen</span>
              <span className="text-[11px] opacity-80">{initialProducts.length}</span>
            </button>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {WOS_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition ${
                    selectedCategory === category
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-9 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3.5">
            <div>
              <h2 className="text-lg font-extrabold text-white">{selectedCategory}</h2>
              <p className="text-xs text-slate-400">
                Zeige {filteredProducts.length} handgeprüfte Einzelstücke (Bilder via Vercel Blob CDN)
              </p>
            </div>
            <div className="flex items-center gap-2 md:hidden w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nummer oder Name suchen..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition shadow-lg"
                >
                  <div>
                    <Link
                      href={`/product/${product.id}/${product.slug}`}
                      className="block relative aspect-[3/4] bg-slate-950 overflow-hidden"
                    >
                      <img
                        src={product.blobImageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-950/90 text-amber-400 border border-amber-500/30">
                          #{product.number}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900/90 text-slate-200 border border-slate-700">
                          {product.productType}
                        </span>
                      </div>
                    </Link>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
                        {product.manufacturer} • {product.series}
                      </div>
                      <Link
                        href={`/product/${product.id}/${product.slug}`}
                        className="block text-base font-extrabold text-white group-hover:text-amber-300 transition"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{product.condition}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-3 border-t border-slate-800/60 mt-2">
                    <div>
                      <span className="text-lg font-black text-white">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        inkl. MwSt., zzgl. 1,00 € Versand
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/product/${product.id}/${product.slug}`}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition"
                      >
                        + In den Korb
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Authentic WOS FAQ & Hamburg Collector Promise */}
      <section id="faq" className="scroll-mt-32 border-t border-slate-800/80 bg-slate-900/30 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Häufig gestellte Fragen (FAQ) &amp; Versand aus Hamburg
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Von Sammlerin für Sammler – 100% Original &amp; Knicksicher
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="text-amber-400 font-black text-sm">
                1️⃣ WIE PACKST DU DIE STICKER &amp; KARTEN AUS?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ich packe jeden einzelnen Booster selbst aus – egal ob Panini Sticker, Topps Sticker oder Trading Cards. Direkt nach dem Auspacken wird jedes Produkt einzeln gescannt, auf Mint-Qualität geprüft und sofort in hochwertige Sleeves/Hüllen verpackt.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="text-amber-400 font-black text-sm">
                2️⃣ WAS KOSTET DER VERSAND AUS HAMBURG?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ich arbeite mit klaren Pauschalpreisen ohne Überraschungen: <strong>1,00 € Briefversand für Deutschland &amp; ganz Europa</strong> (mein Wohlfühlpreis für alle Sammler) und <strong>5,00 € weltweit</strong> (USA, Kanada, Australien). Alles wird knicksicher mit Toploadern im Luftpolsterumschlag verschickt.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="text-amber-400 font-black text-sm">
                3️⃣ GIBT ES RABATT BEI GROSSBESTELLUNGEN?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ja! Kombiniere beliebig viele Sticker &amp; Karten für nur einmalig 1,00 € Versand. Ab 20 Stickern/Karten mache ich dir gerne ein individuelles Sammler-Angebot per E-Mail an{' '}
                <a href="mailto:info@wosworldofstickers.de" className="text-amber-400 underline">
                  info@wosworldofstickers.de
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Footer (Impressum & Contact from wosworldofstickers.de) */}
      <footer className="border-t border-slate-800 bg-[#05070b] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-white font-black text-sm">WOS World of Stickers</div>
            <p>Michaela Schulze Stohr</p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Sonninstr. 18e, 20097 Hamburg, Deutschland
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              info@wosworldofstickers.de
            </p>
            <p>USt-IdNr.: DE 360644666</p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-sm">Beliebte Kollektionen</div>
            <ul className="space-y-1">
              <li>Panini FIFA World Cup WM 2026 &amp; WM 2022</li>
              <li>Panini Adrenalyn XL Fifa 365 2026/27 Golden Elite</li>
              <li>Topps Champions League &amp; Premier League 2026/27</li>
              <li>One Piece, Naruto &amp; Star Wars Unlimited</li>
              <li>Panini Stitch Scrap Book 2026 &amp; Donald Duck 90 Jahre</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-sm">Rechtliches &amp; Verwaltung</div>
            <ul className="space-y-1.5">
              <li>14 Tage gesetzliches Widerrufsrecht</li>
              <li>Zahlung via PayPal &amp; Mollie</li>
              <li>
                <Link href="/admin" className="text-amber-400 hover:underline inline-flex items-center gap-1">
                  Zum Vercel Blob Admin-Portal (/admin) <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
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
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-slate-800 z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-5 overflow-y-auto pr-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">Dein Sammler-Warenkorb</h3>
                    <p className="text-xs text-slate-400">
                      Knicksicher im Sleeve &amp; Toploader aus Hamburg
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Dein Warenkorb ist noch leer. Stöbere durch unsere Einzelsticker &amp; Karten!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3"
                      >
                        <img
                          src={product.blobImageUrl}
                          alt={product.title}
                          className="w-12 h-16 object-contain bg-slate-950 rounded-lg p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {product.series}
                          </div>
                          <div className="text-xs font-extrabold text-amber-400 mt-0.5">
                            {(product.price * quantity).toFixed(2).replace('.', ',')} €
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQty(product.id, -1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{quantity}</span>
                          <button
                            onClick={() => updateCartQty(product.id, 1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="space-y-2 text-xs">
                  <label className="block text-slate-400 font-semibold">Versandzone wählen:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShippingZone('DE_EU')}
                      className={`p-2 rounded-lg border text-left ${
                        shippingZone === 'DE_EU'
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      DE &amp; EU: 1,00 €
                    </button>
                    <button
                      onClick={() => setShippingZone('WORLD')}
                      className={`p-2 rounded-lg border text-left ${
                        shippingZone === 'WORLD'
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      Weltweit: 5,00 €
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Zwischensumme</span>
                    <span>{subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Knicksicherer Briefversand (Hamburg)</span>
                    <span>{shippingCost.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-base pt-1">
                    <span>Gesamtsumme</span>
                    <span className="text-amber-400">{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() =>
                    alert(
                      `Vielen Dank für deine Bestellung bei WOS World of Stickers (${total
                        .toFixed(2)
                        .replace('.', ',')} €)!`
                    )
                  }
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-sm transition"
                >
                  Jetzt sicher bestellen (PayPal / Mollie)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}