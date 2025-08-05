import { combineLatest } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { LightboxComponent } from 'src/app/shared/lightbox/lightbox.component';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { environment } from 'src/environments/environment';
import { staticCategories, staticPlants } from '../../data/static-data';
import { Plant } from '../../shared/models/plant-interface';
import { Category } from '../../shared/models/category-interface';
import { sortPlants } from '../../utils/plant-utils'
import { ReservationService } from 'src/app/services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class PlantInventoryComponent {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  plants: Plant[] = [];
  categories: Category[] = [];
  selectedIndex = 0;
  selectedCategory!: string;
  filteredByCategoryMap: { [slug: string]: Plant[] } = {};
  sortOrder: 'name' | 'price' = 'name';


  constructor(private router: Router,
    private inventoryService: InventoryService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (environment.useStaticData) {
      console.log("🧪 Using staticPlants (dev mode)");
      this.categories = staticCategories;
      this.plants = sortPlants(staticPlants, this.sortOrder)
        .filter(plant => plant.inventory >= 1)
      this.buildCategoryMap();
    } else {
        combineLatest([
          this.inventoryService.getAllCategories(),
          this.inventoryService.getAllPlants()
        ]).subscribe(([categories, plants]) => {
          this.categories = categories ?? [];
          this.plants = sortPlants((plants ?? []), this.sortOrder);
          this.buildCategoryMap();
        });
    }
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

  openLightbox(plant: Plant) {
    const categoryImages = this.plantsFilteredByCategory
      .filter(p => !!p.fullImage)
      .map(p => ({
        src: p.fullImage!,
        thumb: p.thumbnail,
        plantID: p.plantID,
        caption: `<a href='${p.infoUrl}' target='_blank' rel='noopener noreferrer'>${p.name}</a> : ${p.description ?? 'Visit the Gardening page for details'}`
      }));
    const index = categoryImages.findIndex(img => img.plantID === plant.plantID);
    if (index >= 0) {
      this.lightbox.open(categoryImages, index);
    }
  }
    
  onTabChange(index: number) {
    this.selectedIndex = index;
    this.selectedCategory = this.categories[index]?.slug;
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

}