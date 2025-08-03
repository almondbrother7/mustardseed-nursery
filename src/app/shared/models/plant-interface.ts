export interface Plant {
  plantID: number;
  name: string;
  slug: string;
  price: number;
  categories: string[];
  inventory: number;
  description?: string;
  infoUrl: string;
  thumbnail: string;
  fullImage?: string;
}