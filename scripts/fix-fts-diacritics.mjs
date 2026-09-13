// One-time data fix for assets/data/quran.db: the bundled ayahs_fts table indexes
// text_ar *with* full Arabic diacritics (tashkeel), so FTS5 MATCH never matches how
// real users type search queries (undiacritized, alef/hamza collapsed). This adds a
// normalized column and rebuilds the FTS index against it.
// Run with: node scripts/fix-fts-diacritics.mjs
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Arabic combining tashkeel + Quranic annotation marks + tatweel, expressed as
// explicit \u escapes to avoid any ambiguity with combining characters in source.
const DIACRITICS_RE = new RegExp(
  '[ؐ-ًؚ-ٰٟۖ-ۜ۟-ۤۧ-۪ۨ-ۭـ]',
  'g'
);

// Alef variants (hamza-on-alef أ/إ, madda آ, wasla ٱ) collapse to
// plain alef ا, and alef maksura ى collapses to yaa ي - most users type
// the plain forms even when the Quranic text uses the diacritic-marked ones.
const ALEF_RE = new RegExp('[أإآٱ]', 'g');
const ALEF_MAKSURA_RE = new RegExp('ى', 'g');

export function normalizeArabic(text) {
  return text.replace(DIACRITICS_RE, '').replace(ALEF_RE, 'ا').replace(ALEF_MAKSURA_RE, 'ي');
}

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'data', 'quran.db');
const db = new DatabaseSync(dbPath);

const columns = db.prepare('PRAGMA table_info(ayahs)').all();
const hasPlainColumn = columns.some((c) => c.name === 'text_ar_plain');

if (!hasPlainColumn) {
  db.exec('ALTER TABLE ayahs ADD COLUMN text_ar_plain TEXT');
}

const rows = db.prepare('SELECT id, text_ar FROM ayahs').all();
const update = db.prepare('UPDATE ayahs SET text_ar_plain = ? WHERE id = ?');
db.exec('BEGIN');
for (const row of rows) {
  update.run(normalizeArabic(row.text_ar), row.id);
}
db.exec('COMMIT');

db.exec('DROP TABLE IF EXISTS ayahs_fts');
db.exec(`
  CREATE VIRTUAL TABLE ayahs_fts USING fts5(
    text_ar_plain,
    surah_id UNINDEXED,
    ayah_number UNINDEXED,
    content='ayahs',
    content_rowid='id'
  )
`);
db.exec("INSERT INTO ayahs_fts(ayahs_fts) VALUES('rebuild')");

function check(query) {
  const rows = db
    .prepare(
      `SELECT COUNT(*) AS c FROM ayahs_fts f JOIN ayahs a ON a.id = f.rowid WHERE ayahs_fts MATCH ?`
    )
    .get(normalizeArabic(query) + '*');
  return rows.c;
}

console.log(`Rows updated: ${rows.length}`);
console.log(`Sanity check - 'الرحمن': ${check('الرحمن')}`);
console.log(`Sanity check - 'قل هو الله احد': ${check('قل هو الله احد')}`);
console.log(`Sanity check - 'الفلق': ${check('الفلق')}`);

db.close();
