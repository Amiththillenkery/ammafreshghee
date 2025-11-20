<template>
  <section class="about-section" id="about">
    <div class="container">
      <div class="about-header">
        <h2 class="section-title">About Amma Fresh</h2>
        <p class="section-subtitle">Pure, Traditional, Homemade Goodness</p>
      </div>

      <div class="about-content">
        <!-- Main Story -->
        <div class="story-section">
          <div class="story-text">
            <h3 class="content-title">Our Story</h3>
            <p class="content-paragraph">
              Amma Fresh is a proud home-based business dedicated to bringing you the authentic taste of traditional ghee. 
              We believe in preserving age-old methods of ghee-making that have been passed down through generations in 
              Indian households.
            </p>
            <p class="content-paragraph">
              Every jar of our ghee is crafted with love and care in our home kitchen, ensuring that you receive 
              the same quality and taste that we serve to our own family.
            </p>
          </div>
          <div class="story-image">
            <img src="/logo.png" alt="Amma Fresh" class="about-logo" />
          </div>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h4 class="feature-title">Home-Based Business</h4>
            <p class="feature-text">
              Made with love in our home kitchen, ensuring personal attention to every batch. 
              We treat your order as if we're making it for our own family.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌿</div>
            <h4 class="feature-title">No Preservatives</h4>
            <p class="feature-text">
              100% pure cow ghee without any artificial preservatives. What you get is 
              natural, fresh, and safe for your family.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🚫</div>
            <h4 class="feature-title">No Chemicals</h4>
            <p class="feature-text">
              Absolutely no chemicals or additives. We use only pure cow milk 
              to create our authentic, chemical-free ghee.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔥</div>
            <h4 class="feature-title">Traditional Method</h4>
            <p class="feature-text">
              Handcrafted using the traditional bilona method, the same way our grandmothers 
              made ghee - slow, steady, and with utmost care.
            </p>
          </div>
        </div>

        <!-- Process Section -->
        <div class="process-section">
          <h3 class="content-title">Our Traditional Process</h3>
          <div class="process-steps">
            <div class="process-step">
              <div class="step-number">1</div>
              <h4 class="step-title">Fresh Milk</h4>
              <p class="step-text">We source fresh, pure cow milk from trusted local suppliers.</p>
            </div>
            <div class="process-step">
              <div class="step-number">2</div>
              <h4 class="step-title">Traditional Churning</h4>
              <p class="step-text">Milk is converted to curd and churned using the bilona method.</p>
            </div>
            <div class="process-step">
              <div class="step-number">3</div>
              <h4 class="step-title">Slow Heating</h4>
              <p class="step-text">Butter is slowly heated to create pure, aromatic ghee.</p>
            </div>
            <div class="process-step">
              <div class="step-number">4</div>
              <h4 class="step-title">Quality Check</h4>
              <p class="step-text">Every batch is carefully checked for quality and purity.</p>
            </div>
          </div>
        </div>

        <!-- Ordering Section -->
        <div class="ordering-section">
          <div class="ordering-card">
            <div class="ordering-icon">📦</div>
            <h3 class="ordering-title">How We Work</h3>
            <p class="ordering-text">
              We operate on a made-to-order basis to ensure maximum freshness. Once you place your order 
              through our website, we prepare your ghee fresh and deliver it to your doorstep.
            </p>
            <p class="ordering-text">
              For a more personal touch, you can also book your order directly through WhatsApp. 
              We're always happy to answer your questions and take custom orders!
            </p>
            <a 
              href="https://wa.me/919961757294?text=Hi%20Amma%20Fresh%2C%20I%20would%20like%20to%20order%20ghee" 
              target="_blank"
              class="whatsapp-button"
            >
              <span class="whatsapp-icon">📱</span>
              Book via WhatsApp
            </a>
          </div>
        </div>

        <!-- Values Section -->
        <div class="values-section">
          <h3 class="content-title">Our Promise to You</h3>
          <div class="values-grid">
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">100% Pure Cow Ghee</span>
            </div>
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">Made Fresh on Order</span>
            </div>
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">Traditional Bilona Method</span>
            </div>
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">No Preservatives or Chemicals</span>
            </div>
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">Home-Made with Love</span>
            </div>
            <div class="value-item">
              <span class="value-check">✓</span>
              <span class="value-text">Trusted Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-section {
  padding: 80px 0;
  background: var(--bg-white);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.about-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* Story Section */
.story-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.story-text {
}

.content-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.content-paragraph {
  font-size: 17px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.story-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-logo {
  width: 300px;
  height: 300px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: linear-gradient(135deg, var(--bg-cream) 0%, #f8f6f1 100%);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  transition: var(--transition-smooth);
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary-color);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Process Section */
.process-section {
  background: var(--bg-cream);
  padding: 50px;
  border-radius: 20px;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  margin-top: 40px;
}

.process-step {
  text-align: center;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  margin: 0 auto 20px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.step-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Ordering Section */
.ordering-section {
  display: flex;
  justify-content: center;
}

.ordering-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 50px;
  border-radius: 20px;
  text-align: center;
  max-width: 700px;
  box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
}

.ordering-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.ordering-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
}

.ordering-text {
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 20px;
  opacity: 0.95;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #25D366;
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  margin-top: 20px;
  transition: var(--transition-smooth);
  box-shadow: 0 6px 24px rgba(37, 211, 102, 0.4);
}

.whatsapp-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(37, 211, 102, 0.5);
}

.whatsapp-icon {
  font-size: 24px;
}

/* Values Section */
.values-section {
  text-align: center;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-cream);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.value-check {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .about-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 36px;
  }

  .story-section {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .about-logo {
    width: 200px;
    height: 200px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .process-section {
    padding: 30px 20px;
  }

  .process-steps {
    grid-template-columns: 1fr;
  }

  .ordering-card {
    padding: 30px 24px;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>

