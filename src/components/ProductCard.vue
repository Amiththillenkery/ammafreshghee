<template>
    <div class="product-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    
    
    
        <div class="product-image-wrapper">
    
    
    
            <img :src="product.image" :alt="product.name" class="product-image" />
    
    
    
            <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
    
    
    
            <div class="product-overlay" :class="{ active: isHovered }">
    
    
    
                <button class="btn-primary">Add to Cart</button>
    
    
    
            </div>
    
    
    
        </div>
    
    
    
    
    
    
    
        <div class="product-info">
    
    
    
            <div class="product-header">
    
    
    
                <h3 class="product-name">{{ product.name }}</h3>
    
    
    
                <div v-if="product.rating" class="product-rating">
    
    
    
                    <span class="star">★</span>
    
    
    
                    <span class="rating-value">{{ product.rating }}</span>
    
    
    
                </div>
    
    
    
            </div>
    
    
    
    
    
    
    
            <p class="product-description">{{ product.description }}</p>
    
    
    
    
    
    
    
            <div class="product-footer">
    
    
    
                <div class="product-volume">
    
    
    
                    <span class="volume-icon">⚖️</span>
    
    
    
                    <span class="volume-text">{{ product.grams }}g</span>
    
    
    
                </div>
    
    
    
    
    
    
    
                <div class="product-price">
    
    
    
                    <span class="currency">₹</span>
    
    
    
                    <span class="amount">{{ product.price }}</span>
    
    
    
                </div>
    
    
    
            </div>
    
    
    
    
    
    
    
            <div class="delivery-info">
    
    
    
                <span class="delivery-icon">🚚</span>
    
    
    
                <span class="delivery-text" :class="{ 'free-delivery': product.deliveryCharge === 0 }">
    
        
    
                  {{ product.deliveryCharge === 0 ? 'FREE Delivery' : `Delivery ₹${product.deliveryCharge}` }}
    
        
    
                </span>
    
    
    
            </div>
    
    
    
    
    
    
    
            <div class="total-price">
    
    
    
                <span class="total-label">Total:</span>
    
    
    
                <span class="total-amount">₹{{ product.price + product.deliveryCharge }}</span>
    
    
    
            </div>
    
    
    
    
    
    
    
            <button class="btn-add-to-cart" @click="handleAddToCart">
    
        
    
                <span class="cart-icon">🛒</span>
    
        
    
                Add to Cart
    
        
    
              </button>
    
    
    
        </div>
    
    
    
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Product } from '../types/Product';
import { useCart } from '../composables/useCart';

const props = defineProps < {
    product: Product;
} > ();

const isHovered = ref(false);
const { addToCart } = useCart();

const handleAddToCart = () => {
    addToCart(props.product);
};
</script>

<style scoped>
.product-card {
    background: var(--bg-white);
    border-radius: 16px;
    overflow: hidden;
    transition: var(--transition-smooth);
    box-shadow: var(--shadow-sm);
    height: 100%;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
}

.product-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #faf8f5 0%, #f0ede6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    object-fit: contain;
    transition: var(--transition-smooth);
}

.product-card:hover .product-image {
    transform: translate(-50%, -50%) scale(1.1);
}

.product-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: var(--primary-color);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
    z-index: 2;
}

.product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(26, 26, 26, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: var(--transition-smooth);
    z-index: 1;
}

.product-overlay.active {
    opacity: 1;
}

.product-overlay .btn-primary {
    background: var(--primary-color);
    color: white;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    transform: translateY(10px);
    transition: var(--transition-smooth);
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
}

.product-overlay.active .btn-primary {
    transform: translateY(0);
}

.product-overlay .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
}

.product-info {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
}

.product-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    margin: 0;
    flex: 1;
}

.product-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-cream);
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.star {
    color: var(--primary-color);
    font-size: 14px;
}

.rating-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.product-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
    flex: 1;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 20px;
}

.product-volume {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-icon {
    font-size: 20px;
}

.volume-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.product-price {
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.currency {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
}

.amount {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
}

.delivery-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-cream);
    border-radius: 8px;
    margin-bottom: 12px;
}

.delivery-icon {
    font-size: 18px;
}

.delivery-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
}

.delivery-text.free-delivery {
    color: #22c55e;
    font-weight: 700;
}

.total-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 148, 31, 0.1) 100%);
    border-radius: 8px;
    margin-bottom: 20px;
    border: 2px solid var(--primary-color);
}

.total-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.total-amount {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
}

.btn-add-to-cart {
    width: 100%;
    padding: 14px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    transition: var(--transition-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-add-to-cart:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.cart-icon {
    font-size: 18px;
}

@media (max-width: 768px) {
    .product-name {
        font-size: 18px;
    }
    .product-description {
        font-size: 13px;
    }
    .amount {
        font-size: 24px;
    }
}
</style>

