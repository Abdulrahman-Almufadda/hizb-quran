export type Surah = {
  id: number;
  nameAr: string;
  nameEn: string | null;
  ayahCount: number;
};

export type Ayah = {
  id: number;
  surahId: number;
  ayahNumber: number;
  textAr: string;
  page: number;
};

export type Bookmark = {
  id: number;
  surahId: number;
  ayahNumber: number;
  createdAt: number;
  note: string | null;
};

export type SurahRow = {
  id: number;
  name_ar: string;
  name_en: string | null;
  ayah_count: number;
};

export type AyahRow = {
  id: number;
  surah_id: number;
  ayah_number: number;
  text_ar: string;
  text_ar_plain?: string;
  page: number;
};

export type BookmarkRow = {
  id: number;
  surah_id: number;
  ayah_number: number;
  created_at: number;
  note: string | null;
};

export function surahFromRow(row: SurahRow): Surah {
  return { id: row.id, nameAr: row.name_ar, nameEn: row.name_en, ayahCount: row.ayah_count };
}

export function ayahFromRow(row: AyahRow): Ayah {
  return {
    id: row.id,
    surahId: row.surah_id,
    ayahNumber: row.ayah_number,
    textAr: row.text_ar,
    page: row.page,
  };
}

export function bookmarkFromRow(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    surahId: row.surah_id,
    ayahNumber: row.ayah_number,
    createdAt: row.created_at,
    note: row.note,
  };
}
