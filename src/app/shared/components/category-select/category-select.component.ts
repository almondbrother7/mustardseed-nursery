// src/app/shared/components/category-select/category-select.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.css']
})
export class CategorySelectComponent {
  @Input() selectedCategories: string[] = [];
  @Input() categories: string[] = [];
  @Input() categoryLabelMap: { [key: string]: string } = {};

  @Output() selectionChange = new EventEmitter<string[]>();

  constructor(private inventoryService: InventoryService) {}

  onSelectionChange(event: any): void {
    this.selectionChange.emit(event.value);
  }
}
