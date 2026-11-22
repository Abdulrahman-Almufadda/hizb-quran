import { muyassarSurahLoaders } from './muyassarManifest';

export const TAFSIR_SOURCE_NAME = 'التفسير الميسَّر';
export const TAFSIR_SOURCE_CREDIT = 'مجمع الملك فهد لطباعة المصحف الشريف';

/** Tafsir text for one ayah, or null if unavailable. Each surah file is loaded on demand. */
export function getTafsir(surahId: number, ayahNumber: number): string | null {
  const load = muyassarSurahLoaders[surahId];
  if (!load) return null;
  try {
    const entries = load();
    return entries.find((e) => e.ayah === ayahNumber)?.text?.trim() || null;
  } catch (error) {
    console.error('[tafsirRepository] Failed to load tafsir:', error);
    return null;
  }
}
