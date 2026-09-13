import type { SQLiteDatabase } from 'expo-sqlite';

import { normalizeArabic } from '../utils/arabicNormalize';
import { TOTAL_SURAHS } from './database';
import { ayahFromRow, surahFromRow, type Ayah, type AyahRow, type Surah, type SurahRow } from './types';

export const TOTAL_MUSHAF_PAGES = 604;

export function clampSurahId(surahId: number): number {
  if (!Number.isFinite(surahId)) return 1;
  return Math.min(Math.max(Math.round(surahId), 1), TOTAL_SURAHS);
}

export function clampPageNumber(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.round(page), 1), TOTAL_MUSHAF_PAGES);
}

export async function getSurahs(db: SQLiteDatabase): Promise<Surah[]> {
  try {
    const rows = await db.getAllAsync<SurahRow>('SELECT * FROM surahs ORDER BY id ASC');
    return rows.map(surahFromRow);
  } catch (error) {
    console.error('[quranRepository] getSurahs failed:', error);
    return [];
  }
}

export async function getAyahsBySurah(db: SQLiteDatabase, surahId: number): Promise<Ayah[]> {
  try {
    const rows = await db.getAllAsync<AyahRow>(
      'SELECT * FROM ayahs WHERE surah_id = ? ORDER BY ayah_number ASC',
      clampSurahId(surahId)
    );
    return rows.map(ayahFromRow);
  } catch (error) {
    console.error('[quranRepository] getAyahsBySurah failed:', error);
    return [];
  }
}

export async function getAyahsByPage(db: SQLiteDatabase, page: number): Promise<Ayah[]> {
  try {
    const rows = await db.getAllAsync<AyahRow>(
      'SELECT * FROM ayahs WHERE page = ? ORDER BY id ASC',
      clampPageNumber(page)
    );
    return rows.map(ayahFromRow);
  } catch (error) {
    console.error('[quranRepository] getAyahsByPage failed:', error);
    return [];
  }
}

export async function getFirstPageOfSurah(db: SQLiteDatabase, surahId: number): Promise<number> {
  try {
    const row = await db.getFirstAsync<{ page: number }>(
      'SELECT page FROM ayahs WHERE surah_id = ? ORDER BY ayah_number ASC LIMIT 1',
      clampSurahId(surahId)
    );
    return row?.page ?? 1;
  } catch (error) {
    console.error('[quranRepository] getFirstPageOfSurah failed:', error);
    return 1;
  }
}

export async function getPageForAyah(db: SQLiteDatabase, surahId: number, ayahNumber: number): Promise<number> {
  try {
    const row = await db.getFirstAsync<{ page: number }>(
      'SELECT page FROM ayahs WHERE surah_id = ? AND ayah_number = ? LIMIT 1',
      clampSurahId(surahId),
      ayahNumber
    );
    return row?.page ?? 1;
  } catch (error) {
    console.error('[quranRepository] getPageForAyah failed:', error);
    return 1;
  }
}

export async function getSurahForPage(db: SQLiteDatabase, page: number): Promise<Surah | null> {
  try {
    const row = await db.getFirstAsync<AyahRow & SurahRow>(
      `SELECT s.* FROM ayahs a
       JOIN surahs s ON s.id = a.surah_id
       WHERE a.page = ?
       ORDER BY a.id ASC
       LIMIT 1`,
      clampPageNumber(page)
    );
    return row ? surahFromRow(row) : null;
  } catch (error) {
    console.error('[quranRepository] getSurahForPage failed:', error);
    return null;
  }
}

export async function searchSurahsByName(db: SQLiteDatabase, query: string): Promise<Surah[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  // Only 114 rows total - filtering in JS lets us normalize alef/hamza variants on
  // both sides (e.g. query "الانعام" should still find "الأنعام"), which a raw SQL
  // LIKE can't do without a precomputed normalized column.
  const normalizedQuery = normalizeArabic(trimmed).toLowerCase();
  const all = await getSurahs(db);
  return all.filter(
    (s) =>
      normalizeArabic(s.nameAr).includes(normalizedQuery) ||
      (s.nameEn ?? '').toLowerCase().includes(normalizedQuery)
  );
}

export async function searchAyahs(db: SQLiteDatabase, query: string): Promise<Ayah[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  // ayahs_fts indexes text_ar_plain (diacritics/alef-hamza normalized) - see
  // scripts/fix-fts-diacritics.mjs - so the query must be normalized the same way,
  // otherwise a plain-typed search would never match the diacritized Quran text.
  const normalized = normalizeArabic(trimmed);
  try {
    const rows = await db.getAllAsync<AyahRow>(
      `SELECT a.* FROM ayahs_fts f
       JOIN ayahs a ON a.id = f.rowid
       WHERE ayahs_fts MATCH ?
       ORDER BY a.surah_id, a.ayah_number
       LIMIT 200`,
      `${normalized}*`
    );
    return rows.map(ayahFromRow);
  } catch (ftsError) {
    console.warn('[quranRepository] FTS search failed, falling back to LIKE:', ftsError);
    try {
      const rows = await db.getAllAsync<AyahRow>(
        'SELECT * FROM ayahs WHERE text_ar_plain LIKE ? ORDER BY surah_id, ayah_number LIMIT 200',
        `%${normalized}%`
      );
      return rows.map(ayahFromRow);
    } catch (likeError) {
      console.error('[quranRepository] LIKE search fallback failed:', likeError);
      return [];
    }
  }
}
