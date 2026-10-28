// src/app/faq/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  PackageCheck,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getCatalogSnapshot } from '@/lib/catalog.server';
import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'FAQ, Versand & Sammler-Garantie | WOS World of Stickers Hamburg',
  description:
    'Informationen zu 1,00 € Briefversand, knicksicherer Verpackung im Sleeve/Toploader, Bezahlung und Rückgaberecht bei WOS World of Stickers.',
};

export const dynamic = 'force-dynamic';

export default function FaqPage() {
  const { categoryCounts, totalCount } = getCatalogSnapshot();

  const faqs = [
    {
      q: 'Wie hoch sind die Versandkosten?',
      a: 'Egal wie viele Einzelsticker oder Sammelkarten du in einer Bestellung kombinierst: Du zahlst pauschal nur 1,00 € für den knicksicheren Briefversand innerhalb Deutschlands sowie in alle EU-Länder (sowie Kanada und Australien). Für den weltweiten Versand außerhalb der EU berechnen wir pauschal 5,00 €.',
    },
    {
      q: 'Wie werden Sticker und Sammelkarten verpackt?',
      a: 'Sammlerschutz steht bei uns an erster Stelle! Jeder Sticker wird in einer passgenauen Schutzhülle (Sleeve) verpackt. Trading Cards erhalten zusätzlich einen stabilen Hartplastik-Toploader. Der Versand erfolgt in einem verstärkten Umschlag mit Knickschutz-Karton, damit jede Karte im Zustand "Mint" bzw. "Sehr gut" bei dir ankommt.',
    },
    {
      q: 'Wie schnell wird meine Bestellung versendet?',
      a: 'Wir versenden deine Bestellung in der Regel innerhalb von 24 bis 48 Stunden nach Zahlungseingang direkt aus unserem Hamburger Lager. Die Zustellung per Deutscher Post dauert innerhalb Deutschlands meist 2 bis 3 Werktage.',
    },
    {
      q: 'Welche Zahlungsmethoden werden akzeptiert?',
      a: 'Du kannst bei uns bequem und sicher per PayPal, Kreditkarte (Visa, Mastercard, American Express), Apple Pay, Google Pay oder Sofortüberweisung via Mollie bezahlen.',
    },
    {
      q: 'Sind alle Sticker und Karten original?',
      a: 'Ja, zu 100%! Wir verkaufen ausschließlich originale Lizenzware von renommierten Herstellern wie Panini, Topps, Bandai und Disney. Alle Artikel werden von uns persönlich aus Original-Displays und Booster-Päckchen gezogen und auf Unversehrtheit geprüft.',
    },
    {
      q: 'Gibt es einen Mengenrabatt für lange Fehlstellen-Listen?',
      a: 'Ja! Wenn du eine umfangreiche Fehlstellenliste ab 20 Stickern oder Karten benötigst, sende uns deine Nummernliste gerne per E-Mail an info@wosworldofstickers.de. Wir prüfen deinen Bedarf und erstellen dir ein individuelles Komplettangebot.',
    },
    {
      q: 'Habe ich ein Rückgaberecht?',
      a: 'Selbstverständlich gilt für alle Bestellungen das gesetzliche 14-tägige Widerrufsrecht. Sollte ein Artikel wider Erwarten nicht deinen Erwartungen entsprechen, kannst du ihn unkompliziert an uns zurücksenden.',
    },
  ];

  return (
    <SiteShell totalProductsCount={totalCount} categoryCounts={categoryCounts}>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Versand &amp; Sammler-Service aus Hamburg</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            FAQ &amp; Versandinformationen
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            Hier erfährst du alles Wichtige über unseren schnellen 1,00 € Briefversand, die materialschonende Verpackung und unseren Service für Sammler.
          </p>
        </div>

        {/* 3 Key Guarantees Highlights */}
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">1,00 € Pauschale</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Knicksicherer Briefversand aus Hamburg für ganz Deutschland &amp; die Europäische Union.
            </p>
          </div>

          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Sleeve &amp; Toploader</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Jeder Sticker in Schutzhülle, Trading Cards zusätzlich im Toploader. Kein Knicken, keine Kratzer.
            </p>
          </div>

          <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">14 Tage Widerruf</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Volles gesetzliches Widerrufsrecht und persönlicher Kundenservice aus Hamburg.
            </p>
          </div>
        </div>

        {/* FAQ Accordion / Q&A Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white">Häufig gestellte Fragen (FAQ)</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#0c0f16] border border-zinc-800/80 rounded-2xl p-6 space-y-2"
              >
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2.5">
                  <span className="text-amber-400 font-mono text-xs">0{i + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Impressum Box */}
        <div className="bg-[#0c0f16] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-black text-white">Noch Fragen oder spezielle Suchlisten?</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Du suchst eine bestimmte Rarität, die aktuell nicht im Online-Shop aufgeführt ist? Kontaktiere uns direkt:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-[#06070a] border border-zinc-800 rounded-xl p-4 space-y-1">
              <span className="text-zinc-500 font-bold uppercase tracking-wider block">Anschrift</span>
              <div className="flex items-center gap-2 text-white font-medium">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WOS World of Stickers, Sonninstr. 18e, 20097 Hamburg</span>
              </div>
            </div>

            <div className="bg-[#06070a] border border-zinc-800 rounded-xl p-4 space-y-1">
              <span className="text-zinc-500 font-bold uppercase tracking-wider block">E-Mail Kontakt</span>
              <div className="flex items-center gap-2 text-white font-medium">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:info@wosworldofstickers.de" className="text-amber-400 hover:underline">
                  info@wosworldofstickers.de
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
