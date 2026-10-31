#!/usr/bin/env bash
# Capture desktop and mobile preview screenshots into $CAPTURE_DIR.
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$PROJECT_DIR"

TIMER_START_MS=0
timer_start() { TIMER_START_MS="$(date +%s%3N)"; }
timer_end() {
  local end
  end="$(date +%s%3N)"
  printf '[timing] %s: %d ms\n' "$1" "$((end - TIMER_START_MS))"
}

if [[ -z "${CAPTURE_URL:-}" ]]; then
  echo 'CAPTURE_URL is required.' >&2
  exit 1
fi
if [[ -z "${CAPTURE_DIR:-}" ]]; then
  echo 'CAPTURE_DIR is required.' >&2
  exit 1
fi
case "$CAPTURE_URL" in
  http://*|https://*) ;;
  *) echo 'CAPTURE_URL must be an http(s) URL.' >&2; exit 1 ;;
esac

timer_start
mkdir -p -- "$CAPTURE_DIR"
timer_end "prepare capture dir"
CAPTURE_DIR="$(cd -- "$CAPTURE_DIR" && pwd -P)"
export CAPTURE_URL CAPTURE_DIR

PLAYWRIGHT_HOME="${PLAYWRIGHT_HOME:-$HOME/.local/share/omgithub-playwright}"
if [[ ! -d "$PLAYWRIGHT_HOME/node_modules/playwright" ]]; then
  echo "Playwright runtime is not installed at $PLAYWRIGHT_HOME." >&2
  exit 75
fi
export PLAYWRIGHT_HOME

set +e
timer_start
node --input-type=module - <<'NODE'
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const runtime = process.env.PLAYWRIGHT_HOME;
const url = process.env.CAPTURE_URL;
const output = process.env.CAPTURE_DIR;
const require = createRequire(join(runtime, 'package.json'));
const { chromium } = require('playwright');

const views = [
  { name: 'desktop', width: 1440, height: 900, scale: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, scale: 2, mobile: true },
];

const timer = (label, started) => console.log(`[timing] ${label}: ${Date.now() - started} ms`);
const fail = (message, exitCode = 1) => Object.assign(new Error(message), { exitCode });

async function navigate(page) {
  let lastStatus = 0;
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      lastStatus = response?.status() ?? 0;
      if (lastStatus >= 200 && lastStatus < 400) return response;
      if (![404, 408, 425, 429, 500, 502, 503, 504].includes(lastStatus) && lastStatus < 500) {
        throw fail(`HTTP ${lastStatus} loading ${url}`, 1);
      }
    } catch (error) {
      if (error.exitCode) throw error;
      lastStatus = 0;
      lastError = error.message;
    }
    if (attempt < 4) await page.waitForTimeout(1500);
  }
  if (lastStatus) throw fail(`HTTP ${lastStatus} loading ${url} after retries`, 75);
  throw fail(`navigation failed: ${lastError || 'unknown error'}`, 75);
}

async function waitForRender(page) {
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  const hasGameIntro = await page.evaluate(() => Boolean(document.querySelector('#start-btn')));
  if (hasGameIntro) {
    await page.waitForFunction(() => {
      const button = document.querySelector('#start-btn');
      const percent = document.querySelector('#load-pct');
      return Boolean(button) && !button.disabled && (!percent || percent.textContent.trim() === '100%');
    }, null, { timeout: 60000 });
    const canvas = await page.evaluate(() => {
      const element = document.querySelector('canvas#game');
      return element ? { width: element.width, height: element.height } : null;
    });
    if (!canvas || canvas.width < 100 || canvas.height < 100) {
      throw new Error('game canvas is missing or too small');
    }
    await page.waitForTimeout(1500);
  } else {
    await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 0, null, { timeout: 60000 });
    await page.waitForTimeout(1000);
  }
}

async function captureView(browser, view) {
  const pageStart = Date.now();
  let page;
  try {
    page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: view.scale,
      isMobile: view.mobile,
      hasTouch: view.mobile,
    });
  } catch (error) {
    throw fail(`cannot create ${view.name} page: ${error.message}`, 75);
  }
  timer(`new page ${view.name}`, pageStart);
  page.setDefaultTimeout(30000);

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
  });

  const navStart = Date.now();
  await navigate(page).catch(async (error) => {
    await page.close().catch(() => {});
    throw error;
  });
  timer(`navigation ${view.name}`, navStart);

  const readyStart = Date.now();
  await waitForRender(page).catch(async (error) => {
    await page.close().catch(() => {});
    throw fail(`rendered content not ready (${view.name}): ${error.message}`, 1);
  });
  timer(`render ready ${view.name}`, readyStart);

  const shotStart = Date.now();
  const path = join(output, `final-${view.name}.png`);
  await page.screenshot({ path, timeout: 30000 }).catch(async (error) => {
    await page.close().catch(() => {});
    const exitCode = error.name === 'TimeoutError' || !browser.isConnected() ? 75 : 1;
    throw fail(`screenshot failed (${view.name}): ${error.message}`, exitCode);
  });
  timer(`screenshot ${view.name}`, shotStart);

  const bytes = statSync(path).size;
  if (bytes < 4096) {
    await page.close().catch(() => {});
    throw fail(`screenshot looks blank (${view.name}, ${bytes} bytes)`, 1);
  }
  if (pageErrors.length) {
    await page.close().catch(() => {});
    console.error(pageErrors.join('\n'));
    throw fail(`page errors while rendering ${view.name}`, 1);
  }
  await page.close().catch(() => {});
  timer(`page close ${view.name}`, pageStart);
}

let browser;
let exitCode = 0;
try {
  const configFile = join(runtime, process.platform === 'darwin' ? 'metal.json' : 'linux.json');
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  if (process.platform === 'linux') {
    try {
      const display = readFileSync(join(runtime, 'display'), 'utf8').trim();
      if (display) process.env.DISPLAY ||= `:${display}`;
    } catch {}
  }

  const launchStart = Date.now();
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 });
  } catch (error) {
    throw fail(`browser launch failed: ${error.message}`, 75);
  }
  timer('browser launch', launchStart);

  for (const view of views) await captureView(browser, view);
} catch (error) {
  console.error(`capture failed: ${error.message}`);
  exitCode = error.exitCode === 75 ? 75 : 1;
} finally {
  if (browser) {
    const closeStart = Date.now();
    try {
      await browser.close();
      timer('browser close', closeStart);
    } catch (error) {
      console.error(`browser close failed: ${error.message}`);
      if (!exitCode) exitCode = 75;
    }
  }
}
process.exitCode = exitCode;
NODE
status=$?
timer_end "browser capture"
set -e
exit "$status"
