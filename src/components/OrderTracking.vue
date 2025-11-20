<template>
  <div class="order-tracking">
    <!-- Header -->
    <div class="tracking-header">
      <h1>🔍 Track Your Order</h1>
      <p>Enter your order ID or phone number to track your order status</p>
    </div>

    <!-- Search Options -->
    <div class="search-container">
      <div class="search-tabs">
        <button 
          :class="['tab-btn', { active: searchType === 'orderId' }]"
          @click="searchType = 'orderId'"
        >
          Search by Order ID
        </button>
        <button 
          :class="['tab-btn', { active: searchType === 'phone' }]"
          @click="searchType = 'phone'"
        >
          Search by Phone Number
        </button>
      </div>

      <!-- Search by Order ID -->
      <div v-if="searchType === 'orderId'" class="search-box">
        <div class="input-group">
          <label>Order ID</label>
          <input 
            v-model="orderNumber" 
            type="text" 
            placeholder="Enter your order ID (e.g., AFK1234567890)"
            @keyup.enter="trackByOrderId"
          />
        </div>
        <button @click="trackByOrderId" :disabled="!orderNumber || loading" class="track-btn">
          <span v-if="!loading">🔍 Track Order</span>
          <span v-else>Searching...</span>
        </button>
      </div>

      <!-- Search by Phone Number -->
      <div v-if="searchType === 'phone'" class="search-box">
        <div class="input-group">
          <label>Phone Number</label>
          <input 
            v-model="phoneNumber" 
            type="tel" 
            placeholder="Enter your phone number (10 digits)"
            maxlength="10"
            @keyup.enter="trackByPhone"
          />
        </div>
        <button @click="trackByPhone" :disabled="!phoneNumber || loading" class="track-btn">
          <span v-if="!loading">🔍 Search Orders</span>
          <span v-else>Searching...</span>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <span>❌ {{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="close-btn">✕</button>
    </div>

    <!-- Single Order Tracking Result -->
    <div v-if="trackingData && !multipleOrders" class="tracking-result">
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h2>Order: {{ trackingData.order.order_number }}</h2>
            <p class="order-date">Placed on {{ formatDate(trackingData.order.created_at) }}</p>
          </div>
          <div :class="['status-badge', trackingData.order.status]">
            {{ formatStatus(trackingData.order.status) }}
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="!trackingData.tracking.isCancelled" class="progress-section">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: trackingData.tracking.progressPercentage + '%' }"
            ></div>
          </div>
          <p class="status-message">{{ trackingData.tracking.statusMessage }}</p>
        </div>

        <!-- Cancelled Message -->
        <div v-else class="cancelled-message">
          <p>⚠️ This order has been cancelled</p>
        </div>

        <!-- Order Timeline -->
        <div v-if="!trackingData.tracking.isCancelled" class="timeline">
          <div 
            v-for="step in orderSteps" 
            :key="step.status"
            :class="['timeline-item', { 
              completed: step.step <= trackingData.tracking.currentStep,
              active: step.step === trackingData.tracking.currentStep
            }]"
          >
            <div class="timeline-dot">
              <span v-if="step.step < trackingData.tracking.currentStep">✓</span>
              <span v-else-if="step.step === trackingData.tracking.currentStep">●</span>
            </div>
            <div class="timeline-content">
              <h4>{{ step.label }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="order-details">
          <h3>Order Details</h3>
          
          <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">{{ trackingData.order.customer_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">{{ trackingData.order.customer_phone }}</span>
              </div>
              <div v-if="trackingData.order.customer_email" class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ trackingData.order.customer_email }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Delivery Address</h4>
            <p class="address">
              {{ trackingData.order.delivery_address }}<br>
              {{ trackingData.order.city }}, {{ trackingData.order.pincode }}
              <span v-if="trackingData.order.landmark"><br>Landmark: {{ trackingData.order.landmark }}</span>
            </p>
          </div>

          <div class="detail-section">
            <h4>Items Ordered</h4>
            <div class="items-list">
              <div v-for="item in trackingData.order.items" :key="item.id" class="item-row">
                <div class="item-info">
                  <span class="item-name">{{ item.product_name }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }}</span>
                </div>
                <span class="item-price">₹{{ item.total_price }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹{{ trackingData.order.subtotal }}</span>
            </div>
            <div class="total-row">
              <span>Delivery Charge:</span>
              <span>₹{{ trackingData.order.delivery_charge }}</span>
            </div>
            <div class="total-row final-total">
              <span>Total Amount:</span>
              <span>₹{{ trackingData.order.total_amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiple Orders Result (Phone Search) -->
    <div v-if="multipleOrders && orders.length > 0" class="multiple-orders">
      <div class="orders-header">
        <h2>Your Orders</h2>
        <p>{{ orders.length }} pending order(s) found</p>
      </div>

      <div class="orders-list">
        <div v-for="order in orders" :key="order.order_number" class="order-summary-card">
          <div class="summary-header">
            <div>
              <h3>{{ order.order_number }}</h3>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <div :class="['status-badge', order.status]">
              {{ formatStatus(order.status) }}
            </div>
          </div>

          <div class="summary-items">
            <p>{{ order.items.length }} item(s) • ₹{{ order.total_amount }}</p>
          </div>

          <button @click="viewOrderDetails(order.order_number)" class="view-details-btn">
            View Details →
          </button>
        </div>
      </div>
    </div>

    <!-- No Orders Found -->
    <div v-if="multipleOrders && orders.length === 0 && !loading && !errorMessage" class="no-orders">
      <div class="no-orders-icon">📦</div>
      <h3>No pending orders found</h3>
      <p>All your orders have been delivered or there are no orders with this phone number.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apiService } from '../services/api';

const searchType = ref<'orderId' | 'phone'>('orderId');
const orderNumber = ref('');
const phoneNumber = ref('');
const loading = ref(false);
const errorMessage = ref('');
const trackingData = ref<any>(null);
const multipleOrders = ref(false);
const orders = ref<any[]>([]);

const orderSteps = [
  { status: 'pending', step: 1, label: 'Order Placed', description: 'Your order has been received' },
  { status: 'confirmed', step: 2, label: 'Order Confirmed', description: 'We are preparing your order' },
  { status: 'processing', step: 3, label: 'Processing', description: 'Your order is being packed' },
  { status: 'shipped', step: 4, label: 'Shipped', description: 'Your order is on the way' },
  { status: 'delivered', step: 5, label: 'Delivered', description: 'Order delivered successfully' }
];

async function trackByOrderId() {
  if (!orderNumber.value.trim()) {
    errorMessage.value = 'Please enter an order ID';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  trackingData.value = null;
  multipleOrders.value = false;

  try {
    const data = await apiService.trackOrder(orderNumber.value.trim());
    trackingData.value = data;
  } catch (error: any) {
    console.error('Error tracking order:', error);
    errorMessage.value = error.message || 'Order not found. Please check your order ID.';
  } finally {
    loading.value = false;
  }
}

async function trackByPhone() {
  if (!phoneNumber.value.trim()) {
    errorMessage.value = 'Please enter a phone number';
    return;
  }

  if (phoneNumber.value.length !== 10) {
    errorMessage.value = 'Please enter a valid 10-digit phone number';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  trackingData.value = null;
  multipleOrders.value = true;
  orders.value = [];

  try {
    const data = await apiService.trackOrdersByPhone(phoneNumber.value.trim());
    orders.value = data.orders || [];
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    errorMessage.value = error.message || 'Failed to fetch orders. Please try again.';
  } finally {
    loading.value = false;
  }
}

function viewOrderDetails(orderId: string) {
  orderNumber.value = orderId;
  searchType.value = 'orderId';
  trackByOrderId();
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[status] || status;
}
</script>

<style scoped>
.order-tracking {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 80vh;
}

.tracking-header {
  text-align: center;
  margin-bottom: 40px;
}

.tracking-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 10px;
}

.tracking-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

/* Search Container */
.search-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.search-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #f59e0b;
  border-bottom-color: #f59e0b;
}

.tab-btn:hover:not(.active) {
  color: #1f2937;
}

.search-box {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.track-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.track-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.track-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error Message */
.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 8px;
}

/* Tracking Result */
.tracking-result {
  margin-top: 30px;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.order-info h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 5px;
}

.order-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.processing {
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge.shipped {
  background: #ddd6fe;
  color: #6b21a8;
}

.status-badge.delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Progress Section */
.progress-section {
  margin-bottom: 40px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  transition: width 0.5s ease;
}

.status-message {
  text-align: center;
  color: #059669;
  font-weight: 600;
  font-size: 1.1rem;
}

.cancelled-message {
  padding: 20px;
  background: #fee2e2;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.cancelled-message p {
  color: #dc2626;
  font-weight: 600;
  margin: 0;
}

/* Timeline */
.timeline {
  margin: 40px 0;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 40px;
  width: 2px;
  height: calc(100% + 10px);
  background: #e5e7eb;
}

.timeline-item.completed::after {
  background: #10b981;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-item.completed .timeline-dot {
  background: #10b981;
}

.timeline-item.active .timeline-dot {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
}

.timeline-content {
  flex: 1;
  padding-top: 2px;
}

.timeline-content h4 {
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 1rem;
}

.timeline-content p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.timeline-item.completed .timeline-content h4 {
  color: #059669;
}

/* Order Details */
.order-details {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f3f4f6;
}

.order-details > h3 {
  font-size: 1.3rem;
  color: #1f2937;
  margin-bottom: 25px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-item .label {
  color: #6b7280;
  font-weight: 500;
}

.detail-item .value {
  color: #1f2937;
}

.address {
  color: #1f2937;
  line-height: 1.6;
}

/* Items List */
.items-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.item-qty {
  font-size: 0.9rem;
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: #059669;
}

/* Total Section */
.total-section {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #374151;
}

.total-row.final-total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #e5e7eb;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

/* Multiple Orders */
.multiple-orders {
  margin-top: 30px;
}

.orders-header {
  margin-bottom: 25px;
}

.orders-header h2 {
  font-size: 1.8rem;
  color: #1f2937;
  margin-bottom: 5px;
}

.orders-header p {
  color: #6b7280;
}

.orders-list {
  display: grid;
  gap: 20px;
}

.order-summary-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.order-summary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.summary-header h3 {
  font-size: 1.2rem;
  color: #1f2937;
  margin-bottom: 5px;
}

.summary-items {
  margin-bottom: 15px;
  color: #6b7280;
}

.view-details-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* No Orders */
.no-orders {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-orders-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-orders h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 10px;
}

.no-orders p {
  color: #6b7280;
  max-width: 500px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .tracking-header h1 {
    font-size: 2rem;
  }

  .search-box {
    flex-direction: column;
    align-items: stretch;
  }

  .track-btn {
    width: 100%;
  }

  .order-header {
    flex-direction: column;
    gap: 15px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    gap: 15px;
  }

  .search-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .tab-btn {
    border-bottom: none;
    border-left: 3px solid transparent;
    text-align: left;
    padding-left: 20px;
  }

  .tab-btn.active {
    border-left-color: #f59e0b;
    border-bottom-color: transparent;
  }
}
</style>

