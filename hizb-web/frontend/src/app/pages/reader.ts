import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, Ayah, Bookmark, TOTAL_PAGES } from '../api';

// Route params arrive as strings via withComponentInputBinding().
@Component({
  selector: 'app-reader',
  imports: [RouterLink],
  template: `
    <h2>{{ title() }}</h2>
    @if (error()) { <p class="muted">تعذر تحميل الصفحة.</p> }
    <div class="card text">
      @for (a of ayahs(); track a.id) {
        <span class="ayah" [class.marked]="isBookmarked(a)" (click)="toggle(a)" title="اضغط لإضافة/إزالة علامة">
          {{ a.textAr }} <span class="num">﴿{{ a.ayahNumber }}﴾</span>
        </span>
      }
    </div>
    @if (pageNumber(); as p) {
      <div class="pager">
        <button class="ghost" [disabled]="p <= 1" [routerLink]="['/page', p - 1]">السابقة</button>
        <span class="muted">صفحة {{ p }}</span>
        <button class="ghost" [disabled]="p >= totalPages" [routerLink]="['/page', p + 1]">التالية</button>
      </div>
    }
  `,
  styles: `
    .text { font-family: 'Amiri Quran', serif; font-size: 1.8rem; line-height: 2.6; text-align: justify; }
    .ayah { cursor: pointer; }
    .ayah.marked { background: color-mix(in srgb, var(--accent) 22%, transparent); border-radius: 6px; }
    .num { color: var(--accent); font-size: 1.2rem; }
    .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
  `,
})
export class Reader {
  private api = inject(Api);

  surahId = input<string>();
  page = input<string>();

  readonly totalPages = TOTAL_PAGES;
  ayahs = signal<Ayah[]>([]);
  error = signal(false);
  private bookmarks = signal<Bookmark[]>([]);

  pageNumber = computed(() => (this.page() ? Number(this.page()) : null));
  title = computed(() => (this.surahId() ? `سورة رقم ${this.surahId()}` : 'المصحف'));

  constructor() {
    this.refreshBookmarks();
    effect(() => {
      const surah = this.surahId();
      const page = this.page();
      this.error.set(false);
      const req = surah ? this.api.ayahsBySurah(Number(surah)) : this.api.ayahsByPage(Number(page));
      req.subscribe({
        next: (a) => this.ayahs.set(a),
        error: () => { this.ayahs.set([]); this.error.set(true); },
      });
    });
  }

  private find(a: Ayah) {
    return this.bookmarks().find((b) => b.surahId === a.surahId && b.ayahNumber === a.ayahNumber);
  }

  isBookmarked(a: Ayah) { return !!this.find(a); }

  toggle(a: Ayah) {
    const existing = this.find(a);
    const done = this.refreshBookmarks.bind(this);
    if (existing) this.api.removeBookmark(existing.id).subscribe(done);
    else this.api.addBookmark(a.surahId, a.ayahNumber).subscribe(done);
  }

  private refreshBookmarks() {
    this.api.bookmarks().subscribe((b) => this.bookmarks.set(b));
  }
}
