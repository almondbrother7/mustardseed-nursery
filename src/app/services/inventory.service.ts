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
        // .orderBy('name') -- barfs unless sort on inventory first
      )
      .valueChanges({ idField: 'id' }) as unknown as Observable<Plant[]>;
  }

  getAllCategories(): Observable<Category[]> {
    return this.firestore
      .collection('categories', ref => ref.orderBy('sortOrder'))
      .valueChanges({ idField: 'slug' }) as Observable<Category[]>;
  }

  createPlant(plant: Plant): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore
      .collection('plants')
      .doc(id)
      .set({ ...plant, plantID: Number(id) });
  }

  createPlantWithCounter(plant: Omit<Plant, 'plantID'>): Promise<void> {
    const counterRef = this.firestore.collection('counters').doc('plantID');
    const plantsRef = this.firestore.collection('plants');

    return this.firestore.firestore.runTransaction(async transaction => {
      const counterSnap = await transaction.get(counterRef.ref);
      // console.log(Object.getPrototypeOf(counterSnap));

      if (!counterSnap.exists) {
        throw new Error('plantID counter does not exist.');
      }

      const data = counterSnap.data() as { current: number };
      const current = data.current ?? 0;
      const newID = current + 1;

      const newDocRef = plantsRef.doc(); // Generate a Firestore doc with random ID

      transaction.set(newDocRef.ref, {
        ...plant,
        plantID: newID
      });

      transaction.update(counterRef.ref, { current: newID });

      return;
    });
  }



  updatePlant(id: string, updates: Partial<Plant>): Promise<void> {
    return this.firestore.collection('plants').doc(id).update(updates);
  }

  deletePlant(id: string): Promise<void> {
    return this.firestore.collection('plants').doc(id).delete();
  }

  getPlantById(id: string): Observable<Plant | undefined> {
    return this.firestore.collection<Plant>('plants').doc(id).valueChanges({ idField: 'id' });
  }
}
