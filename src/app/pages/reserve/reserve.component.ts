import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Plant } from '../../shared/models/plant-interface';
import { InventoryService } from '../../services/inventory.service';
import { ReservationService } from 'src/app/services/reservation.service';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css']
})
export class ReserveComponent {
  plants: Plant[] = [];
  holdHours: number = 72;
  customer = {
    name: '',
    email: '',
    message: ''
  };
  reservedItems: { plant: Plant; quantity: number }[] = [];
  orderQuantities: { [plantID: number]: number } = {};
  highlightedPlantID: number | null = null;

  constructor(
    private plantService: InventoryService,
    private router: Router,
    private reservationService: ReservationService,
  ) {}

  ngOnInit() {
    this.plantService.getAllPlants().subscribe(data => {
      this.plants = Object.values(data ?? {});
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

    const fullMessage = `Reservation Summary
${orderSummary}
`;

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


}

