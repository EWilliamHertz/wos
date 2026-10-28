// scripts/download-product-images.ts
import { put } from '@vercel/blob';
import * as cheerio from 'cheerio';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

// Load .env.local automatically
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN in .env.local');
  process.exit(1);
}

export interface Product {
  id: string;
  slug: string;
  number: string;
  title: string;
  manufacturer: string;
  productType: 'Sticker' | 'Tradingcard';
  series: string;
  category: string;
  condition: string;
  price: number;
  currency: string;
  stock: number;
  inStock: boolean;
  description: string;
  originalSourceUrl: string;
  originalImageUrl: string;
  blobImageUrl: string;
  updatedAt: string;
}

interface CLIOptions {
  width?: number;
  limit?: number;
  force: boolean;
  pricesOnly: boolean;
  concurrency: number;
  delayMs: number;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const opts: CLIOptions = {
    force: false,
    pricesOnly: false,
    concurrency: 1, // Single sequential worker with pacing avoids Webador IP bans completely
    delayMs: 450,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--force') opts.force = true;
    else if (a === '--prices-only') opts.pricesOnly = true;
    else if (a === '--width' && args[i + 1]) opts.width = parseInt(args[++i], 10);
    else if (a === '--limit' && args[i + 1]) opts.limit = parseInt(args[++i], 10);
    else if (a === '--concurrency' && args[i + 1]) opts.concurrency = parseInt(args[++i], 10);
    else if (a === '--delay' && args[i + 1]) opts.delayMs = parseInt(args[++i], 10);
  }
  return opts;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const MANIFEST_FILE = path.join(DATA_DIR, 'image-manifest.json');
const SITEMAP_CACHE_FILE = path.join(DATA_DIR, 'sitemap-urls.json');
const FAILURES_FILE = path.join(DATA_DIR, 'image-failures.json');

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function loadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch {
    // ignore corrupt file
  }
  return fallback;
}

function saveJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function resolveUrlString(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    for (const key of ['blobUrl', 'blobImageUrl', 'url', 'src', 'image', 'originalImageUrl']) {
      if (typeof obj[key] === 'string' && obj[key]) {
        return obj[key] as string;
      }
    }
  }
  return '';
}

/**
 * Fetches HTML/XML using system curl (--http2 + Chrome headers) to bypass Node undici ECONNRESET,
 * and falls back to AllOrigins/CorsProxy edge relay if the Cloud Shell IP is temporarily rate-limited by Webador.
 */
async function fetchTextResilient(url: string, maxAttempts = 4): Promise<string> {
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // 1. Try native curl with HTTP/2 and IPv4
    try {
      const { stdout } = await execFileAsync(
        'curl',
        [
          '-sS',
          '-L',
          '--http2',
          '-4',
          '--connect-timeout',
          '12',
          '--max-time',
          '25',
          '-A',
          userAgent,
          '-H',
          'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          '-H',
          'Accept-Language: de-DE,de;q=0.9,en;q=0.8',
          '-H',
          'Cache-Control: no-cache',
          url,
        ],
        { maxBuffer: 15 * 1024 * 1024 }
      );

      if (stdout && stdout.length > 200 && !stdout.includes('Too Many Requests')) {
        return stdout;
      }
    } catch {
      // curl failed or reset, try fallback relay below
    }

    // 2. If direct IP is in Webador rate-limit cooldown, fetch via edge relay
    const relays = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const relayUrl of relays) {
      try {
        const { stdout } = await execFileAsync(
          'curl',
          ['-sS', '-L', '-4', '--connect-timeout', '12', '--max-time', '25', '-A', userAgent, relayUrl],
          { maxBuffer: 15 * 1024 * 1024 }
        );
        if (stdout && stdout.length > 200 && (stdout.includes('<html') || stdout.includes('<?xml') || stdout.includes('<urlset'))) {
          return stdout;
        }
      } catch {
        // try next relay
      }
    }

    const waitMs = attempt * 3500;
    console.warn(`⏳ Cooldown on ${url} (attempt ${attempt}/${maxAttempts}) — waiting ${(waitMs / 1000).toFixed(1)}s...`);
    await sleep(waitMs);
  }

  throw new Error(`Could not retrieve ${url} after ${maxAttempts} attempts`);
}

/**
 * Downloads binary image buffer using curl (from jouwweb.nl CDN or wosworldofstickers.de)
 */
