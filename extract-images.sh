#!/usr/bin/env bash
# extract-images.sh
#
# Extracts ALL complete products (live EUR prices, titles, series, manufacturer,
# condition, stock, and product pictures) from wosworldofstickers.de, uploads
# images to your Vercel Blob store, and writes complete data to:
#   - src/data/products.json
#   - src/data/image-manifest.json
#
# Usage:
#   ./extract-images.sh                   # scrape & sync all products + prices + images
#   ./extract-images.sh --width 800       # resize Webador image URLs before Blob upload
#   ./extract-images.sh --limit 50        # test run on 50 products
#   ./extract-images.sh --force           # re-upload images even if already in Blob
#   ./extract-images.sh --prices-only     # fast-update all prices & product data without re-uploading existing blobs
set -uo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found." >&2
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install || exit 1
fi
if ! grep -qs '^BLOB_READ_WRITE_TOKEN=.\+' .env.local; then
  echo "BLOB_READ_WRITE_TOKEN is missing in .env.local" >&2
  exit 1
fi

MAX_ROUNDS=3
for round in $(seq 1 "$MAX_ROUNDS"); do
  echo "=== Full Product + Price + Blob Extraction Round $round/$MAX_ROUNDS ($(date '+%H:%M:%S')) ==="
  npx tsx scripts/download-product-images.ts "$@" 2>&1 | tee -a extract-images.log
  status=${PIPESTATUS[0]}
  if [ "$status" -eq 0 ]; then
    echo "✅ All complete products, accurate EUR prices, and Vercel Blob images are synced!"
    exit 0
  fi
  echo "Some products/images failed (exit $status); retrying in 10s..."
  sleep 10
done

echo "Finished with failures - see src/data/image-failures.json" >&2
exit 1