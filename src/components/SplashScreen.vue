<template>
  <div v-if="isVisible" class="splash-screen" :class="{ 'fade-out': isFadingOut }">
    <div class="splash-content">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo-circle">
          <span class="logo-text">🧈</span>
        </div>
        <h1 class="brand-name">Amma Fresh</h1>
        <p class="brand-tagline">Pure Homemade Ghee</p>
      </div>

      <!-- Loading State -->
      <div v-if="!error" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>

      <!-- Error State -->
      <div v-else class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-text">{{ errorMessage }}</p>
        <button @click="retry" class="retry-button">
          <span class="retry-icon">🔄</span>
          Retry Connection
        </button>
      </div>

      <!-- Progress Dots -->
      <div class="progress-dots">
        <span class="dot" :class="{ active: currentStep >= 1 }"></span>
        <span class="dot" :class="{ active: currentStep >= 2 }"></span>
        <span class="dot" :class="{ active: currentStep >= 3 }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadProducts } from '../data/products';

const isVisible = ref(true);
const isFadingOut = ref(false);
const error = ref(false);
const errorMessage = ref('');
const loadingText = ref('Connecting to server...');
const currentStep = ref(0);

const emit = defineEmits(['ready']);

const checkBackendHealth = async () => {
  try {
    currentStep.value = 1;
    loadingText.value = 'Connecting to server...';
    
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ammafreshghee.onrender.com';
    
    // Check backend health
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error('Server responded with an error');
    }
    
    // Track visitor (don't wait for it, fire and forget)
    fetch(`${apiUrl}/api/visitors/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => console.log('Visitor tracking failed:', err));
    
    currentStep.value = 2;
    loadingText.value = 'Loading products...';
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Pre-load products using the loadProducts function
    await loadProducts();
    
    currentStep.value = 3;
    loadingText.value = 'Ready!';
    
    // Small delay before fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Fade out animation
    isFadingOut.value = true;
    
    // Wait for fade out animation to complete
    setTimeout(() => {
      isVisible.value = false;
      emit('ready');
    }, 500);
    
  } catch (err: any) {
    console.error('Backend health check failed:', err);
    error.value = true;
    
    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      errorMessage.value = 'Server is taking too long to respond. Please check your connection.';
    } else if (err.message.includes('Failed to fetch')) {
      errorMessage.value = 'Unable to connect to server. Please check if the backend is running.';
    } else {
      errorMessage.value = 'Failed to connect to server. Please try again.';
    }
  }
};

const retry = async () => {
  error.value = false;
  errorMessage.value = '';
  currentStep.value = 0;
  loadingText.value = 'Connecting to server...';
  await checkBackendHealth();
};

onMounted(() => {
  checkBackendHealth();
});
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: gradientShift 8s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.splash-screen.fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.splash-content {
  text-align: center;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Styles */
.logo-container {
  margin-bottom: 40px;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-text {
  font-size: 60px;
  animation: rotate 3s linear infinite;
  display: inline-block;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.brand-name {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.brand-tagline {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
}

/* Loading Styles */
.loading-container {
  margin-top: 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Error Styles */
.error-container {
  margin-top: 40px;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-text {
  color: white;
  font-size: 16px;
  margin: 0 0 25px 0;
  max-width: 400px;
  line-height: 1.6;
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid white;
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.retry-button:active {
  transform: translateY(0);
}

.retry-icon {
  display: inline-block;
  animation: rotate 2s linear infinite;
}

/* Progress Dots */
.progress-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
  .brand-name {
    font-size: 36px;
  }

  .brand-tagline {
    font-size: 14px;
  }

  .logo-circle {
    width: 100px;
    height: 100px;
  }

  .logo-text {
    font-size: 50px;
  }

  .error-text {
    font-size: 14px;
    max-width: 300px;
    padding: 0 20px;
  }
}
</style>

