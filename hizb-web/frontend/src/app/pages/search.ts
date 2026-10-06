import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, SearchResult } from '../api';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  template: `
    <input type="search" placeholder="ابحث في القرآن أو عن اسم سورة..." [(ngModel)]="query" (keyup.enter)="run()" />
    @if (result(); as r) {
      @for (s of r.surahs; track s.id) {
        <a class="card item" [routerLink]="['/surah', s.id]">سورة {{ s.nameAr }}</a>
      }
      @for (a of r.ayahs; track a.id) {
        <a class="card item" [routerLink]="['/page', a.page]">
          {{ a.textAr }} <span class="muted">({{ a.surahId }}:{{ a.ayahNumber }})</span>
        </a>
      }
      @if (!r.surahs.length && !r.ayahs.length) { <p class="muted">لا توجد نتائج.</p> }
    }
  `,
  styles: `.item { display: block; margin-top: 8px; color: inherit; font-family: 'Amiri Quran', serif; }`,
})
export class Search {
  private api = inject(Api);
  query = '';
  result = signal<SearchResult | null>(null);

  run() {
    if (!this.query.trim()) return;
    this.api.search(this.query).subscribe((r) => this.result.set(r));
  }
}
