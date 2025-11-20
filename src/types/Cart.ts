import type { Product } from './Product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
}

