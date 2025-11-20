<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="goToHome" style="cursor: pointer;">
            <img src="/logo.png" alt="Amma Fresh" class="logo-image" />
            <span class="logo-text">Amma Fresh</span>
          </div>
          
          <nav class="nav">
            <a v-if="!showTrackOrder" href="#products" class="nav-link" @click="scrollToSection('products', $event)">Products</a>
            <a v-if="!showTrackOrder" href="#about" class="nav-link" @click="scrollToSection('about', $event)">About</a>
            <a v-if="!showTrackOrder" href="#contact" class="nav-link" @click="scrollToSection('contact', $event)">Contact</a>
            <a v-if="!showTrackOrder" href="#track" class="nav-link track-order-link" @click="openTrackOrder($event)">🔍 Track Order</a>
            <a v-if="showTrackOrder" href="#home" class="nav-link home-link" @click="closeTrackOrder">← Back to Home</a>
          </nav>
          
          <div class="header-actions">
            <button class="icon-button">
              <span class="icon">🔍</span>
            </button>
            <button class="icon-button cart-button" @click="openCart">
              <span class="icon">🛒</span>
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Payment Callback View -->
    <div v-if="showPaymentCallback" class="payment-callback-view">
      <PaymentCallback />
    </div>

    <!-- Order Tracking View -->
    <div v-else-if="showTrackOrder" class="track-order-view">
      <OrderTracking />
    </div>

    <!-- Main Content (hidden when tracking or payment callback is shown) -->
    <div v-show="!showTrackOrder && !showPaymentCallback" class="main-content">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-wrapper">
            <div class="hero-image-section">
              <div class="hero-image-container">
                <img src="/logo.png" alt="Amma Fresh Ghee" class="hero-logo-image" />
                <div class="hero-image-decoration"></div>
              </div>
            </div>
            
            <div class="hero-content">
              <h1 class="hero-title">Amma Fresh Ghee</h1>
              <p class="hero-subtitle">Experience the authentic taste of tradition. Pure cow ghee handcrafted with love, delivered fresh to your doorstep.</p>
              <div class="hero-features">
                <div class="feature">
                  <span class="feature-icon">✓</span>
                  <span class="feature-text">No Preservatives</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">✓</span>
                  <span class="feature-text">No Chemicals</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">✓</span>
                  <span class="feature-text">Traditional Goodness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="products-section" id="products">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Pure Cow Ghee Collection</h2>
            <p class="section-subtitle">Choose from our range of premium cow ghee packages</p>
          </div>
          
          <div class="products-grid">
            <ProductCard 
              v-for="product in products" 
              :key="product.id" 
              :product="product"
            />
          </div>
        </div>
      </section>

      <!-- About Section -->
      <About />

      <!-- Contact Section -->
      <Contact />
    </div>

    <!-- Footer (hidden on payment callback) -->
    <footer v-if="!showPaymentCallback" class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <img src="/logo.png" alt="Amma Fresh" class="footer-logo-image" />
              <span class="logo-text">Amma Fresh</span>
            </div>
            <p class="footer-text">Premium quality cow ghee crafted with traditional methods. No preservatives, no chemicals - just traditional goodness.</p>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#about" @click="scrollToSection('about', $event)">About Us</a></li>
              <li><a href="#products" @click="scrollToSection('products', $event)">Our Products</a></li>
              <li><a href="#about" @click="scrollToSection('about', $event)">Our Process</a></li>
              <li><a href="#contact" @click="scrollToSection('contact', $event)">Contact</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">Customer Care</h4>
            <ul class="footer-links">
              <li><a href="#contact" @click="scrollToSection('contact', $event)">Contact Us</a></li>
              <li><a href="https://wa.me/919961757294" target="_blank">WhatsApp Order</a></li>
              <li><a href="tel:+919961757294">Call: +91 9961757294</a></li>
              <li><a href="mailto:anithamith@gmail.com">Email Us</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">Connect With Us</h4>
            <div class="social-links">
              <a href="https://wa.me/919961757294" target="_blank" class="social-link" title="WhatsApp">💬</a>
              <a href="tel:+919961757294" class="social-link" title="Call">📞</a>
              <a href="mailto:anithamith@gmail.com" class="social-link" title="Email">📧</a>
              <a href="#products" @click="scrollToSection('products', $event)" class="social-link" title="Products">🛒</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 Amma Fresh Ghee. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Cart Sidebar -->
    <Cart />

    <!-- Checkout Modal -->
    <Checkout />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ProductCard from './components/ProductCard.vue';
