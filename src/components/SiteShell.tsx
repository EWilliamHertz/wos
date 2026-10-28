// src/components/SiteShell.tsx
'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import SiteHeader from './SiteHeader';
import CartDrawer from './CartDrawer';
import SiteFooter from './SiteFooter';
import { DEFAULT_CATEGORY_COUNTS, type CategoryCounts } from '@/lib/categories';

export default function SiteShell({
  children,
  totalProductsCount,
  categoryCounts = DEFAULT_CATEGORY_COUNTS,
}: {
  children: React.ReactNode;
  totalProductsCount?: number;
  categoryCounts?: CategoryCounts;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
        <SiteHeader totalProductsCount={totalProductsCount} categoryCounts={categoryCounts} />
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
