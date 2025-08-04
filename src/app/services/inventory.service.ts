import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Plant } from '../shared/models/plant-interface';
import { Category } from '../shared/models/category-interface';


@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(
    private firestore: AngularFirestore
  ) {}

  getAllPlants(): Observable<Plant[]> {
    return this.firestore
      .collection('plants', ref =>
        ref.where('inventory', '>=', 1)
        // .orderBy('name') -- barfs unless sort on inventory first, since where having equality!
      )
      .valueChanges() as Observable<Plant[]>;
  }

  getAllCategories(): Observable<Category[]> {
    return this.firestore
      .collection('categories', ref => ref.orderBy('sortOrder'))
      .valueChanges({ idField: 'slug' }) as Observable<Category[]>;
  }
}
