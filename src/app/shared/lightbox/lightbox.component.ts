import { Component, Input, HostListener } from '@angular/core';

export interface LightboxImage {
  src: string;
  caption?: string;
  thumb?: string;
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

  currentIndex = 0;
  visible = false;

  get currentImage(): LightboxImage {
    return this.images[this.currentIndex];
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
    const parts = caption.split('::'); // e.g. 'Jatropha :: Butterfly Garden'
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
