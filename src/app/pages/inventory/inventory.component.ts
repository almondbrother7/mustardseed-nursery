import { Component, ViewChild } from '@angular/core';
import { LightboxComponent } from 'src/app/shared/lightbox/lightbox.component';
import { Plant } from '../../shared/models/plant-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class PlantInventoryComponent {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;

  constructor(private router: Router) {}

  selectedCategory = 'Butterfly Garden';
  selectedIndex = 0;

  get filteredPlants(): Plant[] {
    return this.plants.filter(p => p.category === this.selectedCategory);
  }

  filteredPlantsByCategory(category: string): Plant[] {
    return this.filteredPlants.filter(p => p.category === category);
  }

  openLightbox(plant: Plant) {
    const categoryImages = this.filteredPlants
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

  plants: Plant[] = [
    {
      plantID: 1,
      name: 'Jatropha',
      category: 'Butterfly Garden',
      thumbnail: 'assets/images/inventory/thumbs/jatropha.jpg',
      fullImage: 'assets/images/inventory/jatropha.jpg',
      description: 'Vibrant red tropical flowers attract butterflies.',
      price: 8,
      inventory: 6,
      infoUrl: 'https://example.com/jatropha'
    },
    {
      plantID: 2,
      name: 'Tropical Sage',
      category: 'Butterfly Garden',
      thumbnail: 'assets/images/inventory/thumbs/tropical-sage.jpg',
      fullImage: 'assets/images/inventory/tropical-sage.jpg',
      description: 'Scarlet red sage flowers loved by pollinators.',
      price: 5,
      inventory: 12,
      infoUrl: 'https://example.com/tropical-sage'
    },
    {
      plantID: 3,
      name: 'Blue Porterweed',
      category: 'Native Plants',
      thumbnail: 'assets/images/inventory/thumbs/blue-porterweed.jpg',
      fullImage: 'assets/images/inventory/blue-porterweed.jpg',
      description: 'Lavender-blue nectar spikes loved by butterflies.',
      price: 5,
      inventory: 8,
      infoUrl: 'https://example.com/blue-porterweed'
    },
    {
      plantID: 4,
      name: 'Vinca',
      category: 'Native Plants',
      thumbnail: 'assets/images/inventory/thumbs/vinca.jpg',
      fullImage: 'assets/images/inventory/vinca.jpg',
      description: 'Hardy groundcover with lavender blooms.',
      price: 4,
      inventory: 10,
      infoUrl: 'https://example.com/vinca'
    },
    {
      plantID: 5,
      name: 'Curcuma',
      category: 'Flowering Plants',
      thumbnail: 'assets/images/inventory/thumbs/curcuma.jpg',
      fullImage: 'assets/images/inventory/curcuma.jpg',
      description: 'Exotic cone-like tropical blooms.',
      price: 10,
      inventory: 4,
      infoUrl: 'https://example.com/curcuma'
    },
    {
      plantID: 6,
      name: 'Double Knockout Rose',
      category: 'Flowering Plants',
      thumbnail: 'assets/images/inventory/thumbs/knockout-rose.jpg',
      fullImage: 'assets/images/inventory/knockout-rose.jpg',
      description: 'Continuous blooming, disease-resistant rose.',
      price: 15,
      inventory: 3,
      infoUrl: 'https://example.com/knockout-rose'
    },
    {
      plantID: 7,
      name: 'Rangoon Creeper',
      category: 'Flowering Plants',
      thumbnail: 'assets/images/inventory/thumbs/rangoon-creeper.jpg',
      fullImage: 'assets/images/inventory/rangoon-creeper.jpg',
      description: 'Beautiful vine covered in white, pink & deep red flowers.',
      price: 15,
      inventory: 5,
      infoUrl: 'https://example.com/rangoon-creeper'
    },
    {
      plantID: 8,
      name: 'Cassava',
      category: 'Survival Garden',
      thumbnail: 'assets/images/inventory/thumbs/cassava.jpg',
      fullImage: 'assets/images/inventory/cassava.jpg',
      description: 'Staple root crop, edible leaves.',
      price: 7,
      inventory: 9,
      infoUrl: 'https://example.com/cassava'
    },
    {
      plantID: 9,
      name: 'Longevity Spinach',
      category: 'Survival Garden',
      thumbnail: 'assets/images/inventory/thumbs/longevity-spinach.jpg',
      fullImage: 'assets/images/inventory/longevity-spinach.jpg',
      description: 'Nutrient-packed perennial leafy green.',
      price: 5,
      inventory: 7,
      infoUrl: 'https://example.com/longevity-spinach'
    },
    {
      plantID: 10,
      name: 'Barbados Cherry',
      category: 'Miscellaneous',
      thumbnail: 'assets/images/inventory/thumbs/barbados-cherry.jpg',
      fullImage: 'assets/images/inventory/barbados-cherry.jpg',
      description: 'Prolific cherry tree native to the islands.',
      price: 10,
      inventory: 2,
      infoUrl: 'https://example.com/barbados-cherry'
    },
    {
      plantID: 11,
      name: 'Hawaiian Beauty',
      category: 'Miscellaneous',
      thumbnail: 'assets/images/inventory/thumbs/hawaiian-beauty.jpg',
      fullImage: 'assets/images/inventory/hawaiian-beauty.jpg',
      description: 'AKA red morning glory - prolific vine full of flowers',
      price: 15,
      inventory: 6,
      infoUrl: 'https://example.com/hawaiian-beauty'
    }
  ];



}
