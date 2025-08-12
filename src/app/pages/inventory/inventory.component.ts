import { combineLatest } from 'rxjs';
import { Component, OnInit, AfterViewInit,  ViewChild } from '@angular/core';
import { LightboxComponent } from 'src/app/shared/lightbox/lightbox.component';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { environment } from 'src/environments/environment';
import { staticCategories, staticPlants } from '../../data/static-data';
import { Plant } from '../../shared/models/plant-interface';
import { Category } from '../../shared/models/category-interface';
import { sortPlants } from '../../utils/plant-utils'
import { normalizeAssetPath as normalizeAssetPathFn, safeHref as safeHrefFn, DEFAULT_THUMB, DEFAULT_FULL } from '../../utils/utils';
import { ReservationService } from 'src/app/services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class PlantInventoryComponent implements OnInit, AfterViewInit {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;

  normalizeAssetPath = normalizeAssetPathFn;
  safeHref = safeHrefFn;
  public defaultThumb = DEFAULT_THUMB;
  public defaultFull  = DEFAULT_FULL;

  plants: Plant[] = [];
  allPlants: Plant[] = []; 
  categories: Category[] = [];
  selectedIndex = 0;
  selectedCategory!: string;
  filteredByCategoryMap: { [slug: string]: Plant[] } = {};
  sortOrder: 'name' | 'price' = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  showOutOfStock = true;


  constructor(private router: Router,
    private inventoryService: InventoryService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (environment.useStaticData) {
      console.log("🧪 Using staticPlants (dev mode)");
      this.categories = staticCategories;
      this.allPlants = staticPlants;
      this.recompute(); 
    } else {
      combineLatest([
        this.inventoryService.getAllCategories(),
        this.inventoryService.getAllPlants(false)
      ]).subscribe(([categories, plants]) => {
        this.categories = categories ?? [];
        this.allPlants = plants ?? [];
        this.recompute();
      });
    }
  }

  ngAfterViewInit(): void {
    // Force change detection so mat-button-toggle shows default state
    Promise.resolve().then(() => this.sortDir = this.sortDir);
  }


  private recompute(): void {
    const sorted = sortPlants(this.allPlants, this.sortOrder, this.sortDir);
    const visible = this.showOutOfStock
      ? sorted
      : sorted.filter(p => (p.inventory ?? 0) > 0);

    this.plants = visible;
    this.buildCategoryMap();
  }

buildCategoryMap(): void {
    this.filteredByCategoryMap = this.categories.reduce((acc, category) => {
      acc[category.slug] = this.plants.filter(plant =>
        plant.categories?.includes(category.slug)
      );
      return acc;
    }, {} as { [slug: string]: Plant[] });

    if (!this.selectedCategory && this.categories.length) {
      this.selectedCategory = this.categories[0].slug;
    }
  }

  get plantsFilteredByCategory(): Plant[] {
    return this.filteredByCategoryMap[this.selectedCategory] || [];
  }

  onTabChange(index: number) {
    this.selectedIndex = index;
    this.selectedCategory = this.categories[index]?.slug;
  }

  applyFilterSort(): void {
    this.recompute();
  }

  openLightbox(plant: Plant) {
    // Build the gallery for the *current category* with normalized paths + fallbacks
    const categoryImages = (this.plantsFilteredByCategory ?? [])
      .map(p => {
        const full  = this.normalizeAssetPath(p.fullImage) ?? this.defaultFull;
        const thumb = this.normalizeAssetPath(p.thumbnail) ?? this.defaultThumb;

        const href = this.safeHref(p.infoUrl);
        const nameHtml = href
          ? `<a href='${href}' target='_blank' rel='noopener noreferrer'>${p.name}</a>`
          : `${p.name}`;

        const desc = p.description?.trim() || 'Visit the Gardening page for details';

        return {
          src: full,
          thumb,
          plantID: p.plantID,
          caption: `${nameHtml} : ${desc}`
        };
      });

    const index = categoryImages.findIndex(img => img.plantID === plant.plantID);

    if (index >= 0 && categoryImages.length) {
      // console.log('[LB] opening:', categoryImages[index]);
      this.lightbox.open(categoryImages, index);
    } else if (categoryImages.length) {
      this.lightbox.open(categoryImages, 0);
    }
  }

  onCategoryChange(newCategorySlug: string): void {
    const index = this.categories.findIndex(c => c.slug === newCategorySlug);
    if (index > -1) {
      this.selectedIndex = index;
      this.selectedCategory = newCategorySlug;
    }
  }

  reservePlant(plant: Plant): void {
    this.reservationService.add(plant, 1);
    this.snackBar.open(`${plant.name} added to your reservation.`, 'View', { duration: 3000 })
      .onAction().subscribe(() => this.router.navigate(['/reserve']));
  }

  onImgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (img && !img.src.endsWith(this.defaultThumb)) {
      img.src = this.defaultThumb;
    }
  }

  expressInterest(plant: Plant) { 
    const msg = this.reservationService.buildInterestMessage(plant);
    this.reservationService.goToContactWithPrefill(msg, {
      mode: 'interest',
      returnPath: '/inventory',
      // newTab: true, // ← uncomment to open Contact in a new tab
    });
  }

}