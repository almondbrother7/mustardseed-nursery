import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { Plant } from '../../shared/models/plant-interface';
import { InventoryService } from '../../services/inventory.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { sortPlants } from '../../utils/plant-utils'
import { normalizeAssetPath as normalizeAssetPathFn, safeHref as safeHrefFn, DEFAULT_THUMB, DEFAULT_FULL } from '../../utils/utils';
import { ConfigService } from 'src/app/services/config.service';
import { Category } from 'src/app/shared/models/category-interface';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css']
})
export class ReserveComponent implements OnInit, AfterViewInit {
  plants: Plant[] = [];
  filteredPlants: Plant[] = [];
  categories: Category[] = [];
  categorySlugs: string[] = [];
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
  categoryLabelMap: { [key: string]: string } = {};
  sortField: 'name' | 'price' = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  normalizeAssetPath = normalizeAssetPathFn;
  safeHref = safeHrefFn;
  public defaultThumb = DEFAULT_THUMB;
  public defaultFull  = DEFAULT_FULL;

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private reservationService: ReservationService,
    private configService: ConfigService,
  ) {}

  ngOnInit() {
    const cfg = this.configService.defaults;
    this.sortField = cfg.sortField;
    this.sortDir = cfg.sortDir;

    combineLatest([
      this.inventoryService.getAllCategories(),
      this.inventoryService.getAllPlants(false),
    ]).subscribe(([categories, plants]) => {
      this.categories = (categories ?? [])
        .slice()
        .filter(c => c.showOnReserve)
        .sort((a, b) =>
          (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
          (a.label ?? '').localeCompare(b.label ?? '', undefined, { sensitivity: 'base' })
        );

      this.categoryLabelMap = Object.fromEntries(
        this.categories.map(c => [c.slug, c.label])
      );
      this.categorySlugs = this.categories.map(c => c.slug);
      this.plants = Array.isArray(plants) ? plants : Object.values(plants ?? {});
      this.updateFilteredPlants();

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
    });
  }

  ngAfterViewInit(): void {
    // Force change detection so mat-button-toggle shows default state
    Promise.resolve().then(() => this.sortDir = this.sortDir);
  }

  public onImgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (img && !img.src.endsWith(this.defaultThumb)) {
      img.src = this.defaultThumb;
    }
  }

  updateFilteredPlants(): void {
    const base = !this.selectedCategories.length
      ? this.plants
      : this.plants.filter(p =>
          (p.categories ?? []).some(c => this.selectedCategories.includes(c))
        );
    this.filteredPlants = sortPlants(base, this.sortField, this.sortDir);
  }

  onSortChange(field: 'name' | 'price') {
    this.sortField = field;
    this.updateFilteredPlants();
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

  expressInterest(plant: Plant) {
    const msg = this.reservationService.buildInterestMessage(plant);
    this.reservationService.goToContactWithPrefill(msg, { mode: 'interest', returnPath: '/inventory' });
  }

}
