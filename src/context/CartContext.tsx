// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/lib/catalog';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  shippingZone: 'DE_EU' | 'WORLD';
  setShippingZone: (zone: 'DE_EU' | 'WORLD') => void;
  addToCart: (product: Product, openDrawer?: boolean) => void;
  addMultipleToCart: (products: Product[]) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItemsInCart: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  mounted: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'wos_collector_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingZone, setShippingZone] = useState<'DE_EU' | 'WORLD'>('DE_EU');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // ignore storage error
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage error
    }
  }, [cart, mounted]);

  const addToCart = (product: Product, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    if (openDrawer) setIsCartOpen(true);
  };

  const addMultipleToCart = (products: Product[]) => {
    if (!products.length) return;
    setCart((prev) => {
      const map = new Map(prev.map((i) => [i.product.id, i]));
      for (const p of products) {
        const existing = map.get(p.id);
        if (existing) {
          map.set(p.id, { ...existing, quantity: existing.quantity + 1 });
        } else {
          map.set(p.id, { product: p, quantity: 1 });
        }
      }
      return Array.from(map.values());
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalItemsInCart = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = cart.length === 0 ? 0 : shippingZone === 'DE_EU' ? 1.0 : 5.0;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        shippingZone,
        setShippingZone,
        addToCart,
        addMultipleToCart,
        updateCartQty,
        clearCart,
        totalItemsInCart,
        subtotal,
        shippingCost,
        total,
        mounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
