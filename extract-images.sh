#!/usr/bin/env bash
# extract-images.sh
#
# Extracts ALL product pictures from wosworldofstickers.de and uploads them to your
# Vercel Blob store, then updates src/data/products.json + src/data/image-manifest.json.
# Run it in a separate terminal tab while the dev server keeps running:
#
#   ./extract-images.sh                 # everything, full-size originals
#   ./extract-images.sh --width 800     # smaller images (much less blob storage)
#   ./extract-images.sh --limit 50      # quick test run
#   ./extract-images.sh --force         # re-upload images that already exist
#
# It is safe to stop (Ctrl+C) and rerun: images already in the blob store are skipped.
# Failed products are retried automatically (up to 3 rounds). Output is also saved to
# extract-images.log.
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
  echo "=== Extraction round $round/$MAX_ROUNDS ($(date '+%H:%M:%S')) ==="
  npx tsx scripts/download-product-images.ts "$@" 2>&1 | tee -a extract-images.log
  status=${PIPESTATUS[0]}
  if [ "$status" -eq 0 ]; then
    echo "All product pictures are in your Vercel Blob store."
    exit 0
  fi
  echo "Some images failed (exit $status); retrying in 10s..."
  sleep 10
done

echo "Finished with failures - see src/data/image-failures.json" >&2
exit 1
