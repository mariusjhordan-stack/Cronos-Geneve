#!/usr/bin/env bash
set -euo pipefail

: "${BACKEND_HOST:?Render must provide the public Django hostname in BACKEND_HOST}"
export VITE_API_URL="https://${BACKEND_HOST}"

npm ci
npm run build