import Cart from './components/Cart.vue';
import Checkout from './components/Checkout.vue';
import About from './components/About.vue';
import Contact from './components/Contact.vue';
import OrderTracking from './components/OrderTracking.vue';
import PaymentCallback from './components/PaymentCallback.vue';
import { products, loadProducts } from './data/products';
import { useCart } from './composables/useCart';

const { cartCount, openCart } = useCart();
const showTrackOrder = ref(false);
const showPaymentCallback = ref(false);

// Check if we're on payment callback route
const checkRoute = () => {
  const path = window.location.pathname;
  if (path.includes('/payment/callback')) {
    showPaymentCallback.value = true;
  }
};

// Load products from API on mount
onMounted(() => {
  loadProducts();
  checkRoute();
});

const scrollToSection = (sectionId: string, event: Event) => {
  event.preventDefault();
  
  // If on tracking page, go back to home first
  if (showTrackOrder.value) {
    showTrackOrder.value = false;
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  } else {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
};

const openTrackOrder = (event: Event) => {
  event.preventDefault();
  showTrackOrder.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const closeTrackOrder = (event?: Event) => {
  if (event) {
    event.preventDefault();
  }
  showTrackOrder.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goToHome = () => {
  if (showTrackOrder.value) {
    showTrackOrder.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.header {
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-smooth);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 50%;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-weight: 500;
  color: var(--text-secondary);
  position: relative;
  padding: 8px 0;
  transition: var(--transition-fast);
  cursor: pointer;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-smooth);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link:hover::after {
  width: 100%;
}

.track-order-link {
  color: var(--primary-color) !important;
  font-weight: 600;
}

.track-order-link:hover {
  transform: scale(1.05);
}

.home-link {
  color: var(--primary-color) !important;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-link:hover {
  transform: translateX(-2px);
}

.track-order-view {
  min-height: calc(100vh - 100px);
  padding-top: 100px;
}

.payment-callback-view {
  min-height: 100vh;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.icon-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: var(--transition-smooth);
}

.icon-button:hover {
  background: var(--primary-color);
  transform: scale(1.1);
}

.icon {
  font-size: 20px;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary-color);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

/* Hero Styles */
.hero {
  background: linear-gradient(135deg, #faf8f5 0%, #f0ede6 100%);
  padding: 80px 0;
  overflow: hidden;
}

.hero-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeInLeft 1s ease;
}

.hero-image-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-logo-image {
  width: 350px;
  height: 350px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
  background: white;
  padding: 20px;
  position: relative;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

.hero-image-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--primary-color);
  border-radius: 50%;
  top: 20px;
  left: 20px;
  z-index: 1;
  opacity: 0.3;
}

.hero-content {
  text-align: left;
  animation: fadeInRight 1s ease;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.feature-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Products Section */
.products-section {
  padding: 80px 0;
  flex: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  animation: fadeIn 1s ease;
}

/* Footer Styles */
.footer {
  background: var(--text-primary);
  color: white;
  padding: 60px 0 20px;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-logo-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 50%;
}

.footer-logo .logo-text {
  color: white;
  -webkit-text-fill-color: white;
}

.footer-text {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.footer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  transition: var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary-color);
  padding-left: 4px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: var(--transition-smooth);
}

.social-link:hover {
  background: var(--primary-color);
  transform: translateY(-4px);
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* Container */
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 24px;
  }
  
  .hero {
    padding: 60px 0;
  }
  
  .hero-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .hero-image-container {
    width: 300px;
    height: 300px;
  }
  
  .hero-logo-image {
    width: 250px;
    height: 250px;
  }
  
  .hero-content {
    text-align: center;
  }
  
  .hero-title {
    font-size: 40px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-features {
    gap: 16px;
    align-items: center;
  }
  
  .section-title {
    font-size: 32px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 480px) {
  .hero-image-container {
    width: 250px;
    height: 250px;
  }
  
  .hero-logo-image {
    width: 200px;
    height: 200px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .logo-text {
    font-size: 20px;
  }
}
</style>

