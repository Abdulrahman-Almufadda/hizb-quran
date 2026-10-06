import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, Bookmark } from '../api';

@Component({
  selector: 'app-bookmarks',
  imports: [RouterLink],
  template: `
    @for (b of bookmarks(); track b.id) {
      <div class="card row">
        <a [routerLink]="['/surah', b.surahId]">سورة {{ b.surahId }} - آية {{ b.ayahNumber }}</a>
        <button class="ghost" (click)="remove(b)">حذف</button>
      </div>
    } @empty {
      <p class="muted">لا توجد علامات بعد. اضغط على أي آية أثناء القراءة لإضافتها.</p>
    }
  `,
  styles: `.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }`,
})
export class Bookmarks {
  private api = inject(Api);
  bookmarks = signal<Bookmark[]>([]);

  constructor() { this.load(); }

  private load() { this.api.bookmarks().subscribe((b) => this.bookmarks.set(b)); }

  remove(b: Bookmark) { this.api.removeBookmark(b.id).subscribe(() => this.load()); }
}
