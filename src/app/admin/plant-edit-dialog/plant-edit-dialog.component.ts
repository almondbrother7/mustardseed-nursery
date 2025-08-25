import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plant } from 'src/app/shared/models/plant-interface';
import { slugify } from '../../utils/plant-utils'
import { Category } from 'src/app/shared/models/category-interface';

export interface PlantEditData {
  mode: 'add' | 'edit';
  plant: Plant;
  existingSlugs: string[];
  categories: Category[];
}

@Component({
  selector: 'app-plant-edit-dialog',
  templateUrl: './plant-edit-dialog.component.html',
  styleUrls: ['./plant-edit-dialog.component.css']
})
export class PlantEditDialogComponent {
  readonly IMAGE_STUB = 'assets/images/inventory/';
  readonly THUMB_STUB = 'assets/images/inventory/thumbs/';
  readonly INFO_BASE  = 'https://garden.org/plants/search/text/?q=';
  plant: Plant;
  mode: string;
  allCategories: Category[] = [];
  categoryLabelMap: { [key: string]: string };
  // categoryLabelMap: Record<string, string> = {};
  slugError = '';
  private originalName = '';
  private originalSlug = '';

  constructor(
    public dialogRef: MatDialogRef<PlantEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlantEditData
  ) {
    this.allCategories = (data.categories ?? []).slice().sort((a, b) =>
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
      (a.label ?? '').localeCompare(b.label ?? '', undefined, { sensitivity: 'base' })
    );
    this.mode = data.mode
    this.plant = data.plant;
    this.originalName = this.plant.name ?? '';
    this.originalSlug = (this.plant.slug ?? '').toLowerCase().trim();
    this.categoryLabelMap = Object.fromEntries(
      this.allCategories.map(c => [c.slug, c.label])
    );
  }

  onCategoriesChange(selectedSlugs: string[]): void {
    this.plant.categories = selectedSlugs;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if(!this.validatePlant()) {
      alert('Form is invalid.');
      return;
    }

    this.dialogRef.close(this.plant);
  }

  validatePlant(): boolean {
    this.slugError = '';

    // basic requireds
    const hasBasics =
      !!this.plant.name?.trim() &&
      !!this.plant.description?.trim() &&
      this.plant.price != null &&
      this.plant.inventory != null;
    if (!hasBasics) return false;

    const newSlug = slugify(this.plant.name);
    if (!newSlug) {
      this.slugError = 'Name results in an empty slug.';
      return false;
    }

    // Build set of existing slugs to check against
    const exists = new Set(this.data.existingSlugs.map(s => s.toLowerCase().trim()));

    // If editing and slug didn't change, skip dup check
    const slugChanged = newSlug !== this.originalSlug;
    if (slugChanged && exists.has(newSlug)) {
      this.slugError = `Slug "${newSlug}" already exists. Choose a different name.`;
      return false;
    }

    // Assign new slug and update dependent fields
    if (this.mode === 'edit') {
      // If user renamed the plant, replace old slug in fields
      if (slugChanged) {
        this.updateUrlsForRenamedSlug(this.originalSlug, newSlug);
      }
    } else {
      // add mode: build from stubs/bases
      this.ensureUrlsFromSlug(newSlug);
    }

    this.plant.slug = newSlug;
    return true;
  }

  private ensureUrlsFromSlug(slug: string) {
    if (!this.plant.infoUrl || this.plant.infoUrl === this.INFO_BASE || this.plant.infoUrl.endsWith('?q=')) {
      this.plant.infoUrl = this.INFO_BASE + slug;
    }
    if (!this.plant.thumbnail || this.plant.thumbnail === this.THUMB_STUB || this.plant.thumbnail.endsWith('/thumbs/')) {
      this.plant.thumbnail = this.THUMB_STUB + slug;
    }
    if (!this.plant.fullImage || this.plant.fullImage === this.IMAGE_STUB || this.plant.fullImage.endsWith('/inventory/')) {
      this.plant.fullImage = this.IMAGE_STUB + slug;
    }
  }

  /** For edit mode: replace last path segment oldSlug -> newSlug, or rebuild from base if still stub */
  private updateUrlsForRenamedSlug(oldSlug: string, newSlug: string) {
    this.plant.infoUrl = this.replaceSlugOrBuild(this.plant.infoUrl, this.INFO_BASE, oldSlug, newSlug, /*queryMode*/ true);
    this.plant.thumbnail = this.replaceSlugOrBuild(this.plant.thumbnail, this.THUMB_STUB, oldSlug, newSlug);
    this.plant.fullImage = this.replaceSlugOrBuild(this.plant.fullImage, this.IMAGE_STUB, oldSlug, newSlug);
  }

  /**
   * If current starts with base, just base+newSlug.
   * Else if it ends with oldSlug (as last path segment), swap it.
   * Else leave as-is (user may have custom path).
   * queryMode=true handles INFO_BASE ending in '?q=' rather than a path.
   */
  private replaceSlugOrBuild(current: string | undefined, base: string, oldSlug: string, newSlug: string, queryMode = false): string {
    const cur = (current ?? '').trim();
    if (!cur || cur === base || cur.endsWith(queryMode ? '?q=' : '/')) {
      return base + newSlug;
    }

    if (queryMode) {
      // e.g. https://.../?q=oldSlug
      const idx = cur.lastIndexOf('?q=');
      if (idx >= 0) {
        const prefix = cur.slice(0, idx + 3); // include '?q='
        return prefix + newSlug;
      }
      return cur; // unknown format; don't touch
    }

    // path mode: replace last segment if it equals oldSlug
    try {
      const url = new URL(cur, 'https://dummy.local'); // supports absolute/relative
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length && parts[parts.length - 1] === oldSlug) {
        parts[parts.length - 1] = newSlug;
        const rebuilt = '/' + parts.join('/') + (cur.endsWith('/') ? '/' : '');
        // drop dummy origin for relative inputs
        return cur.startsWith('http') ? url.origin + rebuilt : rebuilt;
      }
    } catch {
      // not a valid absolute URL -> treat as relative path
      const segs = cur.split('/').filter(Boolean);
      if (segs.length && segs[segs.length - 1] === oldSlug) {
        segs[segs.length - 1] = newSlug;
        return (cur.startsWith('/') ? '/' : '') + segs.join('/') + (cur.endsWith('/') ? '/' : '');
      }
    }

    return cur; // didn't match oldSlug; leave untouched
  }

}
