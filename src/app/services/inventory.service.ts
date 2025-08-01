import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plant } from '../shared/models/plant-interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(
    private firestore: AngularFirestore
  ) {}

  getAllPlants(): Observable<Plant[]> {
    return this.firestore
      .collection('plants')
      .valueChanges() as Observable<Plant[]>;
  }
}
