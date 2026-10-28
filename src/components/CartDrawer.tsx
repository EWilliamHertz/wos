// src/components/CartDrawer.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatEur } from '@/lib/catalog';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    shippingZone,
    setShippingZone,
    updateCartQty,
    totalItemsInCart,
    subtotal,
    shippingCost,
    total,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#090b10] border-l border-zinc-800 z-50 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{`Warenkorb (${totalItemsInCart})`}</h3>
                  <p className="text-xs text-zinc-400">
                    Knicksicher im Sleeve &amp; Toploader aus Hamburg
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm space-y-3">
                  <ShoppingBag className="w-8 h-8 mx-auto text-zinc-600" />
                  <p>Dein Warenkorb ist noch leer.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 bg-[#0e121a] border border-zinc-800/80 rounded-xl p-2.5"
                    >
                      <img
                        src={product.blobImageUrl}
                        alt={product.title}
                        className="w-12 h-16 object-contain bg-zinc-950 rounded-lg p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {`#${product.number} • ${formatEur(product.price)} / Stück`}
                        </div>
                        <div className="text-xs font-black text-amber-400 mt-0.5">
                          {formatEur(product.price * quantity)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, -1)}
                          className="p-1 hover:text-amber-400 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white font-mono">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, 1)}
                          className="p-1 hover:text-amber-400 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Checkout Footer */}
            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShippingZone('DE_EU')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    shippingZone === 'DE_EU'
                      ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                      : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  DE &amp; EU: 1,00 €
                </button>
                <button
                  type="button"
                  onClick={() => setShippingZone('WORLD')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    shippingZone === 'WORLD'
                      ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                      : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Weltweit: 5,00 €
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Zwischensumme</span>
                  <span>{formatEur(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Versand (Hamburg)</span>
                  <span>{formatEur(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-white font-black text-base pt-1">
                  <span>Gesamtbetrag</span>
                  <span className="text-amber-400">{formatEur(total)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() =>
                  alert(`Bestellung über ${formatEur(total)} bereit zur Zahlung!`)
                }
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
              >
                {`Zur Kasse (${formatEur(total)})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
