#!/usr/bin/env bash
# Build the static site and serve it in the foreground on $PORT (default 3000).
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
BUILD_DIR="$PROJECT_DIR/dist"
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-${RUNNER_TEMP:-/home/runner/work/_temp}/omgithub-web}"

TIMER_START_MS=0
timer_start() { TIMER_START_MS="$(date +%s%3N)"; }
timer_end() {
  local end
  end="$(date +%s%3N)"
  printf '[timing] %s: %d ms\n' "$1" "$((end - TIMER_START_MS))"
}

cd "$PROJECT_DIR"

[[ "$PORT" =~ ^[0-9]+$ ]] || { echo "PORT must be a number." >&2; exit 1; }
[[ -f package.json ]] || { echo "package.json is missing in $PROJECT_DIR." >&2; exit 1; }

timer_start
mkdir -p "$WEB_DIR"
timer_end "prepare metadata dir"

# Reuse the dependency cache only when both the manifest and lockfile are unchanged.
deps_hash="$({ cat package.json; if [[ -f package-lock.json ]]; then cat package-lock.json; fi; } | sha256sum | cut -d' ' -f1)"
needs_install=false
if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  needs_install=true
elif [[ ! -f "$WEB_DIR/default-dependencies" ]] || [[ "$(cat "$WEB_DIR/default-dependencies")" != "$deps_hash" ]]; then
  needs_install=true
fi

if [[ "$needs_install" == true ]]; then
  timer_start
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
  timer_end "npm install"
  timer_start
  printf '%s' "$deps_hash" > "$WEB_DIR/default-dependencies"
  timer_end "dependency stamp"
else
  echo "[timing] npm install: skipped (cache hit)"
fi

# Rebuild only when sources or the build configuration changed.
needs_build=false
if [[ ! -f "$BUILD_DIR/index.html" ]] || [[ ! -d "$BUILD_DIR/assets" ]]; then
  needs_build=true
elif [[ -n "$(find src index.html package.json package-lock.json vite.config.js -newer "$BUILD_DIR/index.html" -print -quit 2>/dev/null || true)" ]]; then
  needs_build=true
fi

if [[ "$needs_build" == true ]]; then
  timer_start
  node "$PROJECT_DIR/node_modules/vite/bin/vite.js" build --base ./
  timer_end "vite build"
else
  echo "[timing] vite build: skipped (up to date)"
fi

[[ -f "$BUILD_DIR/index.html" ]] || { echo "Build output is missing $BUILD_DIR/index.html." >&2; exit 1; }

# The controller reads this file to publish the built output.
timer_start
node -e '
  const fs = require("node:fs");
  const [project, directory, output] = process.argv.slice(1);
  const temporary = output + "." + process.pid + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify({ project, directory }) + "\n");
  fs.renameSync(temporary, output);
' "$PROJECT_DIR" "$BUILD_DIR" "$WEB_DIR/deployment-output.json"
timer_end "deployment-output.json"

cd "$PROJECT_DIR"
export PORT
printf '[timing] serve: starting static preview on 0.0.0.0:%s\n' "$PORT"
# Foreground process: the controller owns the tmux session and restarts it when needed.
exec node "$PROJECT_DIR/node_modules/vite/bin/vite.js" preview \
  --host 0.0.0.0 --port "$PORT" --strictPort
