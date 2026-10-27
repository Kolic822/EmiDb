#!/usr/bin/env bash
# Double-clickable launcher for macOS (also works from a terminal on Linux).
set -euo pipefail
cd "$(dirname "$0")"

# Terminal runs this without the usual shell setup, so look where Node is normally installed.
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v node >/dev/null 2>&1 && [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" >/dev/null 2>&1 || true
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or newer is required. Download it from https://nodejs.org and run this file again."
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -f apps/api/dist/main.js ]; then
  echo "First start: installing dependencies and building the app. This takes a few minutes..."
  npm install --no-audit --no-fund
  npm run build
elif [ ! -d node_modules ]; then
  echo "First start: installing runtime dependencies. This needs an internet connection..."
  npm install --omit=dev --no-audit --no-fund
fi

PORT="${PORT:-3210}"
echo
echo "emidb is starting on http://localhost:$PORT"
echo "Keep this window open while you use the app. Close it (or press Ctrl+C) to stop."
echo
( sleep 3; command -v open >/dev/null && open "http://localhost:$PORT" || xdg-open "http://localhost:$PORT" ) &
exec node apps/api/dist/main.js
