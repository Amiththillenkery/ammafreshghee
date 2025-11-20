<template>
  <div class="callback-container">
    <div class="callback-card">
      <!-- Processing State -->
      <div v-if="isProcessing" class="processing-state">
        <div class="spinner"></div>
        <h2>Verifying Payment...</h2>
        <p>Please wait while we confirm your payment status</p>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentStatus === 'success'" class="success-state">
        <div class="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p class="success-text">Thank you for your order</p>
        
        <div v-if="orderDetails" class="order-details">
          <div class="detail-row">
            <span class="label">Order Number:</span>
            <span class="value">{{ orderDetails.orderNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Amount Paid:</span>
            <span class="value">₹{{ orderDetails.totalAmount }}</span>
          </div>
        </div>

        <p class="info-text">
          Your order has been placed successfully. We'll contact you shortly to confirm delivery details.
        </p>

        <button @click="goToHome" class="action-button">
          Continue Shopping
        </button>
      </div>

      <!-- Failed State -->
      <div v-else-if="paymentStatus === 'failed'" class="failed-state">
        <div class="failed-icon">✕</div>
        <h2>Payment Failed</h2>
        <p class="error-text">{{ errorMessage || 'Your payment could not be processed' }}</p>
        
        <div class="action-buttons">
          <button @click="retryPayment" class="action-button retry-button">
            Try Again
          </button>
          <button @click="goToHome" class="action-button secondary-button">
            Go to Home
          </button>
        </div>
      </div>

      <!-- Pending State -->
      <div v-else-if="paymentStatus === 'pending'" class="pending-state">
        <div class="pending-icon">⏱</div>
        <h2>Payment Pending</h2>
        <p class="pending-text">Your payment is being processed. This may take a few moments.</p>
        
        <div v-if="orderDetails" class="order-details">
          <div class="detail-row">
            <span class="label">Order Number:</span>
            <span class="value">{{ orderDetails.orderNumber }}</span>
          </div>
        </div>

        <p class="info-text">
          We'll notify you once the payment is confirmed. You can track your order status using the order number above.
        </p>

        <button @click="checkStatus" class="action-button">
          Check Status
        </button>
        <button @click="goToHome" class="action-button secondary-button" style="margin-top: 10px;">
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '../services/api';
import { useCart } from '../composables/useCart';

const { clearCart } = useCart();

const isProcessing = ref(true);
const paymentStatus = ref<'success' | 'failed' | 'pending' | ''>('');
const errorMessage = ref('');
const orderDetails = ref<{
  orderNumber: string;
  totalAmount: number;
} | null>(null);
const merchantTransactionId = ref('');

onMounted(async () => {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('transactionId') || urlParams.get('merchantTransactionId');
  
  // Get stored order details
  const storedOrder = localStorage.getItem('pendingOrder');
  if (storedOrder) {
    try {
      const orderData = JSON.parse(storedOrder);
      orderDetails.value = {
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount
      };
      merchantTransactionId.value = orderData.merchantTransactionId;
    } catch (error) {
      console.error('Error parsing stored order:', error);
    }
  }

  // Use transaction ID from URL or stored data
  const txnId = transactionId || merchantTransactionId.value;

  if (txnId) {
    await verifyPayment(txnId);
  } else {
    isProcessing.value = false;
    paymentStatus.value = 'failed';
    errorMessage.value = 'Transaction ID not found';
  }
});

const verifyPayment = async (transactionId: string) => {
  try {
    const response = await apiService.checkPaymentStatus(transactionId);
    
    isProcessing.value = false;

    if (response.success) {
      // Map PhonePe status to our status
      const status = response.paymentStatus;
      
      if (status === 'PAYMENT_SUCCESS') {
        paymentStatus.value = 'success';
        // Clear cart on successful payment
        clearCart();
        // Clear stored order data
        localStorage.removeItem('pendingOrder');
        
        if (response.order) {
          orderDetails.value = {
            orderNumber: response.order.orderNumber,
            totalAmount: response.order.totalAmount
          };
        }
      } else if (status === 'PAYMENT_PENDING' || status === 'PAYMENT_INITIATED') {
        paymentStatus.value = 'pending';
      } else {
        paymentStatus.value = 'failed';
        errorMessage.value = response.message || 'Payment failed';
      }
    } else {
      paymentStatus.value = 'failed';
      errorMessage.value = response.message || 'Failed to verify payment';
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    isProcessing.value = false;
    paymentStatus.value = 'failed';
    errorMessage.value = error instanceof Error ? error.message : 'Failed to verify payment';
  }
};

const checkStatus = async () => {
  if (merchantTransactionId.value) {
    isProcessing.value = true;
    await verifyPayment(merchantTransactionId.value);
  }
};

const retryPayment = () => {
  // Clear stored order data and go back to home
  localStorage.removeItem('pendingOrder');
  window.location.href = '/';
};

const goToHome = () => {
  // Clear stored order data
  localStorage.removeItem('pendingOrder');
  window.location.href = '/';
};
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.callback-card {
  background: white;
  border-radius: 20px;
  padding: 60px 50px;
  max-width: 550px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
}

/* Spinner */
.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icons */
.success-icon {
  width: 100px;
  height: 100px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: white;
  margin: 0 auto 30px;
  animation: scaleIn 0.5s ease;
}

.failed-icon {
  width: 100px;
  height: 100px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: white;
  margin: 0 auto 30px;
  animation: scaleIn 0.5s ease;
}

.pending-icon {
  width: 100px;
  height: 100px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: white;
  margin: 0 auto 30px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* Text Styles */
h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.success-text,
.error-text,
.pending-text {
  font-size: 18px;
  margin: 0 0 30px 0;
}

.success-text {
  color: #22c55e;
}

.error-text {
  color: #ef4444;
}

.pending-text {
  color: #f59e0b;
}

.info-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 24px 0;
}

/* Order Details */
.order-details {
  background: var(--bg-cream);
  padding: 20px;
  border-radius: 12px;
  margin: 24px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 700;
}

/* Buttons */
.action-button {
  width: 100%;
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

.action-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
}

.secondary-button {
  background: #6b7280;
}

.secondary-button:hover {
  background: #4b5563;
  box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
}

.retry-button {
  background: #3b82f6;
  margin-bottom: 12px;
}

.retry-button:hover {
  background: #2563eb;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.action-buttons {
  margin-top: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .callback-card {
    padding: 40px 30px;
  }

  h2 {
    font-size: 26px;
  }

  .success-icon,
  .failed-icon,
  .pending-icon {
    width: 80px;
    height: 80px;
    font-size: 50px;
  }
}
</style>

