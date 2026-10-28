// src/app/ueber-uns/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  MapPin,
  Mail,
  Video,
  Camera,
  ShoppingBag,
} from 'lucide-react';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Über uns | WOS World of Stickers Hamburg',
  description:
    'Lerne WOS World of Stickers kennen: Dein spezialisierter Fachhändler für Einzelsticker & TC aus Hamburg.',
};

export const dynamic = 'force-dynamic';

export default function UeberUnsPage() {
  const { categoryCounts, totalCount } = getCatalogSnapshot();

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Banner */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aus Hamburg für Sammler weltweit</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Über WOS World of Stickers
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Wir lieben das Sammeln genauso wie du! Schluss mit teuren, doppelten Päckchen: Bei uns kaufst du genau die Einzelsticker und Sammelkarten, die dir noch in deinem Album fehlen.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-white">Unsere Philosophie</h2>
          <div className="text-zinc-300 text-sm leading-relaxed space-y-4">
            <p>
              Wer kennt es nicht? Man kauft ein ganzes Display oder unzählige Booster, und am Ende fehlen immer noch die gleichen 10 Nummern, während sich hunderte doppelte Karten stapeln.
            </p>
            <p>
              Genau aus dieser Frustration heraus entstand <strong>WOS World of Stickers</strong> in Hamburg. Wir öffnen Displays und Booster von Hand, sortieren jede einzelne Nummer katalogisiert ein und lagern jedes Sammlerstück sofort geschützt in einer Hülle.
            </p>
            <p>
              So kannst du gezielt deine Lücken füllen – sei es für die Fußball-Bundesliga, die FIFA Weltmeisterschaft, Disney-Klassiker, One Piece, Pokémon oder die neuesten Star Wars Unlimited Editionen.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
            <div className="space-y-1">
              <span className="text-2xl font-black text-amber-400">100%</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Originalware</h3>
              <p className="text-xs text-zinc-400">Ausschließlich lizenzierte Produkte von Panini, Topps und Bandai.</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-emerald-400">1,00 €</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pauschalversand</h3>
              <p className="text-xs text-zinc-400">Knicksicher im Schutz-Sleeve direkt aus Hamburg nach DE &amp; EU.</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-sky-400">4.000+</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Einzelstücke</h3>
              <p className="text-xs text-zinc-400">Riesige Auswahl lagernd für dein Sammelalbum.</p>
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-black text-white">WOS auf Social Media &amp; Kontakt</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Folge unseren Booster-Openings und bleibe über neue Kollektionen informiert:
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://youtube.com/@worldofstickerstcg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-bold transition"
            >
              <Video className="w-4 h-4" /> YouTube Kanal
            </a>
            <a
              href="https://instagram.com/wos_world_of_sticker/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/10 border border-pink-500/30 text-pink-400 hover:bg-pink-600/20 text-xs font-bold transition"
            >
              <Camera className="w-4 h-4" /> Instagram
            </a>
            <a
              href="mailto:info@wosworldofstickers.de"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs font-bold transition"
            >
              <Mail className="w-4 h-4" /> info@wosworldofstickers.de
            </a>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
