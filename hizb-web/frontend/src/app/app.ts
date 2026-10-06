import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a class="brand" routerLink="/">حزب</a>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">السور</a>
      <a routerLink="/search" routerLinkActive="active">بحث</a>
      <a routerLink="/bookmarks" routerLinkActive="active">العلامات</a>
    </nav>
    <main><router-outlet /></main>
  `,
  styles: `
    nav { display: flex; gap: 20px; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--card); }
    .brand { font-weight: 700; font-size: 1.4rem; margin-inline-end: auto; }
    .active { font-weight: 700; text-decoration: underline; }
  `,
})
export class App {}
