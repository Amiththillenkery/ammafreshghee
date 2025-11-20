import { ref, computed } from 'vue';
import type { Product } from '../types/Product';
import type { CartItem } from '../types/Cart';

const cartItems = ref<CartItem[]>([]);
const isCartOpen = ref(false);
const isCheckoutOpen = ref(false);

export function useCart() {
  const addToCart = (product: Product) => {
    const existingItem = cartItems.value.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.value.push({
        product,
        quantity: 1,
      });
    }
  };

  const removeFromCart = (productId: number) => {
    const index = cartItems.value.findIndex(
      (item) => item.product.id === productId
    );
    if (index > -1) {
      cartItems.value.splice(index, 1);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartSubtotal = computed(() => {
    return cartItems.value.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  });

  const cartDeliveryCharge = computed(() => {
    if (cartItems.value.length === 0) return 0;
    
    // Check if any item has free delivery (1kg or 2kg)
    const hasFreeDelivery = cartItems.value.some(
      (item) => item.product.deliveryCharge === 0
    );
    
    return hasFreeDelivery ? 0 : 49;
  });

  const cartTotal = computed(() => {
    return cartSubtotal.value + cartDeliveryCharge.value;
  });

  const openCart = () => {
    isCartOpen.value = true;
  };

  const closeCart = () => {
    isCartOpen.value = false;
  };

  const openCheckout = () => {
    isCartOpen.value = false;
    isCheckoutOpen.value = true;
  };

  const closeCheckout = () => {
    isCheckoutOpen.value = false;
  };

  return {
    cartItems,
    isCartOpen,
    isCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    cartDeliveryCharge,
    cartTotal,
    openCart,
    closeCart,
    openCheckout,
    closeCheckout,
  };
}

