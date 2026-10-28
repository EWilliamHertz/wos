// scripts/sync-to-vercel-blob.ts
import { put } from '@vercel/blob';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Secrets come from .env.local (git-ignored). There are no fallback values on purpose.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export interface WosProduct {
  id: string;
  slug: string;
  number: string;
  title: string;
  manufacturer: 'Panini' | 'Topps' | 'Netflix' | 'Disney / StarWars.com' | 'Bandai';
  productType: 'Sticker' | 'Tradingcard';
  series: string;
  category: string;
  condition: string;
  price: number;
  stock: number;
  originalSourceUrl: string;
  blobImageUrl: string;
  updatedAt: string;
}

const INITIAL_WOS_CATALOG: Omit<WosProduct, 'blobImageUrl' | 'updatedAt'>[] = [
  {
    id: '24492780',
    slug: 'nr-50-stitch-angel',
    number: '50',
    title: 'Nr.50 Stitch & Angel',
    manufacturer: 'Panini',
    productType: 'Sticker',
    series: 'Disney Stitch & Angel 2026',
    category: 'Panini Stitch Scrap Book 2026',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 0.90,
    stock: 4,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/24492780/nr-50-stitch-angel',
  },
  {
    id: '23730826',
    slug: 'ksa19-saleh-alsheri',
    number: 'KSA19',
    title: 'KSA19 Saleh Alsheri',
    manufacturer: 'Panini',
    productType: 'Sticker',
    series: 'Panini FIFA World Cup WM 2026',
    category: 'Panini FIFA World Cup WM 2026',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 0.85,
    stock: 6,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23730826/ksa19-saleh-alsheri',
  },
  {
    id: '23268921',
    slug: 'nr-15-one-piece-netflix',
    number: '15',
    title: 'Nr.15 One Piece - Netflix',
    manufacturer: 'Netflix',
    productType: 'Sticker',
    series: 'Netflix One Piece Official Sticker 2026',
    category: 'One Piece Tradingcards & Sticker',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.00,
    stock: 3,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23268921/nr-15-one-piece-netflix',
  },
  {
    id: '23911439',
    slug: 'nr-30-one-piece-netflix',
    number: '30',
    title: 'Nr.30 One Piece - Netflix',
    manufacturer: 'Netflix',
    productType: 'Sticker',
    series: 'Netflix One Piece Official Sticker 2026',
    category: 'One Piece Tradingcards & Sticker',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.00,
    stock: 5,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23911439/nr-30-one-piece-netflix',
  },
  {
    id: '23268955',
    slug: 'nr-41-one-piece-netflix',
    number: '41',
    title: 'Nr.41 One Piece - Netflix',
    manufacturer: 'Netflix',
    productType: 'Sticker',
    series: 'Netflix One Piece Official Sticker 2026',
    category: 'One Piece Tradingcards & Sticker',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.00,
    stock: 2,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23268955/nr-41-one-piece-netflix',
  },
  {
    id: '24512836',
    slug: 'nr-108-robert-andrich',
    number: '108',
    title: 'Nr.108 Robert Andrich',
    manufacturer: 'Topps',
    productType: 'Sticker',
    series: 'Topps Champions League 2025/26',
    category: 'Topps Champions League 2026/27',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 0.95,
    stock: 7,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/24512836/nr-108-robert-andrich',
  },
  {
    id: '23355508',
    slug: 'nr-167-jamie-gittens',
    number: '167',
    title: 'Nr.167 Jamie Gittens',
    manufacturer: 'Topps',
    productType: 'Sticker',
    series: 'Topps Champions League 2025/26',
    category: 'Topps Champions League 2026/27',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.20,
    stock: 4,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23355508/nr-167-jamie-gittens',
  },
  {
    id: '23083212',
    slug: 'nr-540-isak-hien',
    number: '540',
    title: 'Nr.540 Isak Hien',
    manufacturer: 'Panini',
    productType: 'Tradingcard',
    series: 'Panini Adrenalyn XL Fifa 365 2026/27 Golden Elite',
    category: 'Panini Adrenalyn XL Fifa 365 2026/27 Golden Elite',
    condition: 'Sehr gut (Mint) - Im Sleeve & Toploader',
    price: 1.50,
    stock: 3,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23083212/nr-540-isak-hien',
  },
  {
    id: '24098428',
    slug: 'nr-110-abwehrgeschwader-der-stockkolonie',
    number: '110',
    title: 'Nr.110 Abwehrgeschwader der Stockkolonie',
    manufacturer: 'Disney / StarWars.com',
    productType: 'Tradingcard',
    series: 'Star Wars Unlimited Legenden der Macht',
    category: 'Star Wars Unlimited Legenden der Macht',
    condition: 'Sehr gut (Mint) - Im Sleeve & Toploader',
    price: 1.80,
    stock: 2,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/24098428/nr-110-abwehrgeschwader-der-stockkolonie',
  },
  {
    id: '23485545',
    slug: 'nr-166-evan-ferguson',
    number: '166',
    title: 'Nr.166 Evan Ferguson',
    manufacturer: 'Panini',
    productType: 'Sticker',
    series: 'Panini Premier League 2025/26',
    category: 'Topps Premier League 2026/27',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 0.90,
    stock: 5,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23485545/nr-166-evan-ferguson',
  },
  {
    id: '23795373',
    slug: 'nr-166-pat-freiermuth',
    number: '166-NFL',
    title: 'Nr.166 Pat Freiermuth',
    manufacturer: 'Panini',
    productType: 'Sticker',
    series: 'Panini NFL Collection Sticker & Card',
    category: 'Topps Chrome NBA 2025 & US Sports',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.10,
    stock: 4,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/23795373/nr-166-pat-freiermuth',
  },
  {
    id: '22951650',
    slug: 'nr-1-panini-donald-duck',
    number: '1',
    title: 'Nr.1 Panini Donald Duck 90 Jahre',
    manufacturer: 'Panini',
    productType: 'Sticker',
    series: 'Panini Donald Duck 90 Jahre',
    category: 'Panini Donald Duck 90 Jahre',
    condition: 'Sehr gut (Mint) - Handgeprüft in Schutzhülle',
    price: 1.25,
    stock: 3,
    originalSourceUrl: 'https://www.wosworldofstickers.de/product/22951650/nr-1-panini',
  },
];

