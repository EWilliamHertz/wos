#!/usr/bin/env bash
# Push the local repo to https://github.com/EWilliamHertz/wos
set -e
cd "$(dirname "$0")/.."

TOKEN="${1:-${GITHUB_PAT:-}}"

if [ -z "$TOKEN" ]; then
  if [ -f .env.local ]; then
    TOKEN="$(grep -E '^GITHUB_PAT=' .env.local | cut -d '=' -f2- | tr -d '\"'\''')"
  fi
fi

if [ -z "$TOKEN" ]; then
  echo "Error: Please provide a token: ./scripts/push-to-github.sh <GITHUB_PAT>" >&2
  exit 1
fi

echo "Pushing main branch to https://github.com/EWilliamHertz/wos.git ..."
git -c credential.helper='!f() { echo "username=x-access-token"; echo "password='$TOKEN'"; }; f' push -u origin main
echo "Push successful!"
