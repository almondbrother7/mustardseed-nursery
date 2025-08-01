export interface Plant {
  plantID: number;
  name: string;
  price: number;
  category: string;
  inventory: number;
  description?: string;
  infoUrl: string;
  thumbnail: string;
  fullImage?: string;
}