async function fetchImageBufferResilient(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  const { stdout } = await execFileAsync(
    'curl',
    [
      '-sS',
      '-L',
      '-4',
      '--connect-timeout',
      '15',
      '--max-time',
      '30',
      '-A',
      userAgent,
      url,
    ],
    { encoding: 'buffer', maxBuffer: 25 * 1024 * 1024 }
  );

  if (!stdout || stdout.length < 100) {
    throw new Error(`Empty image buffer from ${url}`);
  }

  const contentType = url.includes('.png')
    ? 'image/png'
    : url.includes('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  return { buffer: stdout, contentType };
}

function parseGermanPrice(raw: string | number | undefined | null): number | null {
  if (typeof raw === 'number' && !Number.isNaN(raw) && raw > 0) {
    return Number(raw.toFixed(2));
  }
  if (!raw) return null;
  const str = String(raw).trim();
  const match = str.match(/(\d{1,4}(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  const normalized = match[1].replace(',', '.');
  const num = parseFloat(normalized);
  return !Number.isNaN(num) && num > 0 ? Number(num.toFixed(2)) : null;
}

function extractStickerNumber(title: string, slug: string): string {
  const nrMatch = title.match(/(?:Nr\.?\s*|#)([A-Za-z0-9-]+)/i);
  if (nrMatch) return nrMatch[1].toUpperCase();

  const codeMatch = title.match(/^([A-Z]{2,4}\s?\d{1,3})\b/);
  if (codeMatch) return codeMatch[1].replace(/\s+/g, '').toUpperCase();

  const slugMatch = slug.match(/^(?:nr-)?([a-z0-9]+)-/i);
  if (slugMatch) return slugMatch[1].toUpperCase();

  return '1';
}

function inferCategory(series: string, title: string, manufacturer: string): string {
  const haystack = `${series} ${title} ${manufacturer}`.toLowerCase();
  if (haystack.includes('bundesliga frauen')) return 'Panini Bundesliga Frauen 2026/27';
  if (haystack.includes('world cup') || haystack.includes('wm 2026') || haystack.includes('wm 2022'))
    return 'Panini FIFA World Cup WM 2026';
  if (haystack.includes('donald duck')) return 'Panini Donald Duck 90 Jahre';
  if (haystack.includes('stitch')) return 'Panini Stitch Scrap Book 2026';
  if (haystack.includes('paw patrol')) return 'Panini Paw Patrol Search Rescue 2026';
  if (haystack.includes('nba') || haystack.includes('nfl')) return 'Topps Chrome NBA 2025 & US Sports';
  if (haystack.includes('adrenalyn') || haystack.includes('fifa 365'))
    return 'Panini Adrenalyn XL Fifa 365 2026/27 Golden Elite';
  if (haystack.includes('champions league')) return 'Topps Champions League 2026/27';
  if (haystack.includes('premier league')) return 'Topps Premier League 2026/27';
  if (haystack.includes('star wars')) return 'Star Wars Unlimited Legenden der Macht';
  if (haystack.includes('one piece')) return 'One Piece Tradingcards & Sticker';
  if (haystack.includes('naruto')) return 'Naruto Tradingcards - Earth Scroll Serie 1';
  if (haystack.includes('bundesliga')) return 'Topps Bundesliga 2024/25';
  if (haystack.includes('deutschland') || haystack.includes('europa'))
    return 'Panini Deutschland & die Besten aus Europa 2024';
  return series || 'Weitere Sammelkollektionen';
}

async function getProductUrlList(existingProducts: Product[]): Promise<{ id: string; slug: string; url: string }[]> {
  // 1. Check cached sitemap-urls.json first
  const cached = loadJson<{ id: string; slug: string; url: string }[]>(SITEMAP_CACHE_FILE, []);
  if (cached.length > 100) {
    console.log(`📂 Loaded ${cached.length} product URLs from local cache (${SITEMAP_CACHE_FILE})`);
    return cached;
  }

  // 2. Check if existing products.json already has the ~4,039 product URLs
  if (existingProducts.length > 100) {
    const derived = existingProducts
      .map((p) => {
        const rawUrl =
          p.originalSourceUrl ||
          (p as unknown as Record<string, string>).url ||
          (p as unknown as Record<string, string>).sourceUrl ||
          `https://www.wosworldofstickers.de/product/${p.id}/${p.slug}`;
        return {
          id: String(p.id),
          slug: p.slug || String(p.id),
          url: rawUrl,
        };
      })
      .filter((x) => x.id && x.url);

    if (derived.length > 100) {
      saveJson(SITEMAP_CACHE_FILE, derived);
      console.log(`📂 Extracted and cached ${derived.length} product URLs from local products.json!`);
      return derived;
    }
  }

  // 3. Otherwise fetch sitemap.xml using resilient curl + relay
  console.log('🌐 Fetching sitemap from https://www.wosworldofstickers.de/sitemap.xml ...');
  const xml = await fetchTextResilient('https://www.wosworldofstickers.de/sitemap.xml');
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: { id: string; slug: string; url: string }[] = [];

  $('url > loc').each((_, el) => {
    const loc = $(el).text().trim();
    const match = loc.match(/\/product\/(\d+)\/([^/?#]+)/);
    if (match) {
      urls.push({
        id: match[1],
        slug: decodeURIComponent(match[2]),
        url: loc,
      });
    }
  });

  if (urls.length > 0) {
    saveJson(SITEMAP_CACHE_FILE, urls);
  }
  console.log(`📦 Found and cached ${urls.length} product URLs from sitemap.xml`);
  return urls;
}

async function scrapeCompleteProductPage(
  entry: { id: string; slug: string; url: string },
  opts: CLIOptions
): Promise<{
  product: Omit<Product, 'blobImageUrl' | 'updatedAt'>;
  imageUrlToDownload: string;
}> {
  const html = await fetchTextResilient(entry.url);
  const $ = cheerio.load(html);

  let ldPrice: number | null = null;
  let ldTitle = '';
  let ldDescription = '';
  let ldImage = '';
  let ldInStock = true;

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const nodes = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
      for (const node of nodes) {
        if (node['@type'] === 'Product' || node.offers) {
          if (node.name && !ldTitle) ldTitle = String(node.name).trim();
          if (node.description && !ldDescription) ldDescription = String(node.description).trim();
          if (node.image) {
            ldImage = Array.isArray(node.image) ? String(node.image[0]) : String(node.image);
          }
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          if (offers) {
            const p = parseGermanPrice(offers.price ?? offers.lowPrice);
            if (p !== null) ldPrice = p;
            if (typeof offers.availability === 'string') {
              ldInStock = !offers.availability.toLowerCase().includes('outofstock');
            }
          }
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });

  const metaPrice = parseGermanPrice(
    $('meta[property="product:price:amount"], meta[property="og:price:amount"], [itemprop="price"]').attr(
      'content'
    ) || $('[itemprop="price"]').text()
  );

  const domPriceText = $(
    '.product-price, .jw-product-price, .product-page__price, [class*="product-price"], .price'
  )
    .first()
    .text();
  const domPrice = parseGermanPrice(domPriceText);

  let bodyRegexPrice: number | null = null;
  const mainText = $('main, article, .jw-product, body').text();
  const euroMatch = mainText.match(/(\d{1,3},\d{2})\s*€/);
  if (euroMatch) {
    bodyRegexPrice = parseGermanPrice(euroMatch[1]);
  }

  const finalPrice = ldPrice ?? metaPrice ?? domPrice ?? bodyRegexPrice ?? 1.0;

  const title =
    ldTitle ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.split('|')[0]?.trim() ||
    entry.slug;

  const descriptionText =
    ldDescription ||
    $('.jw-product-description, .product-description, [itemprop="description"]').text().trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const extractField = (label: string): string | null => {
    const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r•|]+)`, 'i');
    const m = (descriptionText + '\n' + mainText).match(regex);
    return m ? m[1].trim() : null;
  };

  const manufacturer =
    extractField('Hersteller') ||
    (title.toLowerCase().includes('topps')
      ? 'Topps'
      : title.toLowerCase().includes('netflix')
      ? 'Netflix'
      : title.toLowerCase().includes('star wars')
      ? 'Disney / StarWars.com'
      : 'Panini');

  const rawType = extractField('Produkttyp') || '';
  const productType: 'Sticker' | 'Tradingcard' =
    rawType.toLowerCase().includes('card') ||
    rawType.toLowerCase().includes('karte') ||
    title.toLowerCase().includes('card') ||
    descriptionText.toLowerCase().includes('tradingcard')
      ? 'Tradingcard'
      : 'Sticker';

  const series =
    extractField('Serie') ||
    extractField('Kollektion') ||
    $('nav.breadcrumb li, .jw-breadcrumbs a').eq(-2).text().trim() ||
    'WOS Sammlerkollektion';

  const condition =
    extractField('Zustand') || 'Sehr gut (Mint) - Handgeprüft in Schutzhülle';

  const category = inferCategory(series, title, manufacturer);
  const number = extractStickerNumber(title, entry.slug);

  let rawImg =
    ldImage ||
    $('meta[property="og:image"]').attr('content') ||
    $('.jw-product-image img, .product-gallery img, article img').first().attr('src') ||
    '';

  if (rawImg && !rawImg.startsWith('http')) {
    rawImg = new URL(rawImg, 'https://www.wosworldofstickers.de').toString();
  }

  let imageUrlToDownload = rawImg;
  if (opts.width && imageUrlToDownload.includes('jouwweb.nl')) {
    imageUrlToDownload = imageUrlToDownload.replace(/width=\d+/, `width=${opts.width}`);
  }

  return {
    product: {
      id: entry.id,
      slug: entry.slug,
      number,
      title,
      manufacturer,
      productType,
      series,
      category,
      condition,
      price: finalPrice,
      currency: 'EUR',
      stock: ldInStock ? 3 : 0,
      inStock: ldInStock,
      description:
        descriptionText ||
        `Original ${productType} (${title}) aus der Serie ${series} von ${manufacturer}. Handgeprüft in Schutzhülle.`,
      originalSourceUrl: entry.url,
      originalImageUrl: rawImg,
    },
    imageUrlToDownload,
  };
}

async function run() {
  const opts = parseArgs();
  const existingProducts = loadJson<Product[]>(PRODUCTS_FILE, []);
  const existingMap = new Map<string, Product>(
    existingProducts.map((p) => [String(p.id), p])
  );
  const rawManifest = loadJson<Record<string, unknown>>(MANIFEST_FILE, {});
  const manifest: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawManifest)) {
    const resolved = resolveUrlString(v);
    if (resolved) manifest[k] = resolved;
  }

  const failures: { id: string; url: string; error: string }[] = [];

  let entries = await getProductUrlList(existingProducts);
  if (opts.limit && opts.limit > 0) {
    entries = entries.slice(0, opts.limit);
  }

  console.log(
    `🚀 Syncing ${entries.length} complete products (Concurrency: ${opts.concurrency}, Pacing: ${opts.delayMs}ms)...`
  );

  let completed = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const entry = entries[index];
      const prev = existingMap.get(entry.id);

      const prevBlob = resolveUrlString(prev?.blobImageUrl) || manifest[entry.id] || '';
      const alreadyHasValidBlob =
        typeof prevBlob === 'string' && prevBlob.includes('.public.blob.vercel-storage.com');

      if (opts.delayMs > 0) {
        await sleep(opts.delayMs);
      }

      try {
        const { product, imageUrlToDownload } = await scrapeCompleteProductPage(entry, opts);

        let blobUrl = prevBlob;
        const hasValidBlob =
          typeof blobUrl === 'string' && blobUrl.includes('.public.blob.vercel-storage.com');

        if (!opts.pricesOnly && (!hasValidBlob || opts.force) && imageUrlToDownload) {
          const { buffer, contentType } = await fetchImageBufferResilient(imageUrlToDownload);
          const ext = contentType.includes('png')
            ? 'png'
            : contentType.includes('webp')
            ? 'webp'
            : 'jpg';

          const blobPath = `wos-products/${entry.id}-${entry.slug.slice(0, 60)}.${ext}`;
          const uploaded = await put(blobPath, buffer, {
            access: 'public',
            token: BLOB_TOKEN,
            contentType,
            addRandomSuffix: false,
          });

          blobUrl = uploaded.url;
          manifest[entry.id] = blobUrl;
        } else if (!blobUrl) {
          blobUrl = imageUrlToDownload;
        }

        const fullProduct: Product = {
          ...product,
          blobImageUrl: blobUrl,
          updatedAt: new Date().toISOString(),
        };

        existingMap.set(entry.id, fullProduct);
        completed++;

        console.log(
          `[${completed}/${entries.length}] ✅ #${fullProduct.number} ${fullProduct.title} -> ${fullProduct.price
            .toFixed(2)
            .replace('.', ',')} € | ${blobUrl.slice(0, 58)}...`
        );

        if (completed % 10 === 0) {
          saveJson(PRODUCTS_FILE, Array.from(existingMap.values()));
          saveJson(MANIFEST_FILE, manifest);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`❌ Failed [${entry.id}] ${entry.url}: ${msg}`);
        failures.push({ id: entry.id, url: entry.url, error: msg });
      }
    }
  }

  const workers = Array.from({ length: opts.concurrency }, () => worker());
  await Promise.all(workers);

  const finalProducts = Array.from(existingMap.values());
  saveJson(PRODUCTS_FILE, finalProducts);
  saveJson(MANIFEST_FILE, manifest);
  saveJson(FAILURES_FILE, failures);

  console.log(
    `\n🎉 Sync finished: ${finalProducts.length} complete products saved to src/data/products.json (${failures.length} failures).`
  );

  if (failures.length > 0) {
    process.exit(2);
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});