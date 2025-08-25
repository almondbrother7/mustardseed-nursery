import { Component, OnInit } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Plant } from 'src/app/shared/models/plant-interface';
import { PlantEditDialogComponent } from '../plant-edit-dialog/plant-edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { sortPlants } from '../../utils/plant-utils'
import { combineLatest } from 'rxjs';
import { Category } from 'src/app/shared/models/category-interface';

@Component({
  selector: 'app-plant-crud',
  templateUrl: './plant-crud.component.html',
  styleUrls: ['./plant-crud.component.css']
})
export class PlantCrudComponent implements OnInit {
  readonly IMAGE_STUB = 'assets/images/inventory/';
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  isEditing = false;
  filteredPlants: Plant[] = [];
  categories: Category[] = [];
  categorySlugs: string[] = [];
  selectedCategories: string[] = [];
  categoryLabelMap: { [key: string]: string } = {};
  sortOrder: 'name' | 'price' = 'name';

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.inventoryService.getAllCategories(),
      this.inventoryService.getAllPlants(false),
    ]).subscribe(([categories, plants]) => {
      this.categories = (categories ?? [])
        .slice()
        .sort((a, b) =>
          (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
          (a.label ?? '').localeCompare(b.label ?? '', undefined, { sensitivity: 'base' })
        );

      this.categoryLabelMap = Object.fromEntries(
        this.categories.map(c => [c.slug, c.label])
      );
      this.categorySlugs = this.categories.map(c => c.slug);
      this.plants = sortPlants(plants, this.sortOrder);

      this.updateFilteredPlants();
    });
  }

  onCategorySelectionChange(newSelected: string[]) {
    this.selectedCategories = newSelected;
    this.updateFilteredPlants();
  }

  needsImage(plant: Plant): boolean {
    const path = (plant.fullImage ?? '').trim();
    return !path || path === this.IMAGE_STUB;
  }

  updateFilteredPlants(): void {
    if (!this.selectedCategories.length) {
      this.filteredPlants = this.plants;
    } else {
      this.filteredPlants = this.plants.filter(plant =>
        plant.categories.some(cat => this.selectedCategories.includes(cat))
      );
    }
  }

  createPlant(newPlant: Plant): void {
    this.inventoryService.createPlant(newPlant);
  }

  editPlant(plant: Plant): void {
    const dialogRef = this.dialog.open(PlantEditDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        plant: { ...plant },
        existingSlugs: Array.from(this.getExistingSlugs(plant.plantID)),
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe((result: Plant | undefined) => {
      if (result) this.inventoryService.updatePlant(result);
    });
  }

  savePlant() {
    if (this.selectedPlant) {
      this.inventoryService.updatePlant(this.selectedPlant);
      this.isEditing = false;
      this.selectedPlant = null;
    }
  }

  deletePlant(plant: Plant) {
    const docId = plant.plantID.toString();
    this.inventoryService.deletePlant(docId);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PlantEditDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        plant: {
          plantID: 0,
          name: '',
          slug: '',
          price: 0,
          categories: [],
          inventory: 0,
          description: '',
          infoUrl: 'https://garden.org/plants/search/text/?q=',
          thumbnail: 'assets/images/inventory/thumbs/',
          fullImage: 'assets/images/inventory/'
        },
        existingSlugs: Array.from(this.getExistingSlugs()),
        categories: this.categories,
      }
    });

    dialogRef.afterClosed().subscribe((result: Plant | undefined) => {
      if (!result) return;
      result.plantID === 0
        ? this.inventoryService.createPlant(result)
        : this.inventoryService.updatePlant(result);
    });
  }

  private getExistingSlugs(excludePlantID?: number): Set<string> {
    return new Set(
      this.categorySlugs
      // TODO: when editing, will have plantID to exclude.
      // this.plants
      //   .filter(p => p.slug && p.plantID !== excludePlantID)
      //   .map(p => p.slug!.toLowerCase().trim())
    );
  }


}
