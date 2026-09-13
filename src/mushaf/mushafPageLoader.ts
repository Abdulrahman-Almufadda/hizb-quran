import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

import { mushafPageManifest } from '../assets/mushafManifest';

const MAX_CACHED_PAGES = 6;
const textCache = new Map<number, string>();

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];
const LOAD_TIMEOUT_MS = 15000;

function rememberInCache(page: number, text: string): void {
  textCache.delete(page);
  textCache.set(page, text);
  while (textCache.size > MAX_CACHED_PAGES) {
    const oldestKey = textCache.keys().next().value;
    if (oldestKey === undefined) break;
    textCache.delete(oldestKey);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function fetchPageText(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) throw new Error('Asset resolved without a usable URI');
  return new File(uri).text();
}

/**
 * Loads a Mushaf page's raw SVG markup, reading only the requested page (and a
 * small LRU of recently-viewed pages) into memory at a time - never all 604 pages
 * at once - so swiping through the whole Mushaf can't exhaust device memory.
 *
 * In Expo Go each of these 604 files is fetched over the LAN from the Metro dev
 * server on first access (not bundled into a compiled binary), so a flaky
 * connection or a slow response is common - retried a couple of times with
 * backoff before giving up, rather than failing on the first hiccup.
 */
export async function loadMushafPageSvg(page: number): Promise<string | null> {
  const cached = textCache.get(page);
  if (cached != null) {
    rememberInCache(page, cached);
    return cached;
  }

  const moduleId = mushafPageManifest[page];
  if (moduleId == null) return null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const text = await withTimeout(fetchPageText(moduleId), LOAD_TIMEOUT_MS);
      rememberInCache(page, text);
      return text;
    } catch (error) {
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      console.warn(
        `[mushafPageLoader] Attempt ${attempt + 1}/${MAX_ATTEMPTS} failed for page ${page}:`,
        error
      );
      if (isLastAttempt) {
        console.error(`[mushafPageLoader] Giving up on page ${page} after ${MAX_ATTEMPTS} attempts.`);
        return null;
      }
      await delay(RETRY_DELAYS_MS[attempt] ?? 1500);
    }
  }
  return null;
}

export function preloadMushafPage(page: number): void {
  if (mushafPageManifest[page] == null) return;
  loadMushafPageSvg(page).catch(() => {});
}
