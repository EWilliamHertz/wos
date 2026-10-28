// scripts/download-product-images.ts
//
// Mirrors every product picture listed in wosworldofstickers.de's sitemap into your
// Vercel Blob store (wos-products/<id>-<slug>.<ext>) - nothing is stored locally.
// The resulting blob URLs are saved to src/data/image-manifest.json and applied to
// the `blobImageUrl` field of every product in src/data/products.json.
//
// Requires BLOB_READ_WRITE_TOKEN in .env.local (git-ignored).
//
// Usage:
//   npm run download-images                       # everything (resumable)
//   npm run download-images -- --limit 20         # first 20 products only
//   npm run download-images -- --ids 24492780,23730826
//   npm run download-images -- --width 800        # smaller resized images (default: full-size originals)
//   npm run download-images -- --force            # re-upload even if already in the blob store
//   npm run download-images -- --concurrency 4 --delay 150
import { list, put } from '@vercel/blob';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.wosworldofstickers.de';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const USER_AGENT = 'Mozilla/5.0 (compatible; WOS-Image-Mirror/1.0)';
const BLOB_PREFIX = 'wos-products/';

const ROOT = process.cwd();
const MANIFEST_FILE = path.join(ROOT, 'src', 'data', 'image-manifest.json');
const PRODUCTS_JSON = path.join(ROOT, 'src', 'data', 'products.json');
const FAILED_FILE = path.join(ROOT, 'src', 'data', 'image-failures.json');

// Load secrets from .env.local / .env without extra dependencies (Node >= 20.12).
for (const file of ['.env.local', '.env']) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) process.loadEnvFile(full);
}
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN. Add it to .env.local first.');
  process.exit(1);
}

interface SiteProduct {
  id: string;
  slug: string;
  url: string;
}

type Manifest = Record<string, { url: string; pathname: string; sourceImageUrl: string }>;

