import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Plant } from '../shared/models/plant-interface';
import { Category } from '../shared/models/category-interface';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(
    private firestore: AngularFirestore
  ) {}

  getAllPlants(onlyInStock: boolean = true): Observable<Plant[]> {
    return this.firestore
      .collection<Plant>('plants', (ref) => {
        let q: firebase.firestore.Query = ref as firebase.firestore.Query;
        if (onlyInStock) {
          // Inequality requires an orderBy on the same field
          q = q.where('inventory', '>=', 1).orderBy('inventory', 'asc');
          // If you ALSO want alpha sort, either:
          // 1) add q = q.orderBy('name', 'asc') AND create the composite index (inventory asc, name asc), or
          // 2) sort by name on the client after valueChanges()
        }
        return q;
      })
      .valueChanges({ idField: 'id' }) as Observable<Plant[]>;
    }

  getAllCategories(): Observable<Category[]> {
    return this.firestore
      .collection('categories', ref => ref.orderBy('sortOrder'))
      .valueChanges({ idField: 'slug' }) as Observable<Category[]>;
  }

  createPlant(plant: Omit<Plant, 'plantID'>): Promise<void> {
    const counterRef = this.firestore.collection('counters').doc('plantID');
    const plantsRef = this.firestore.collection('plants');

    return this.firestore.firestore.runTransaction(async transaction => {
      const counterSnap = await transaction.get(counterRef.ref);

      if (!counterSnap.exists) {
        throw new Error('plantID counter does not exist.');
      }

      const data = counterSnap.data() as { current: number };
      const current = data.current ?? 0;
      const newPlantID = current + 1;

      const newDocRef = plantsRef.doc(newPlantID.toString());

      transaction.set(newDocRef.ref, {
        ...plant,
        plantID: newPlantID,
      });

      transaction.update(counterRef.ref, { current: newPlantID });

      return;
    });
  }

  updatePlant (updates: Partial<Plant>): Promise<void> {
    if (updates.plantID == null) throw Error('Update but plantID not provided.');
    const id = updates.plantID.toString();
    
    return this.firestore.collection('plants').doc(id).update(updates);
  }

  deletePlant(id: string): Promise<void> {
    return this.firestore.collection('plants').doc(id).delete();
  }

  getPlantById(id: string): Observable<Plant | undefined> {
    return this.firestore.collection<Plant>('plants').doc(id).valueChanges({ idField: 'id' });
  }
}
