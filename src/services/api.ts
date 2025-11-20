// Production backend URL
const API_BASE_URL = 'https://ammafreshghee.onrender.com/api';

interface ApiProduct {
  id: number;
  name: string;
  grams: number;
  liter: number;
  price: number;
  description: string;
  image: string;
  badge: string | null;
  delivery_charge: number;
  created_at?: string;
  updated_at?: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  landmark?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
}

interface OrderResponse {
  success: boolean;
  message: string;
  orderNumber: string;
  orderId: number;
  totalAmount: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // GET all products
  async getProducts(): Promise<ApiProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // GET single product
  async getProduct(id: number): Promise<ApiProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // POST create order
  async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // GET order by order number
  async getOrder(orderNumber: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('API health check failed:', error);
      return { status: 'error', message: 'API is not available' };
    }
  }

  // Track order by order number
  async trackOrder(orderNumber: string) {
    try {
      const response = await fetch(`${this.baseUrl}/track/${orderNumber}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to track order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }

  // Track orders by phone number
  async trackOrdersByPhone(phoneNumber: string) {
    try {
      const response = await fetch(`${this.baseUrl}/track/phone/${phoneNumber}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders by phone:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { ApiProduct, OrderItem, CreateOrderData, OrderResponse };

