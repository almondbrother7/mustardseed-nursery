import { Component, OnInit } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Plant } from 'src/app/shared/models/plant-interface';
import { CATEGORY_LABELS } from 'src/app/utils/category-utils';

@Component({
  selector: 'app-plant-crud',
  templateUrl: './plant-crud.component.html',
  styleUrls: ['./plant-crud.component.css']
})
export class PlantCrudComponent implements OnInit {
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  isEditing = false;
  filteredPlants: Plant[] = [];
  categories: string[] = [];
  selectedCategories: string[] = [];
  categoryLabelMap = CATEGORY_LABELS;
  

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.getAllPlants().subscribe(data => {
      this.plants = Object.values(data ?? {});
      this.categories = [...new Set(this.plants.flatMap(p => p.categories))];
      this.updateFilteredPlants();
    });
  }

  onCategorySelectionChange(newSelected: string[]) {
    this.selectedCategories = newSelected;
    this.updateFilteredPlants();
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

  // createPlant() {
  //   const newPlant: Omit<Plant, 'plantID'> = {
  //     name: 'New Plant',
  //     slug: 'new-plant',
  //     price: 0,
  //     categories: [],
  //     inventory: 0,
  //     description: '',
  //     infoUrl: '',
  //     thumbnail: '',
  //     fullImage: ''
  //   };

  //   this.inventoryService.createPlant(newPlant);
  // }

  editPlant(plant: Plant) {
    this.selectedPlant = { ...plant };
    this.isEditing = true;
  }

  savePlant() {
    if (this.selectedPlant) {
      // TODO: You'll need to store and pass document ID for this
      const docId = this.selectedPlant.slug; // or use a real ID from Firestore
      this.inventoryService.updatePlant(docId, this.selectedPlant);
      this.isEditing = false;
      this.selectedPlant = null;
    }
  }

  deletePlant(plant: Plant) {
    const docId = plant.slug; // again, ensure you track the actual doc ID
    this.inventoryService.deletePlant(docId);
  }
}
