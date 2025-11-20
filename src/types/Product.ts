export interface Product {
  id: number;
  name: string;
  liter: number;
  price: number;
  description: string;
  image: string;
  badge?: string;
  rating?: number;
  deliveryCharge: number;
  grams: number;
}

