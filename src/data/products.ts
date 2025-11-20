import type { Product } from '../types/Product';
import { apiService } from '../services/api';
import { ref } from 'vue';

// Fallback products in case API is not available
const fallbackProducts: Product[] = [];

export const products = ref<Product[]>(fallbackProducts);
export const isLoadingProducts = ref(false);
export const productsError = ref<string | null>(null);

// Load products from API
export async function loadProducts() {
  isLoadingProducts.value = true;
  productsError.value = null;

  try {
    const apiProducts = await apiService.getProducts();
    
    // Convert API product format to our Product type
    products.value = apiProducts.map(p => ({
      id: p.id,
      name: p.name,
      liter: p.liter,
      price: p.price,
      description: p.description,
      image: p.image,
      badge: p.badge || undefined,
      deliveryCharge: p.delivery_charge,
      grams: p.grams
    }));
  } catch (error) {
    console.warn('Failed to load products from API, using fallback data:', error);
    productsError.value = 'Using offline product data';
    products.value = fallbackProducts;
  } finally {
    isLoadingProducts.value = false;
  }
}

