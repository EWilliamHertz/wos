// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  UploadCloud,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  ArrowLeft,
  Image as ImageIcon,
  ShieldAlert,
} from 'lucide-react';
import type { Product } from '@/lib/catalog';

export default function AdminPortalPage() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string>('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await fetchCatalog(passcode);
    if (!ok) {
      setAuthError('Ungültiger Sicherheitscode!');
      return;
    }
    setAuthError('');
    setIsUnlocked(true);
  };

  // The passcode is verified by the server (ADMIN_PASSCODE in .env.local).
  const fetchCatalog = async (code: string): Promise<boolean> => {
    const res = await fetch('/api/blob', {
      headers: { 'x-admin-code': code },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.authorized) return false;
    setProducts(data.products || []);
    return true;
  };

  const handleSyncAllToVercelBlob = async () => {
    setIsSyncing(true);
    setStatusBanner('Lade alle Produktbilder in deinen Vercel Blob Store hoch...');
    try {
      const res = await fetch('/api/blob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-code': passcode,
        },
        body: JSON.stringify({ action: 'sync-all-to-blob' }),
      });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setStatusBanner(
          `✅ Alle ${data.products.length} Produktbilder wurden erfolgreich zu Vercel Blob hochgeladen und verknüpft!`
        );
      }
    } catch {
      setStatusBanner('❌ Fehler beim Synchronisieren mit Vercel Blob.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSingleFileUpload = async (productId: string, file: File) => {
    setUploadingId(productId);
    setStatusBanner(`Lade neues Bild für Produkt #${productId} zu Vercel Blob hoch...`);
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('file', file);

      const res = await fetch('/api/blob', {
        method: 'POST',
        headers: {
          'x-admin-code': passcode,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setStatusBanner(`✅ Neues Vercel Blob Bild gespeichert: ${data.blobUrl}`);
      }
    } catch {
      setStatusBanner('❌ Datei-Upload fehlgeschlagen.');
    } finally {
      setUploadingId(null);
    }
  };

  const copyBlobPath = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black">WOS Admin &amp; Vercel Blob</h1>
            <p className="text-xs text-slate-400">
              Geschützter Bereich für Produktbilder &amp; Vercel Blob Pfade.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Zugangscode eingeben
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Code eingeben"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition"
            >
              Admin-Portal entsperren
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-amber-400">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Unlock className="w-3.5 h-3.5" />
              <span>AUTHENTIFIZIERT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              WOS Produkte &amp; Vercel Blob Image Registry
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Zum Shop
            </Link>

            <button
              onClick={handleSyncAllToVercelBlob}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'Synchronisiere mit Vercel Blob...'
                  : 'Alle Produktbilder zu Vercel Blob synchronisieren'}
              </span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 font-medium">
            {statusBanner}
          </div>
        )}

        {/* Product Table with New Vercel Blob Image Paths */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Vorschau</th>
                  <th className="py-3.5 px-4">Produkt / Serie</th>
                  <th className="py-3.5 px-4">Preis / Typ</th>
                  <th className="py-3.5 px-4">Neuer Vercel Blob Bildpfad (URL)</th>
                  <th className="py-3.5 px-4 text-right">Neues Bild hochladen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <img
                        src={product.blobImageUrl}
                        alt={product.title}
                        className="w-14 h-20 object-contain bg-slate-950 border border-slate-800 rounded-lg p-1"
                      />
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-bold text-white text-sm">{product.title}</div>
                      <div className="text-slate-400">{product.series}</div>
                      <div className="text-[11px] font-mono text-amber-400">
                        ID: {product.id} • Nr. #{product.number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-white block">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="text-slate-400">{product.productType}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <input
                          type="text"
                          readOnly
                          value={product.blobImageUrl}
                          className="w-full bg-transparent text-[11px] font-mono text-emerald-300 outline-none"
                        />
                        <button
                          onClick={() => copyBlobPath(product.id, product.blobImageUrl)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Pfad kopieren"
                        >
                          {copiedId === product.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={product.blobImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                          title="Im Browser öffnen"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold cursor-pointer transition">
                        <UploadCloud className="w-4 h-4" />
                        <span>
                          {uploadingId === product.id ? 'Lädt hoch...' : 'Re-Upload zu Blob'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSingleFileUpload(product.id, file);
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}