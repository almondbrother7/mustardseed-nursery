import { Component, Input, HostListener } from '@angular/core';
import { DEFAULT_THUMB, DEFAULT_FULL } from '../../utils/utils';

export interface LightboxImage {
  src: string;
  caption?: string;
  thumb?: string;
  inventory: number;
}

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.css']
})
export class LightboxComponent {
  @Input() images: LightboxImage[] = [];
  @Input() startIndex = 0;
  @Input() categoryChange?: (category: string) => void;

  readonly defaultThumb = DEFAULT_THUMB;
  readonly defaultFull  = DEFAULT_FULL;

  currentIndex = 0;
  visible = false;
  private fullFailed = new Set<number>();

  get currentImage(): LightboxImage {
    const src = this.images[this.currentIndex]?.src.trim();
    if (!(src && src.length > 0)) this.images[this.currentIndex].src = this.defaultFull;
    return this.images[this.currentIndex];
  }

  private isLikelyImageUrl(s?: string | null): s is string {
    if (!s) return false;
    if (/[<>]/.test(s)) return false; // guard against accidental HTML
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(s) || /^([/.]|https?:|blob:|data:)/.test(s);
  }

  getFullSrc(): string {
    const img = this.currentImage;
    if (!img) return this.defaultFull;
    if (this.fullFailed.has(this.currentIndex)) return this.defaultFull;

    const src = img.src?.trim();
    const thumb = img.thumb?.trim();
    const candidate = src?.length ? src : (thumb?.length ? thumb : this.defaultFull);
    return this.isLikelyImageUrl(candidate) ? candidate : this.defaultFull;
  }

  onFullImageError(e: Event): void {
    const el = e.target as HTMLImageElement;
    if (el.src.includes(this.defaultFull)) return; // avoid loops if placeholder 404s
    this.fullFailed.add(this.currentIndex);            // remember this slide failed
    el.src = this.defaultFull;                     // swap immediately
  }

  private stripHtml(s?: string | null): string {
    return (s ?? '').replace(/<[^>]*>/g, '').trim();
  }

  get plainAlt(): string {
    // if image has a name, prefer it; otherwise strip the caption
    const name = (this as any).currentImage?.name as string | undefined;
    return name?.trim() || this.stripHtml(this.currentImage?.caption) || 'Plant image';
  }

  open(images: LightboxImage[], startIndex = 0): void {
    this.images = images;
    this.startIndex = startIndex;
    this.currentIndex = startIndex;
    document.body.style.overflow = 'hidden';
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    document.body.style.overflow = '';
  }

  prev(): void {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateCategoryIfNeeded();
    }
  }

  next(): void {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateCategoryIfNeeded();
    }
  }

  private updateCategoryIfNeeded() {
    const image = this.images[this.currentIndex];
    if (this.categoryChange && image.caption) {
      const category = this.extractCategoryFromCaption(image.caption);
      if (category) {
        this.categoryChange(category);
      }
    }
  }

  private extractCategoryFromCaption(caption: string): string | undefined {
    const parts = caption.split(':'); // e.g. 'Jatropha : Butterfly Garden'
    return parts.length === 2 ? parts[1].trim() : undefined;
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (!this.visible) return;

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case 'ArrowRight':
        this.next();
        break;
    }
  }


}
