import { Component } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Plant } from 'src/app/shared/models/plant-interface';

@Component({
  selector: 'app-plant-crud',
  templateUrl: './plant-crud.component.html',
  styleUrls: ['./plant-crud.component.css']
})
export class PlantCrudComponent {

  constructor(private inventoryService: InventoryService) {}

  createTestPlant(): void {
    this.inventoryService.createPlantWithCounter({
      name: 'Test Plant',
      slug: 'test-plant',
      price: 4.99,
      categories: ['Butterfly Garden'],
      inventory: 10,
      description: 'Automatically created plant with incremented ID',
      infoUrl: 'https://your-default-link.com',
      thumbnail: '',
      fullImage: ''
    }).then(() => {
      console.log('✅ Plant created with incremented plantID!');
    }).catch(err => {
      console.error('❌ Failed to create plant:', err);
    });
  }


}