function numArg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function strArg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const ONLY_IDS = new Set((strArg('ids') ?? '').split(',').map((x) => x.trim()).filter(Boolean));
const WIDTH = numArg('width', 0);
const FORCE = process.argv.includes('--force');
const LIMIT = numArg('limit', Infinity);
const CONCURRENCY = Math.max(1, numArg('concurrency', 5));
const DELAY_MS = numArg('delay', 100);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url: string, attempts = 4): Promise<Response> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
      // Permanent client errors (except rate limiting) are not worth retrying.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) throw lastErr;
    } catch (err) {
      lastErr = err;
      if (err instanceof Error && /^HTTP 4\d\d$/.test(err.message) && err.message !== 'HTTP 429') throw err;
    }
    await sleep(500 * 2 ** (i - 1));
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function listProducts(): Promise<SiteProduct[]> {
  const xml = await (await fetchRetry(SITEMAP_URL)).text();
  const seen = new Set<string>();
  const products: SiteProduct[] = [];
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    const match = url.match(/\/product\/(\d+)\/([^/?#]+)/);
    if (!match || seen.has(match[1])) continue;
    seen.add(match[1]);
    products.push({ id: match[1], slug: match[2], url });
  }
  return products;
}

/** Finds the main product image URL on a product page. */
function extractImageUrl(html: string): string | null {
  const $ = cheerio.load(html);
  const src =
    $('meta[property="og:image"]').attr('content') ||
    $('.jw-element-image__image, article img').first().attr('src');
  return src ? new URL(src, BASE_URL).toString() : null;
}

/** Strip resize query params to get the full-resolution original (or resize if --width is set). */
function toOriginalUrl(imageUrl: string): string {
  const u = new URL(imageUrl);
  u.search = WIDTH > 0 ? `?enable-io=true&fit=bounds&width=${WIDTH}` : '';
  return u.toString();
}

function extensionFor(contentType: string | null, url: string): string {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  const fromUrl = path.extname(new URL(url).pathname).replace('.', '').toLowerCase();
  return fromUrl === 'jpeg' ? 'jpg' : fromUrl || 'jpg';
}

/** All real photos already in the blob store (placeholder .svg graphics don't count). */
async function listExistingBlobs(): Promise<Map<string, string>> {
  const existing = new Map<string, string>(); // product id -> blob url
  let cursor: string | undefined;
  do {
    const page = await list({ token: BLOB_TOKEN, prefix: BLOB_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (blob.pathname.endsWith('.svg')) continue;
      const id = blob.pathname.slice(BLOB_PREFIX.length).match(/^(\d+)-/)?.[1];
      if (id) existing.set(id, blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return existing;
}

function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8')) as Manifest;
  } catch {
    return {};
  }
}

/** Points existing catalog entries at their uploaded blob image. */
function updateProductsJson(manifest: Manifest): number {
  if (!fs.existsSync(PRODUCTS_JSON)) return 0;
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8')) as Array<
    { id: string; blobImageUrl: string; updatedAt: string } & Record<string, unknown>
  >;
  let changed = 0;
  for (const p of products) {
    const entry = manifest[p.id];
    if (entry && p.blobImageUrl !== entry.url) {
      p.blobImageUrl = entry.url;
      p.updatedAt = new Date().toISOString();
      changed++;
    }
  }
  if (changed) fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2), 'utf-8');
  return changed;
}

async function main() {
  console.log(`Reading sitemap: ${SITEMAP_URL}`);
  const all = await listProducts();
  const products = (ONLY_IDS.size ? all.filter((p) => ONLY_IDS.has(p.id)) : all).slice(0, LIMIT);
  console.log(`Found ${all.length} products, processing ${products.length}.`);

  console.log('Checking which images are already in the blob store...');
  const existing = FORCE ? new Map<string, string>() : await listExistingBlobs();

  const manifest = loadManifest();
  const failures: Array<{ id: string; url: string; error: string }> = [];
  let done = 0;
  let uploaded = 0;
  let skipped = 0;
  let next = 0;

  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  const saveManifest = () => fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');

  async function processOne(product: SiteProduct): Promise<void> {
    const already = existing.get(product.id);
    if (already) {
      manifest[product.id] = {
        url: already,
        pathname: new URL(already).pathname.replace(/^\//, ''),
        sourceImageUrl: manifest[product.id]?.sourceImageUrl ?? '',
      };
      skipped++;
      return;
    }

    const html = await (await fetchRetry(product.url)).text();
    const imageUrl = extractImageUrl(html);
    if (!imageUrl) throw new Error('no image found on product page');

    let usedUrl = toOriginalUrl(imageUrl);
    let res: Response;
    try {
      res = await fetchRetry(usedUrl);
    } catch {
      usedUrl = imageUrl; // fall back to the URL exactly as advertised by the page
      res = await fetchRetry(usedUrl);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) throw new Error('empty image response');

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const pathname = `${BLOB_PREFIX}${product.id}-${product.slug}.${extensionFor(contentType, usedUrl)}`;
    const blob = await put(pathname, buffer, {
      access: 'public',
      token: BLOB_TOKEN,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    manifest[product.id] = { url: blob.url, pathname: blob.pathname, sourceImageUrl: usedUrl };
    uploaded++;
    await sleep(DELAY_MS);
  }

  async function worker() {
    while (next < products.length) {
      const product = products[next++];
      try {
        await processOne(product);
      } catch (err) {
        failures.push({ id: product.id, url: product.url, error: (err as Error).message });
      }
      done++;
      if (done % 25 === 0 || done === products.length) {
        saveManifest();
        console.log(`  ${done}/${products.length} (uploaded ${uploaded}, already in blob ${skipped}, failed ${failures.length})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveManifest();

  const updated = updateProductsJson(manifest);
  console.log(`\nDone. Uploaded ${uploaded}, already in blob ${skipped}, failed ${failures.length}.`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_FILE)}`);
  console.log(`Updated ${updated} entries in ${path.relative(ROOT, PRODUCTS_JSON)} with Vercel Blob URLs.`);

  if (failures.length) {
    fs.writeFileSync(FAILED_FILE, JSON.stringify(failures, null, 2), 'utf-8');
    console.log(`Failures written to ${path.relative(ROOT, FAILED_FILE)} - rerun the script to retry them.`);
    process.exitCode = 1;
  } else if (fs.existsSync(FAILED_FILE)) {
    fs.unlinkSync(FAILED_FILE);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
