// src/lib/catalog.server.ts
import fs from 'fs';
import path from 'path';
import type { Product } from './catalog';

const PRODUCTS_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');
const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'image-manifest.json');

function resolveUrlString(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    for (const key of ['blobUrl', 'blobImageUrl', 'url', 'src', 'image']) {
      if (typeof obj[key] === 'string' && obj[key]) {
        return obj[key] as string;
      }
    }
  }
  return '';
}

export function getProducts(): Product[] {
  try {
    const manifest: Record<string, string> = {};
    if (fs.existsSync(MANIFEST_PATH)) {
      const rawManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Record<
        string,
        unknown
      >;
      for (const [k, v] of Object.entries(rawManifest)) {
        const url = resolveUrlString(v);
        if (url) manifest[k] = url;
      }
    }

    if (fs.existsSync(PRODUCTS_PATH)) {
      const raw = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8')) as Product[];
      return raw.map((item) => ({
        ...item,
        price: typeof item.price === 'number' && item.price > 0 ? item.price : 1.0,
        blobImageUrl:
          manifest[item.id] ||
          resolveUrlString(item.blobImageUrl) ||
          resolveUrlString(item.originalImageUrl) ||
          '',
      }));
    }
  } catch (err) {
    console.error('Error loading products.json:', err);
  }
  return [];
}

export function saveProducts(products: Product[]): void {
  fs.mkdirSync(path.dirname(PRODUCTS_PATH), { recursive: true });
  const tmpPath = `${PRODUCTS_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(products, null, 2), 'utf-8');
  fs.renameSync(tmpPath, PRODUCTS_PATH);
}