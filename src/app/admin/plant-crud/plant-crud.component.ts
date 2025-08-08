import { Component, OnInit } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Plant } from 'src/app/shared/models/plant-interface';
import { CATEGORY_LABELS } from 'src/app/utils/category-utils';
import { PlantEditDialogComponent } from '../plant-edit-dialog/plant-edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { sortPlants } from '../../utils/plant-utils'

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
  categories: string[] = [];
  selectedCategories: string[] = [];
  categoryLabelMap = CATEGORY_LABELS;
  sortOrder: 'name' | 'price' = 'name';

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.inventoryService.getAllPlants(false).subscribe(data => {
      this.plants = Object.values(data ?? {});
      this.plants = sortPlants(this.plants, this.sortOrder)      
      this.categories = [...new Set(this.plants.flatMap(p => p.categories))];
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
        existingSlugs: Array.from(this.getExistingSlugs(plant.plantID))
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
        existingSlugs: Array.from(this.getExistingSlugs())
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
      this.plants
        .filter(p => p.slug && p.plantID !== excludePlantID)
        .map(p => p.slug!.toLowerCase().trim())
    );
  }


}
