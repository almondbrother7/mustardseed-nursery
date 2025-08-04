import { Category } from '../shared/models/category-interface';
import { Plant } from '../shared/models/plant-interface';

export const staticCategories: Category[] = [
  {
    slug: "butterfly-garden",
    label: "Butterfly Garden",
    icon: "🦋",
    sortOrder: 1,
    tagline: "Bring the pollinators!",
    description: "These vibrant flowers attract butterflies and hummingbirds while beautifying your space."
  },
  {
    slug: "native-plants",
    label: "Native Plants",
    icon: "🌿",
    sortOrder: 2,
    tagline: "Florida tough, pollinator friendly.",
    description: "Low-maintenance natives that thrive in your region and support local ecosystems."
  },
  {
    slug: "flowering-plants",
    label: "Flowering Plants",
    icon: "🌸",
    sortOrder: 3,
    tagline: "Blooms that wow.",
    description: "Gorgeous blooms for color, fragrance, and visual impact."
  },
  {
    slug: "survival-garden",
    label: "Survival Garden",
    icon: "🥬",
    sortOrder: 4,
    tagline: "Grow to thrive.",
    description: "Nutritious and resilient plants perfect for self-sufficiency and sustainability."
  },
  {
    slug: "miscellaneous",
    label: "Miscellaneous",
    icon: "🌾",
    sortOrder: 5,
    tagline: "Unique & interesting.",
    description: "A mix of plants that do not fit elsewhere but deserve a place in your garden."
  }
];

export const staticPlants: Plant[] = [
  {
    "plantID": 10,
    "name": "Barbados Cherry",
    "slug": "barbados-cherry",
    "categories": [
      "miscellaneous"
    ],
    "thumbnail": "assets/images/inventory/thumbs/barbados-cherry.jpg",
    "fullImage": "assets/images/inventory/barbados-cherry.jpg",
    "description": "Prolific cherry tree native to the islands.",
    "price": 10,
    "inventory": 2,
    "infoUrl": "https://example.com/barbados-cherry"
  },
  // {
  //   "plantID": 3,
  //   "name": "Blue Porterweed",
  //   "slug": "blue-porterweed",
  //   "categories": [
  //     "native-plants",
  //     "butterfly-garden"
  //   ],
  //   "thumbnail": "assets/images/inventory/thumbs/blue-porterweed.jpg",
  //   "fullImage": "assets/images/inventory/blue-porterweed.jpg",
  //   "description": "Lavender-blue nectar spikes loved by butterflies.",
  //   "price": 5,
  //   "inventory": 8,
  //   "infoUrl": "https://example.com/blue-porterweed"
  // },
  {
    "plantID": 8,
    "name": "Cassava",
    "slug": "cassava",
    "categories": [
      "survival-garden"
    ],
    "thumbnail": "assets/images/inventory/thumbs/cassava.jpg",
    "fullImage": "assets/images/inventory/cassava.jpg",
    "description": "Staple root crop, edible leaves.",
    "price": 7,
    "inventory": 0,
    "infoUrl": "https://example.com/cassava"
  },
  {
    "plantID": 5,
    "name": "Curcuma",
    "slug": "curcuma",
    "categories": [
      "flowering-plants"
    ],
    "thumbnail": "assets/images/inventory/thumbs/curcuma.jpg",
    "fullImage": "assets/images/inventory/curcuma.jpg",
    "description": "Exotic cone-like tropical blooms.",
    "price": 10,
    "inventory": 0,
    "infoUrl": "https://example.com/curcuma"
  },
  {
    "plantID": 6,
    "name": "Double Knockout Rose",
    "slug": "double-knockout-rose",
    "categories": [
      "flowering-plants"
    ],
    "thumbnail": "assets/images/inventory/thumbs/knockout-rose.jpg",
    "fullImage": "assets/images/inventory/knockout-rose.jpg",
    "description": "Continuous blooming, disease-resistant rose.",
    "price": 15,
    "inventory": 0,
    "infoUrl": "https://example.com/knockout-rose"
  },
  {
    "plantID": 11,
    "name": "Hawaiian Beauty",
    "slug": "hawaiian-beauty",
    "categories": [
      "miscellaneous"
    ],
    "thumbnail": "assets/images/inventory/thumbs/hawaiian-beauty.jpg",
    "fullImage": "assets/images/inventory/hawaiian-beauty.jpg",
    "description": "AKA red morning glory - prolific vine full of flowers",
    "price": 15,
    "inventory": 0,
    "infoUrl": "https://example.com/hawaiian-beauty"
  },
  {
    "plantID": 9,
    "name": "Longevity Spinach",
    "slug": "longevity-spinach",
    "categories": [
      "survival-garden"
    ],
    "thumbnail": "assets/images/inventory/thumbs/longevity-spinach.jpg",
    "fullImage": "assets/images/inventory/longevity-spinach.jpg",
    "description": "Nutrient-packed perennial leafy green.",
    "price": 5,
    "inventory": 7,
    "infoUrl": "https://example.com/longevity-spinach"
  },
  {
    "plantID": 7,
    "name": "Rangoon Creeper",
    "slug": "rangoon-creeper",
    "categories": [
      "flowering-plants"
    ],
    "thumbnail": "assets/images/inventory/thumbs/rangoon-creeper.jpg",
    "fullImage": "assets/images/inventory/rangoon-creeper.jpg",
    "description": "Beautiful vine covered in white, pink & deep red flowers.",
    "price": 15,
    "inventory": 0,
    "infoUrl": "https://example.com/rangoon-creeper"
  },
  {
    "plantID": 2,
    "name": "Tropical Sage",
    "slug": "tropical-sage",
    "categories": [
      "butterfly-garden"
    ],
    "thumbnail": "assets/images/inventory/thumbs/tropical-sage.jpg",
    "fullImage": "assets/images/inventory/tropical-sage.jpg",
    "description": "Scarlet red sage flowers loved by pollinators.",
    "price": 5,
    "inventory": 12,
    "infoUrl": "https://example.com/tropical-sage"
  },
  {
    "plantID": 4,
    "name": "Vinca",
    "slug": "vinca",
    "categories": [
      "native-plants"
    ],
    "thumbnail": "assets/images/inventory/thumbs/vinca.jpg",
    "fullImage": "assets/images/inventory/vinca.jpg",
    "description": "Hardy groundcover with lavender blooms.",
    "price": 4,
    "inventory": 0,
    "infoUrl": "https://example.com/vinca"
  }
]
.filter(p => p.inventory >= 1) // matching the filter on api call to firestore.