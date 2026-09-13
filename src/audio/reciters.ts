export type Reciter = {
  id: string;
  nameAr: string;
  folder: string;
};

// Folder names match everyayah.com's per-ayah MP3 directory structure exactly -
// see buildAyahAudioUrl below.
export const RECITERS: Reciter[] = [
  { id: 'alafasy', nameAr: 'مشاري العفاسي', folder: 'Alafasy_128kbps' },
  { id: 'husary', nameAr: 'محمود خليل الحصري', folder: 'Husary_128kbps' },
  { id: 'minshawy', nameAr: 'محمد صديق المنشاوي', folder: 'Minshawy_Murattal_128kbps' },
  { id: 'abdulbasit', nameAr: 'عبد الباسط عبد الصمد', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'sudais', nameAr: 'عبد الرحمن السديس', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'shatri', nameAr: 'أبو بكر الشاطري', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
];

export const DEFAULT_RECITER_ID = 'alafasy';

export function getReciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

export function buildAyahAudioUrl(reciterId: string, surahId: number, ayahNumber: number): string {
  const reciter = getReciterById(reciterId);
  return `https://everyayah.com/data/${reciter.folder}/${pad3(surahId)}${pad3(ayahNumber)}.mp3`;
}

export function audioCacheFileName(reciterId: string, surahId: number, ayahNumber: number): string {
  const reciter = getReciterById(reciterId);
  return `${reciter.folder}_${pad3(surahId)}${pad3(ayahNumber)}.mp3`;
}
