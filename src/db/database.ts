import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'quran.db';

export const quranDatabaseAsset = require('../../assets/data/quran.db') as number;

export const TOTAL_SURAHS = 114;

/**
 * The bundled quran.db already ships with surahs/ayahs/ayahs_fts and a bookmarks
 * table (ported from the original Flutter/sqflite schema). This only guards against
 * a bookmarks table missing from an older bundled copy - everything else is
 * read-only reference data that always ships correctly with the asset.
 */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      note TEXT
    );
  `);
}
