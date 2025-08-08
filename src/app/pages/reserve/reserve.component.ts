import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Plant } from '../../shared/models/plant-interface';
import { InventoryService } from '../../services/inventory.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { CATEGORY_LABELS } from 'src/app/utils/category-utils';
import { sortPlants } from '../../utils/plant-utils'

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css']
})
export class ReserveComponent {
  plants: Plant[] = [];
  filteredPlants: Plant[] = [];
  categories: string[] = [];
  selectedCategories: string[] = [];

  holdHours: number = 72;
  customer = {
    name: '',
    email: '',
    message: ''
  };
  reservedItems: { plant: Plant; quantity: number }[] = [];
  orderQuantities: { [plantID: number]: number } = {};
  highlightedPlantID: number | null = null;
  categoryLabelMap = CATEGORY_LABELS;
  sortOrder: 'name' | 'price' = 'name';

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private reservationService: ReservationService,
  ) {}

  ngOnInit() {
    this.inventoryService.getAllPlants().subscribe(data => {
      this.plants = Object.values(data ?? {});
      this.plants = sortPlants(this.plants, this.sortOrder)
      this.categories = [...new Set(this.plants.flatMap(p => p.categories))];
      this.updateFilteredPlants();
    });

    this.reservedItems = this.reservationService.getItems();
    this.highlightedPlantID = this.reservationService.getLastAddedPlantID();

    for (const item of this.reservedItems) {
      this.orderQuantities[item.plant.plantID] = item.quantity;
    }

    if (this.highlightedPlantID !== null) {
      setTimeout(() => {
        this.highlightedPlantID = null;
        this.reservationService.clearLastAddedPlantID();
      }, 2500);
    }
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

  get orderTotal() {
    return this.getSubtotal();
  }

  reserveOrder(): void {
    const orderedItems = this.reservedItems
      .filter(p => p.quantity > 0)
      .map(p => ({
        name: p.plant.name,
        id: p.plant.plantID,
        quantity: p.quantity,
        price: p.plant.price
      }));

    if (orderedItems.length === 0) {
      alert('Please select at least one plant to reserve.');
      return;
    }

    const orderSummary = orderedItems.map(item =>
      `${item.quantity} x ${item.name} ($${item.quantity * item.price})`
    ).join('\n');

    const fullMessage = `Reservation Summary\n${orderSummary}\n`;

    this.router.navigate(['/contact'], {
      queryParams: { message: fullMessage }
    });
  }

  updateQuantity(plantID: number, qty: number) {
    this.reservationService.updateQuantity(plantID, qty);
  }

  removeItem(plantID: number) {
    this.reservationService.remove(plantID);
    this.reservedItems = this.reservationService.getItems();
  }

  getSubtotal() {
    return this.reservedItems.reduce((acc, item) => {
      return acc + (item.quantity * item.plant.price);
    }, 0);
  }

  reservePlant(plant: Plant): void {
    this.reservationService.add(plant, 1);
    this.reservedItems = this.reservationService.getItems();
  }

  clear(): void {
    this.reservationService.clear();
    this.reservedItems = [];
  }

  scrollToPlant(plantID: number) {
    const el = document.getElementById(`plant-${plantID}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight');
      setTimeout(() => el.classList.remove('highlight'), 1000);
    }
  }

  onSelectionChange(newSelected: string[]) {
    this.selectedCategories = newSelected;
    this.updateFilteredPlants();
  }

}
