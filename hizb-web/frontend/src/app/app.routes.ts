import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/surah-list').then((m) => m.SurahList) },
  { path: 'surah/:surahId', loadComponent: () => import('./pages/reader').then((m) => m.Reader) },
  { path: 'page/:page', loadComponent: () => import('./pages/reader').then((m) => m.Reader) },
  { path: 'search', loadComponent: () => import('./pages/search').then((m) => m.Search) },
  { path: 'bookmarks', loadComponent: () => import('./pages/bookmarks').then((m) => m.Bookmarks) },
  { path: '**', redirectTo: '' },
];
