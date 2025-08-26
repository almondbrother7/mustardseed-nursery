import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string | null | undefined, query: string | null | undefined): string {
    const q = (query ?? '').trim();
    const t = text ?? '';
    if (!q) return t;
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return t.replace(new RegExp(esc, 'gi'), m => `<mark>${m}</mark>`);
  }
}
