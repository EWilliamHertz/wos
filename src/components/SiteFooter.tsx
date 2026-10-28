// src/components/SiteFooter.tsx
import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, ShieldCheck, Truck, PackageCheck } from 'lucide-react';

export default function SiteFooter() {
  return (
    <>
      {/* Collector Guarantees */}
      <section className="border-t border-zinc-800/80 bg-[#090b10] py-12">
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

      {/* Main Footer */}
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
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hover:text-amber-400 transition">
              FAQ &amp; Versandinfo
            </Link>
            <span>•</span>
            <Link href="/admin" className="text-amber-400 hover:underline font-semibold">
              Admin &amp; Vercel Blob Registry →
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
