import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

export interface CatalogConfig {
  priorityTab?: string;
  showOutOfStock?: boolean;
  defaultSortField?: 'name' | 'price';
  defaultSortDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private cache: CatalogConfig | null = null;

  constructor(private afs: AngularFirestore) {}

  async getCatalogConfig(): Promise<CatalogConfig> {
    if (this.cache) return this.cache;
    const docRef = this.afs.doc<CatalogConfig>('config/catalogSettings');
    const docSnap = await firstValueFrom(docRef.get());
    this.cache = docSnap.data() || {};

    return this.cache;
  }

  get config(): CatalogConfig {
    return this.cache ?? {};
  }

  get defaults() {
    return {
      sortField: this.config.defaultSortField ?? 'name' as const,
      sortDir: this.config.defaultSortDir ?? 'asc' as const,
      showOutOfStock: this.config.showOutOfStock ?? false,
      priorityTab: this.config.priorityTab ?? undefined
    };
  }
}
