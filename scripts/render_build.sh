#!/usr/bin/env bash
# Render production build.
# Installs Python dependencies, then refreshes the Next.js static export when
# Node.js is available. The FastAPI process serves src/frontend-next/out.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pip install -r requirements.txt

EXPORT="$ROOT/src/frontend-next/out/index.html"

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  echo "Node $(node -v) found — rebuilding the Next.js production export"
  # A failed rebuild must not take down the deploy. The committed export is
  # the verified production frontend.
  if (
    cd "$ROOT/src/frontend-next" &&
    npm ci --include=dev &&
    npm run build
  ); then
    echo "Next.js export rebuilt"
  else
    echo "Next.js rebuild failed. Using the committed production export." >&2
  fi
else
  echo "Node.js is not installed in this environment."
  echo "Using the committed Next.js production export at src/frontend-next/out."
fi

if [[ ! -f "$EXPORT" ]]; then
  echo "Missing production frontend: $EXPORT" >&2
  exit 1
fi

echo "Production frontend ready: $EXPORT"
