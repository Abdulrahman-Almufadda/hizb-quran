import type { SQLiteDatabase } from 'expo-sqlite';

import { bookmarkFromRow, type Bookmark, type BookmarkRow } from './types';

export async function getBookmarks(db: SQLiteDatabase): Promise<Bookmark[]> {
  try {
    const rows = await db.getAllAsync<BookmarkRow>('SELECT * FROM bookmarks ORDER BY created_at DESC');
    return rows.map(bookmarkFromRow);
  } catch (error) {
    console.error('[bookmarksRepository] getBookmarks failed:', error);
    return [];
  }
}

export async function isBookmarked(db: SQLiteDatabase, surahId: number, ayahNumber: number): Promise<boolean> {
  try {
    const row = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM bookmarks WHERE surah_id = ? AND ayah_number = ? LIMIT 1',
      surahId,
      ayahNumber
    );
    return row != null;
  } catch (error) {
    console.error('[bookmarksRepository] isBookmarked failed:', error);
    return false;
  }
}

export async function addBookmark(db: SQLiteDatabase, surahId: number, ayahNumber: number): Promise<void> {
  try {
    await db.runAsync(
      'INSERT INTO bookmarks (surah_id, ayah_number, created_at) VALUES (?, ?, ?)',
      surahId,
      ayahNumber,
      Date.now()
    );
  } catch (error) {
    console.error('[bookmarksRepository] addBookmark failed:', error);
  }
}

export async function removeBookmark(db: SQLiteDatabase, surahId: number, ayahNumber: number): Promise<void> {
  try {
    await db.runAsync('DELETE FROM bookmarks WHERE surah_id = ? AND ayah_number = ?', surahId, ayahNumber);
  } catch (error) {
    console.error('[bookmarksRepository] removeBookmark failed:', error);
  }
}

export async function removeBookmarkById(db: SQLiteDatabase, id: number): Promise<void> {
  try {
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
  } catch (error) {
    console.error('[bookmarksRepository] removeBookmarkById failed:', error);
  }
}

export async function toggleBookmark(db: SQLiteDatabase, surahId: number, ayahNumber: number): Promise<boolean> {
  const bookmarked = await isBookmarked(db, surahId, ayahNumber);
  if (bookmarked) {
    await removeBookmark(db, surahId, ayahNumber);
    return false;
  }
  await addBookmark(db, surahId, ayahNumber);
  return true;
}
