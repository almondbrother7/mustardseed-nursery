// src/app/shared/components/category-select/category-select.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Category } from '../../models/category-interface';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.css']
})
export class CategorySelectComponent {
  @Input() selectedCategories: string[] = [];
  @Input() categories: Category[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();

  constructor(private inventoryService: InventoryService) {}

  onSelectionChange(event: { value: string[] }): void {
    this.selectionChange.emit(event.value);
  }
}
