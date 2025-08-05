import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Plant } from '../shared/models/plant-interface';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-order-online',
  templateUrl: './order-online.component.html',
  styleUrls: ['./order-online.component.css']
})
export class OrderOnlineComponent {
  plants: Plant[] = [];
  orderQuantities: { [plantID: number]: number } = {};


  customer = {
    name: '',
    email: '',
    message: ''
  };

  constructor(
    private plantService: InventoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.plantService.getAllPlants().subscribe(data => {
      this.plants = Object.values(data ?? {});
    });
  }

  get selectedItems() {
    return this.plants
      .filter(p => this.orderQuantities[p.plantID] > 0)
      .map(p => ({
        plantID: p.plantID,
        name: p.name,
        quantity: this.orderQuantities[p.plantID],
        price: p.price
      }));
  }

  get orderTotal() {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  submitOrder(): void {
    const orderedItems = this.plants
      .filter(p => this.orderQuantities[p.plantID] > 0)
      .map(p => ({
        name: p.name,
        id: p.plantID,
        quantity: this.orderQuantities[p.plantID],
        price: p.price
      }));

    if (orderedItems.length === 0) {
      alert('Please select at least one plant to order.');
      return;
    }

    const orderSummary = orderedItems.map(item =>
      `${item.quantity} x ${item.name} ($${item.quantity * item.price})`
    ).join('\n');
    const total = orderedItems.reduce((acc, item) => {
      return acc + (item.quantity * item.price);
    }, 0);

    const fullMessage = `Order Details:
${orderSummary}
Total: $${total}
`;

    this.router.navigate(['/contact'], {
      queryParams: { message: fullMessage }
    });
  }
}
