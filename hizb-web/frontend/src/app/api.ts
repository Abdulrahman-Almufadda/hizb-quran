import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Surah { id: number; nameAr: string; nameEn: string | null; ayahCount: number }
export interface Ayah { id: number; surahId: number; ayahNumber: number; textAr: string; page: number }
export interface Bookmark { id: number; surahId: number; ayahNumber: number; createdAt: string; note: string | null }
export interface SearchResult { surahs: Surah[]; ayahs: Ayah[] }

export const TOTAL_PAGES = 604;

// Relative URLs: `ng serve` proxies /api (proxy.conf.json), nginx proxies it in Docker.
@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  surahs() { return this.http.get<Surah[]>('/api/surahs'); }
  ayahsBySurah(id: number) { return this.http.get<Ayah[]>(`/api/surahs/${id}/ayahs`); }
  ayahsByPage(page: number) { return this.http.get<Ayah[]>(`/api/pages/${page}/ayahs`); }
  search(q: string) { return this.http.get<SearchResult>('/api/search', { params: { q } }); }
  bookmarks() { return this.http.get<Bookmark[]>('/api/bookmarks'); }
  addBookmark(surahId: number, ayahNumber: number) {
    return this.http.post<Bookmark>('/api/bookmarks', { surahId, ayahNumber });
  }
  removeBookmark(id: number) { return this.http.delete<void>(`/api/bookmarks/${id}`); }
}