function createHighResCardSvg(product: Omit<WosProduct, 'blobImageUrl' | 'updatedAt'>): Buffer {
  const accentColor =
    product.productType === 'Tradingcard' ? '#f59e0b' : '#38bdf8';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" rx="36" fill="url(#bg)"/>
    <rect x="20" y="20" width="560" height="760" rx="28" fill="none" stroke="url(#foil)" stroke-width="4"/>
    <rect x="44" y="44" width="512" height="50" rx="12" fill="#1e293b"/>
    <text x="68" y="76" fill="#f8fafc" font-family="sans-serif" font-size="20" font-weight="bold">${product.manufacturer.toUpperCase()} • ${product.productType.toUpperCase()}</text>
    <text x="532" y="76" fill="${accentColor}" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="end">#${product.number}</text>
    <circle cx="300" cy="330" r="145" fill="#0f172a" stroke="url(#foil)" stroke-width="3"/>
    <text x="300" y="315" fill="${accentColor}" font-family="sans-serif" font-size="68" font-weight="900" text-anchor="middle">#${product.number}</text>
    <text x="300" y="365" fill="#94a3b8" font-family="sans-serif" font-size="18" font-weight="600" text-anchor="middle">WOS ORIGINAL SLEEVED</text>
    <text x="300" y="560" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="800" text-anchor="middle">${product.title.replace(/&/g, '&amp;')}</text>
    <text x="300" y="605" fill="#cbd5e1" font-family="sans-serif" font-size="18" text-anchor="middle">${product.series.replace(/&/g, '&amp;')}</text>
    <rect x="130" y="660" width="340" height="54" rx="27" fill="url(#foil)"/>
    <text x="300" y="694" fill="#090d16" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle">WOS WORLD OF STICKERS</text>
  </svg>`;
  return Buffer.from(svg, 'utf-8');
}

async function fetchLiveProductImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WOS-Blob-Migrator/1.0)',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('img.product-image, .jw-product-image img, article img').first().attr('src');

    if (!ogImage) return null;

    const resolvedImgUrl = ogImage.startsWith('http')
      ? ogImage
      : new URL(ogImage, 'https://www.wosworldofstickers.de').toString();

    const imgRes = await fetch(resolvedImgUrl);
    if (!imgRes.ok) return null;

    const arrayBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    };
  } catch {
    return null;
  }
}

async function runMigration() {
  console.log('🚀 Starting WOS World of Stickers -> Vercel Blob Image Migration...');
  const finalCatalog: WosProduct[] = [];

  for (const item of INITIAL_WOS_CATALOG) {
    console.log(`\n🔍 Processing [${item.id}] ${item.title}...`);
    const scraped = await fetchLiveProductImageBuffer(item.originalSourceUrl);

    let uploadBuffer: Buffer;
    let contentType: string;
    let extension: string;

    if (scraped) {
      console.log(`   ✅ Downloaded live product photo from ${item.originalSourceUrl}`);
      uploadBuffer = scraped.buffer;
      contentType = scraped.contentType;
      extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    } else {
      console.log(`   🎨 Generating high-resolution collector sleeve graphic for ${item.title}`);
      uploadBuffer = createHighResCardSvg(item);
      contentType = 'image/svg+xml';
      extension = 'svg';
    }

    const blobPath = `wos-products/${item.id}-${item.slug}.${extension}`;

    const blob = await put(blobPath, uploadBuffer, {
      access: 'public',
      token: BLOB_TOKEN,
      contentType,
      addRandomSuffix: false,
    });

    console.log(`   ☁️ Uploaded to Vercel Blob: ${blob.url}`);

    finalCatalog.push({
      ...item,
      blobImageUrl: blob.url,
      updatedAt: new Date().toISOString(),
    });
  }

  const outDir = path.join(process.cwd(), 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'products.json');
  fs.writeFileSync(outFile, JSON.stringify(finalCatalog, null, 2), 'utf-8');

  console.log(`\n🎉 Migration complete! ${finalCatalog.length} products written to src/data/products.json`);
}

runMigration().catch((err) => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});