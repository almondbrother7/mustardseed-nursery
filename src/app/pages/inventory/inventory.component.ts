import { Component, ViewChild } from '@angular/core';
import { LightboxComponent } from 'src/app/shared/lightbox/lightbox.component';
import { Plant } from '../../shared/models/plant-interface';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { environment } from 'src/environments/environment';
import { staticPlants } from '../../data/static-plants';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class PlantInventoryComponent {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  selectedIndex = 0;
  selectedCategory!: string;
  plants: Plant[] = [];

  constructor(private router: Router,
    private inventoryService: InventoryService,
  ) {}

  get plantsFilteredByCategory(): Plant[] {
    return this.filterPlantsByCategory(this.selectedCategory);
  }

  ngOnInit(): void {
    this.selectedCategory = this.categories[this.selectedIndex];
    if (environment.useStaticData) {
      console.log("🧪 Using staticPlants (dev mode)");
      this.plants = staticPlants;
    } else {
      this.inventoryService.getAllPlants().subscribe((data) => {
        if (data?.length) {
          this.plants = data;
        }
      });
    }
  }

  filterPlantsByCategory(category?: string | null): Plant[] {
    if (category) this.selectedCategory = category;
    return this.plants.filter(plant => plant.categories?.includes(this.selectedCategory));
  }

  openLightbox(plant: Plant) {
    const categoryImages = this.plantsFilteredByCategory
      .filter(p => !!p.fullImage)
      .map(p => ({
        src: p.fullImage!,
        thumb: p.thumbnail,
        caption: `${p.name} : ${p.description ?? 'Visit the Gardening page for details'}`
      }));
    const index = categoryImages.findIndex(img => img.caption.startsWith(plant.name));
    if (index >= 0) {
      this.lightbox.open(categoryImages, index);
    }
  }
    
  onTabChange(index: number) {
    this.selectedCategory = this.categories[index];
  }

  onCategoryChange(newCategory: string): void {
    const index = this.categories.indexOf(newCategory);
    if (index !== -1) {
      this.selectedIndex = index;
      this.selectedCategory = this.categories[index];
    }
  }

  requestOrder(plant: Plant): void {
    const { plantID, name } = plant;
    const encoded = encodeURIComponent(name);
    this.router.navigate(['/contact'], { queryParams: { plantName: encoded, id: plantID } });
  }

  categories = [
    'Butterfly Garden',
    'Native Plants',
    'Flowering Plants',
    'Survival Garden',
    'Miscellaneous'
  ];

  categoryTaglines: Record<string, { tagline: string; description: string }> = {
    'Butterfly Garden': {
      tagline: 'Bring the pollinators!',
      description: 'These vibrant flowers attract butterflies and hummingbirds while beautifying your space.'
    },
    'Survival Garden': {
      tagline: 'Grow to thrive.',
      description: 'Nutritious and resilient plants perfect for self-sufficiency and sustainability.'
    },
    'Native Plants': {
      tagline: 'Florida tough, pollinator friendly.',
      description: 'Low-maintenance natives that thrive in your region and support local ecosystems.'
    },
    'Vegetables': {
      tagline: 'Fresh from the garden.',
      description: 'Grow your own delicious veggies and herbs for a healthy harvest.'
    },
    'Flowering Plants': {
      tagline: 'Blooms that wow.',
      description: 'Gorgeous blooms for color, fragrance, and visual impact.'
    },
    'Miscellaneous': {
      tagline: 'Unique & interesting.',
      description: 'A mix of plants that do not fit elsewhere but deserve a place in your garden.'
    }
  };

}