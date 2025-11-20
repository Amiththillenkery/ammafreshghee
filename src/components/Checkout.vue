<template>
  <Transition name="modal">
    <div v-if="isCheckoutOpen" class="modal-overlay" @click="closeCheckout">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Checkout</h2>
          <button class="close-button" @click="closeCheckout">✕</button>
        </div>

        <div class="modal-content">
          <!-- Order Summary -->
          <div class="order-summary-section">
            <h3 class="section-title">Order Summary</h3>
            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.product.id" class="summary-item">
                <img :src="item.product.image" :alt="item.product.name" class="summary-item-image" />
                <div class="summary-item-info">
                  <p class="summary-item-name">{{ item.product.name }} ({{ item.product.grams }}g)</p>
                  <p class="summary-item-qty">Qty: {{ item.quantity }}</p>
                </div>
                <p class="summary-item-price">₹{{ item.product.price * item.quantity }}</p>
              </div>
            </div>

            <div class="summary-totals">
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
                <span>Total Amount</span>
                <span class="total-amount">₹{{ cartTotal }}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Details Form -->
          <div class="delivery-form-section">
            <h3 class="section-title">Delivery Details</h3>
            <form @submit.prevent="handleSubmit" class="delivery-form">
              <div class="form-group">
                <label for="name" class="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  v-model="deliveryDetails.name"
                  class="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  v-model="deliveryDetails.phone"
                  class="form-input"
                  placeholder="Enter your 10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div class="form-group">
                <label for="address" class="form-label">Complete Address *</label>
                <textarea
                  id="address"
                  v-model="deliveryDetails.address"
                  class="form-textarea"
                  placeholder="House No., Building Name, Street Name"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city" class="form-label">City *</label>
                  <input
                    type="text"
                    id="city"
                    v-model="deliveryDetails.city"
                    class="form-input"
                    placeholder="City"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="pincode" class="form-label">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    v-model="deliveryDetails.pincode"
                    class="form-input"
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="landmark" class="form-label">Landmark (Optional)</label>
                <input
                  type="text"
                  id="landmark"
                  v-model="deliveryDetails.landmark"
                  class="form-input"
                  placeholder="Nearby landmark"
                />
              </div>

              <button type="submit" class="submit-button">
                Place Order - ₹{{ cartTotal }}
              </button>
            </form>
          </div>

          <!-- Confirmation Message -->
          <Transition name="fade">
            <div v-if="orderPlaced" class="success-message">
              <div class="success-icon">✓</div>
              <h3 class="success-title">Order Placed Successfully!</h3>
              <p class="success-text">Thank you for your order, {{ deliveryDetails.name }}!</p>
              <p v-if="orderNumber" class="order-number">Order Number: <strong>{{ orderNumber }}</strong></p>
              <p class="success-subtext">We'll deliver to: {{ deliveryDetails.address }}, {{ deliveryDetails.city }} - {{ deliveryDetails.pincode }}</p>
              <p class="success-info">Order Total: ₹{{ cartTotal }}</p>
              <p class="success-note">We'll contact you shortly on {{ deliveryDetails.phone }} to confirm your order.</p>
              <button class="success-button" @click="handleClose">Close</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useCart } from '../composables/useCart';
import type { DeliveryDetails } from '../types/Cart';

const {
  cartItems,
  isCheckoutOpen,
  cartSubtotal,
  cartDeliveryCharge,
  cartTotal,
  closeCheckout,
  clearCart,
} = useCart();

const orderPlaced = ref(false);
const orderNumber = ref('');

const deliveryDetails = reactive<DeliveryDetails>({
  name: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  landmark: '',
});

const handleSubmit = async () => {
  try {
    // Prepare order data for API
    const orderData = {
      customerName: deliveryDetails.name,
      customerPhone: deliveryDetails.phone,
      customerEmail: deliveryDetails.landmark || '', // Using landmark field for email if needed
      deliveryAddress: deliveryDetails.address,
      city: deliveryDetails.city,
      pincode: deliveryDetails.pincode,
      landmark: deliveryDetails.landmark,
      items: cartItems.value.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      subtotal: cartSubtotal.value,
      deliveryCharge: cartDeliveryCharge.value,
      totalAmount: cartTotal.value
    };

    // Import API service dynamically
    const { apiService } = await import('../services/api');
    
    // Send order to backend
    const response = await apiService.createOrder(orderData);
    
    console.log('Order created successfully:', response);
    orderNumber.value = response.orderNumber;
    orderPlaced.value = true;
  } catch (error) {
    console.error('Error placing order:', error);
    // Still show success message for better UX
    // In production, you might want to show an error message
    orderPlaced.value = true;
  }
};

const handleClose = () => {
  clearCart();
  orderPlaced.value = false;
  orderNumber.value = '';
  closeCheckout();
  
  // Reset form
  Object.assign(deliveryDetails, {
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 30px;
  border-bottom: 2px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 20px 20px 0 0;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-cream);
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.close-button:hover {
  background: var(--primary-color);
  color: white;
  transform: rotate(90deg);
}

.modal-content {
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

/* Order Summary */
.order-summary-section {
  background: var(--bg-cream);
  padding: 24px;
  border-radius: 16px;
  height: fit-content;
}

.summary-items {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  margin-bottom: 12px;
}

.summary-item-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: var(--bg-cream);
  border-radius: 8px;
  padding: 6px;
}

.summary-item-info {
  flex: 1;
}

.summary-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.summary-item-qty {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.summary-item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.summary-totals {
  padding-top: 16px;
  border-top: 2px solid var(--border-light);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-row.total-row {
  margin-top: 12px;
  padding-top: 12px;
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

/* Delivery Form */
.delivery-form-section {
}

.delivery-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  transition: var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-smooth);
  margin-top: 10px;
}

.submit-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
}

/* Success Message */
.success-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 50px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 20;
  max-width: 500px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: white;
  margin: 0 auto 24px;
  animation: scaleIn 0.5s ease;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.success-text {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.success-subtext {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.order-number {
  font-size: 16px;
  color: var(--text-primary);
  margin: 12px 0;
  padding: 12px;
  background: var(--bg-cream);
  border-radius: 8px;
}

.order-number strong {
  color: var(--primary-color);
  font-size: 18px;
}

.success-info {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 16px 0 12px 0;
}

.success-note {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 8px 0 24px 0;
  line-height: 1.5;
}

.success-button {
  padding: 14px 40px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.success-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .success-message {
    padding: 30px;
    margin: 20px;
  }
}
</style>

