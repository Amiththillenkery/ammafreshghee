<template>
  <Transition name="cart-overlay">
    <div v-if="isCartOpen" class="cart-overlay" @click="closeCart">
      <Transition name="cart-slide">
        <div v-if="isCartOpen" class="cart-sidebar" @click.stop>
          <div class="cart-header">
            <h2 class="cart-title">Your Cart</h2>
            <button class="close-button" @click="closeCart">✕</button>
          </div>

          <div v-if="cartItems.length === 0" class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <p class="empty-cart-text">Your cart is empty</p>
            <p class="empty-cart-subtext">Add some delicious ghee to get started!</p>
          </div>

          <div v-else class="cart-content">
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.product.id" class="cart-item">
                <img :src="item.product.image" :alt="item.product.name" class="cart-item-image" />
                
                <div class="cart-item-details">
                  <h3 class="cart-item-name">{{ item.product.name }}</h3>
                  <p class="cart-item-size">{{ item.product.grams }}g</p>
                  <p class="cart-item-price">₹{{ item.product.price }}</p>
                </div>

                <div class="cart-item-actions">
                  <div class="quantity-controls">
                    <button 
                      class="qty-btn" 
                      @click="updateQuantity(item.product.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                    >
                      −
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button 
                      class="qty-btn" 
                      @click="updateQuantity(item.product.id, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <button class="remove-btn" @click="removeFromCart(item.product.id)">
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹{{ cartSubtotal }}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Charge</span>
                <span :class="{ 'free-text': cartDeliveryCharge === 0 }">
                  {{ cartDeliveryCharge === 0 ? 'FREE' : `₹${cartDeliveryCharge}` }}
                </span>
              </div>
              <div class="summary-row total-row">
                <span>Total</span>
                <span class="total-amount">₹{{ cartTotal }}</span>
              </div>
            </div>

            <button class="checkout-button" @click="openCheckout">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useCart } from '../composables/useCart';

const {
  cartItems,
  isCartOpen,
  cartSubtotal,
  cartDeliveryCharge,
  cartTotal,
  closeCart,
  removeFromCart,
  updateQuantity,
  openCheckout,
} = useCart();
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  max-width: 90vw;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 2001;
}

.cart-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-cream);
  border: none;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.close-button:hover {
  background: var(--primary-color);
  color: white;
  transform: rotate(90deg);
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-cart-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-cart-subtext {
  font-size: 14px;
  color: var(--text-secondary);
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.cart-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-cream);
  border-radius: 12px;
  margin-bottom: 16px;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
  padding: 8px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.cart-item-size {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.cart-item-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.remove-btn:hover {
  color: #dc2626;
}

.cart-summary {
  padding: 20px;
  border-top: 2px solid var(--border-light);
  background: var(--bg-cream);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 15px;
  color: var(--text-secondary);
}

.summary-row.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border-light);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.total-amount {
  color: var(--primary-color);
}

.free-text {
  color: #22c55e;
  font-weight: 700;
}

.checkout-button {
  width: calc(100% - 40px);
  margin: 0 20px 20px 20px;
  padding: 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.checkout-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* Transitions */
.cart-overlay-enter-active,
.cart-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.cart-overlay-enter-from,
.cart-overlay-leave-to {
  opacity: 0;
}

.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: transform 0.3s ease;
}

.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .cart-sidebar {
    width: 100%;
    max-width: 100%;
  }
}
</style>

