// Mirrors scripts/fix-fts-diacritics.mjs, which normalized the bundled quran.db's
// ayahs_fts index the same way. Keep both in sync if this changes.
const DIACRITICS_RE = new RegExp('[ؐ-ًؚ-ٰٟۖ-ۜ۟-ۤۧ-۪ۨ-ۭـ]', 'g');
const ALEF_RE = new RegExp('[أإآٱ]', 'g');
const ALEF_MAKSURA_RE = new RegExp('ى', 'g');

export function normalizeArabic(text: string): string {
  return text.replace(DIACRITICS_RE, '').replace(ALEF_RE, 'ا').replace(ALEF_MAKSURA_RE, 'ي');
}
