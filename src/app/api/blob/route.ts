// src/app/api/blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import type { Product } from '@/lib/catalog';
import { getProducts, saveProducts } from '@/lib/catalog.server';

// Secrets come from .env.local (git-ignored). There are no fallback values on purpose.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const ADMIN_CODE = process.env.ADMIN_PASSCODE;

export async function GET(req: NextRequest) {
  const code = req.headers.get('x-admin-code');
  const products = getProducts();

  if (ADMIN_CODE && code === ADMIN_CODE) {
    try {
      const blobs = await list({ token: BLOB_TOKEN, prefix: 'wos-products/' });
      return NextResponse.json({ authorized: true, products, blobs: blobs.blobs });
    } catch {
      return NextResponse.json({ authorized: true, products, blobs: [] });
    }
  }

  return NextResponse.json({ authorized: false, products });
}

export async function POST(req: NextRequest) {
  const code = req.headers.get('x-admin-code');
  if (!ADMIN_CODE || code !== ADMIN_CODE) {
    return NextResponse.json({ error: 'Unauthorized: Invalid Code' }, { status: 401 });
  }

  const contentTypeHeader = req.headers.get('content-type') || '';

  // Case 1: Multipart file upload for a single product image
  if (contentTypeHeader.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 });
    }

    const blobPath = `wos-products/${productId}-${file.name.replace(/\s+/g, '-')}`;
    const blob = await put(blobPath, file, {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
    });

    const products = getProducts();
    const updatedProducts = products.map((p) =>
      p.id === productId
        ? { ...p, blobImageUrl: blob.url, updatedAt: new Date().toISOString() }
        : p
    );
    saveProducts(updatedProducts);

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      products: updatedProducts,
    });
  }

  // Case 2: JSON body action (sync all images to Vercel Blob or add/update product)
  const body = await req.json();

  if (body.action === 'sync-all-to-blob') {
    const products = getProducts();
    const updated: Product[] = [];

    for (const product of products) {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
        <rect width="600" height="800" rx="36" fill="#090d16"/>
        <rect x="20" y="20" width="560" height="760" rx="28" fill="none" stroke="#f59e0b" stroke-width="4"/>
        <text x="65" y="76" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="bold">${product.manufacturer} • ${product.productType}</text>
        <circle cx="300" cy="330" r="140" fill="#111827" stroke="#f59e0b" stroke-width="3"/>
        <text x="300" y="345" fill="#f59e0b" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle">#${product.number}</text>
        <text x="300" y="555" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="800" text-anchor="middle">${product.title.replace(/&/g, '&amp;')}</text>
        <text x="300" y="600" fill="#94a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">${product.series.replace(/&/g, '&amp;')}</text>
        <rect x="130" y="660" width="340" height="52" rx="26" fill="#f59e0b"/>
        <text x="300" y="693" fill="#090d16" font-family="sans-serif" font-size="19" font-weight="900" text-anchor="middle">WOS WORLD OF STICKERS</text>
      </svg>`;

      const blob = await put(
        `wos-products/${product.id}-${product.slug}.svg`,
        Buffer.from(svgContent, 'utf-8'),
        {
          access: 'public',
          token: BLOB_TOKEN,
          contentType: 'image/svg+xml',
          addRandomSuffix: false,
        }
      );

      updated.push({
        ...product,
        blobImageUrl: blob.url,
        updatedAt: new Date().toISOString(),
      });
    }

    saveProducts(updated);
    return NextResponse.json({ success: true, products: updated });
  }

  if (body.action === 'update-product' && body.product) {
    const products = getProducts();
    const exists = products.some((p) => p.id === body.product.id);
    const nextProducts = exists
      ? products.map((p) => (p.id === body.product.id ? body.product : p))
      : [body.product, ...products];
    saveProducts(nextProducts);
    return NextResponse.json({ success: true, products: nextProducts });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}