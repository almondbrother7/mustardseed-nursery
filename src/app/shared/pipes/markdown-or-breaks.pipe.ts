import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdownOrBreaks' })
export class MarkdownOrBreaksPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    // 1) Escape HTML to keep it safe
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 2) Auto-link http/https URLs in escaped text
    const linkify = (s: string) =>
      s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

    // 3) Split into lines (CRLF or LF)
    const lines = value.split(/\r?\n/).map(l => linkify(esc(l)));

    // 4) Convert consecutive "- " lines into <ul><li>…</li></ul>
    const htmlParts: string[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // bullet?
        if (/^\s*-\s+/.test(line.replace(/<a.*?>|<\/a>/g, ''))) {
            // 🚫 remove any trailing <br> before starting a list
            if (htmlParts.length && htmlParts[htmlParts.length - 1] === '<br>') {
            htmlParts.pop();
            }
            htmlParts.push('<ul>');
            // consume consecutive bullets
            while (i < lines.length && /^\s*-\s+/.test(lines[i].replace(/<a.*?>|<\/a>/g, ''))) {
            const li = lines[i].replace(/^\s*-\s+/, '');
            htmlParts.push(`<li>${li}</li>`);
            i++;
            }
            htmlParts.push('</ul>');
            continue;
        }

        // normal paragraph line
        if (line.trim() === '') {
            htmlParts.push('<br>'); // blank line => paragraph break
        } else {
            htmlParts.push(`${line}<br>`); // preserve line breaks
        }
        i++;
    }

    const html = htmlParts.join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
