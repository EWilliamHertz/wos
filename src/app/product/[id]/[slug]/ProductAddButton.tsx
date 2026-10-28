// src/app/product/[id]/[slug]/ProductAddButton.tsx
'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatEur } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';

export default function ProductAddButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart(product, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full py-3.5 px-6 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg ${
        added
          ? 'bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
          : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20'
      }`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          <span>In den Warenkorb gelegt!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>{`In den Warenkorb (${formatEur(product.price)})`}</span>
        </>
      )}
    </button>
  );
}
