// src/app/page.tsx
import React from 'react';
import { getProducts } from '@/lib/catalog.server';
import WosClientShell from '@/components/WosClientShell';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getProducts();
  return <WosClientShell initialProducts={products} />;
}