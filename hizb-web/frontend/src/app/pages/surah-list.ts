import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, Surah } from '../api';

@Component({
  selector: 'app-surah-list',
  imports: [RouterLink],
  template: `
    @if (error()) { <p class="muted">تعذر تحميل السور. هل الخادم يعمل؟</p> }
    @for (s of surahs(); track s.id) {
      <a class="card row" [routerLink]="['/surah', s.id]">
        <span class="muted">{{ s.id }}</span>
        <span class="name">{{ s.nameAr }}</span>
        <span class="muted">{{ s.ayahCount }} آية</span>
      </a>
    }
  `,
  styles: `
    .row { display: flex; gap: 16px; align-items: center; margin-bottom: 8px; color: inherit; }
    .name { flex: 1; font-size: 1.3rem; }
  `,
})
export class SurahList {
  surahs = signal<Surah[]>([]);
  error = signal(false);

  constructor() {
    inject(Api).surahs().subscribe({
      next: (s) => this.surahs.set(s),
      error: () => this.error.set(true),
    });
  }
}
