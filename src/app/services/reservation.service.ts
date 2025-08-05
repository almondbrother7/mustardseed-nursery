import { Injectable } from '@angular/core';
import { Plant } from '../shared/models/plant-interface';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly STORAGE_KEY = 'nursery-reserved-plants';
  private reservedPlants: { [plantID: string]: { plant: Plant; quantity: number } } = {};
  private lastAddedPlantID: number | null = null;
  private reservedCount$ = new BehaviorSubject<number>(0);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.reservedPlants = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load reservations from localStorage', e);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.reservedPlants));
    } catch (e) {
      console.error('Failed to save reservations to localStorage', e);
    }
  }

  add(plant: Plant, quantity: number = 1): void {
    const existing = this.reservedPlants[plant.plantID];

    const currentQty = existing ? existing.quantity : 0;
    const maxAllowed = plant.inventory;

    const newQty = Math.min(currentQty + quantity, maxAllowed);

    this.reservedPlants[plant.plantID] = {
      plant,
      quantity: newQty,
    };
    this.lastAddedPlantID = plant.plantID;

    this.saveToLocalStorage();
    this.updateCount();
  }


  updateQuantity(plantID: number, newQuantity: number): void {
    if (this.reservedPlants[plantID]) {
      this.reservedPlants[plantID].quantity = newQuantity;
      this.saveToLocalStorage();
      this.updateCount();
    }
  }

  remove(plantID: number): void {
    delete this.reservedPlants[plantID];
    this.saveToLocalStorage();
    this.updateCount();
  }

  getItems(): { plant: Plant; quantity: number }[] {
    return Object.values(this.reservedPlants);
  }

  clear(): void {
    this.reservedPlants = {};
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateCount();
  }

  getLastAddedPlantID(): number | null {
    return this.lastAddedPlantID;
  }

  clearLastAddedPlantID() {
    this.lastAddedPlantID = null;
  }

  private updateCount() {
    const count = Object.values(this.reservedPlants).reduce((sum, item) => sum + item.quantity, 0);
    this.reservedCount$.next(count);
  }

  updateReservedCountFromStorage() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    const items = Object.values(obj);
    const count = items.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0);
    this.reservedCount$.next(count);
  }

  getReservedCount(): Observable<number> {
    return this.reservedCount$.asObservable();
  }

}
