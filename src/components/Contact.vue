<template>
  <section class="contact-section" id="contact">
    <div class="container">
      <div class="contact-header">
        <h2 class="section-title">Get in Touch</h2>
        <p class="section-subtitle">We'd love to hear from you!</p>
      </div>

      <div class="contact-content">
        <!-- Contact Info Cards -->
        <div class="contact-cards">
          <div class="contact-card phone-card">
            <div class="card-icon">📱</div>
            <h3 class="card-title">Call or WhatsApp</h3>
            <a href="tel:+919961757294" class="card-link">+91 9961757294</a>
            <p class="card-text">Available Mon-Sat, 9 AM - 8 PM</p>
            <a 
              href="https://wa.me/919961757294?text=Hi%20Amma%20Fresh%2C%20I%20have%20a%20question%20about%20your%20ghee" 
              target="_blank"
              class="whatsapp-btn"
            >
              <span class="whatsapp-icon">💬</span>
              Chat on WhatsApp
            </a>
          </div>

          <div class="contact-card email-card">
            <div class="card-icon">📧</div>
            <h3 class="card-title">Email Us</h3>
            <a href="mailto:anithamith@gmail.com" class="card-link">anithamith@gmail.com</a>
            <p class="card-text">We'll respond within 24 hours</p>
            <a href="mailto:anithamith@gmail.com" class="email-btn">
              <span class="email-icon">✉️</span>
              Send Email
            </a>
          </div>

          <div class="contact-card location-card">
            <div class="card-icon">🏠</div>
            <h3 class="card-title">Home-Based Business</h3>
            <p class="card-text">
              We're a trusted home kitchen delivering fresh, pure cow ghee across the region.
            </p>
            <p class="card-text">
              <strong>Delivery Available</strong><br/>
              Free delivery on orders of 1kg and above!
            </p>
          </div>
        </div>

        <!-- Quick Contact Section -->
        <div class="quick-contact">
          <h3 class="quick-title">Quick Order via WhatsApp</h3>
          <p class="quick-text">
            For the fastest service, place your order directly through WhatsApp. We'll confirm your order 
            and delivery details right away!
          </p>
          <div class="quick-actions">
            <a 
              href="https://wa.me/919961757294?text=Hi%20Amma%20Fresh%2C%20I%20would%20like%20to%20order%3A%0A%0AProduct%3A%20%0AQuantity%3A%20%0ADelivery%20Address%3A%20" 
              target="_blank"
              class="action-btn primary-btn"
            >
              <span class="btn-icon">🛒</span>
              Order on WhatsApp
            </a>
            <a href="tel:+919961757294" class="action-btn secondary-btn">
              <span class="btn-icon">📞</span>
              Call Now
            </a>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="faq-section">
          <h3 class="faq-title">Frequently Asked Questions</h3>
          <div class="faq-grid">
            <div class="faq-item">
              <h4 class="faq-question">How do I place an order?</h4>
              <p class="faq-answer">
                You can order through our website or directly via WhatsApp at +91 9961757294. 
                We'll confirm your order and arrange delivery.
              </p>
            </div>

            <div class="faq-item">
              <h4 class="faq-question">What's the delivery time?</h4>
              <p class="faq-answer">
                We make fresh batches on order. Typically, delivery takes 2-3 days from order confirmation. 
                Contact us for urgent orders.
              </p>
            </div>

            <div class="faq-item">
              <h4 class="faq-question">Is delivery really free?</h4>
              <p class="faq-answer">
                Yes! Orders of 1kg and 2kg come with free delivery. For smaller orders, 
                a nominal delivery charge of ₹49 applies.
              </p>
            </div>

            <div class="faq-item">
              <h4 class="faq-question">How is the ghee packaged?</h4>
              <p class="faq-answer">
                Our ghee comes in food-grade, air-tight containers to maintain freshness and quality. 
                Perfect for storing in your kitchen.
              </p>
            </div>

            <div class="faq-item">
              <h4 class="faq-question">What makes your ghee special?</h4>
              <p class="faq-answer">
                We use the traditional bilona method with pure cow milk. No preservatives, no chemicals - 
                just authentic, homemade goodness.
              </p>
            </div>

            <div class="faq-item">
              <h4 class="faq-question">Can I customize my order?</h4>
              <p class="faq-answer">
                Absolutely! Contact us on WhatsApp or call to discuss custom quantities or special requirements. 
                We're always happy to help!
              </p>
            </div>
          </div>
        </div>

        <!-- Business Hours -->
        <div class="business-hours">
          <h3 class="hours-title">Business Hours</h3>
          <div class="hours-grid">
            <div class="hours-item">
              <span class="day">Monday - Saturday</span>
              <span class="time">9:00 AM - 8:00 PM</span>
            </div>
            <div class="hours-item">
              <span class="day">Sunday</span>
              <span class="time">10:00 AM - 6:00 PM</span>
            </div>
          </div>
          <p class="hours-note">
            * Orders placed outside business hours will be confirmed the next working day
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.contact-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #faf8f5 0%, #f0ede6 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.contact-header {
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

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

/* Contact Cards */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.contact-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: var(--transition-smooth);
}

.contact-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.card-link {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 12px;
  transition: var(--transition-fast);
}

.card-link:hover {
  color: var(--primary-dark);
}

.card-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.whatsapp-btn,
.email-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 16px;
  transition: var(--transition-smooth);
}

.whatsapp-btn {
  background: #25D366;
  color: white;
}

.whatsapp-btn:hover {
  background: #20BA5A;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.email-btn {
  background: var(--primary-color);
  color: white;
}

.email-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* Quick Contact */
.quick-contact {
  background: white;
  padding: 50px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.quick-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.quick-text {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 700px;
  margin: 0 auto 32px;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition-smooth);
}

.primary-btn {
  background: #25D366;
  color: white;
}

.primary-btn:hover {
  background: #20BA5A;
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(37, 211, 102, 0.4);
}

.secondary-btn {
  background: var(--primary-color);
  color: white;
}

.secondary-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(212, 175, 55, 0.4);
}

.btn-icon {
  font-size: 22px;
}

/* FAQ Section */
.faq-section {
  background: white;
  padding: 50px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.faq-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 40px;
  text-align: center;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.faq-item {
  padding: 24px;
  background: var(--bg-cream);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.faq-question {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.faq-answer {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Business Hours */
.business-hours {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.hours-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 30px;
}

.hours-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto 20px;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-cream);
  border-radius: 10px;
  font-size: 16px;
}

.day {
  font-weight: 600;
  color: var(--text-primary);
}

.time {
  font-weight: 700;
  color: var(--primary-color);
}

.hours-note {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 36px;
  }

  .contact-cards {
    grid-template-columns: 1fr;
  }

  .quick-contact,
  .faq-section,
  .business-hours {
    padding: 30px 20px;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

