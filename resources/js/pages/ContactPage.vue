<template>
  <div class="contact-page">
    <header class="page-header">
      <div class="container header-content">
        <h1>Get in Touch</h1>
        <p>Have questions? Our team is here to help. Reach out to us in any way that works for you.</p>
      </div>
    </header>

    <main>
      <!-- CONTACT METHODS -->
      <section class="contact-methods-section">
        <div class="container">
          <div class="methods-grid">
            <div class="method-card">
              <div class="method-icon">💬</div>
              <h3>Chat with us</h3>
              <p>Get instant answers during business hours</p>
              <button class="method-button" @click="openChat">Start chat</button>
            </div>
            <div class="method-card">
              <div class="method-icon">📧</div>
              <h3>Email us</h3>
              <p>Send us your questions anytime</p>
              <a href="mailto:hello@grillvibes.io" class="method-button">hello@grillvibes.io</a>
            </div>
            <div class="method-card">
              <div class="method-icon">📞</div>
              <h3>Call us</h3>
              <p>Speak to our team directly</p>
              <a href="tel:+97143500198" class="method-button">+971 4 350 0198</a>
            </div>
            <div class="method-card">
              <div class="method-icon">📍</div>
              <h3>Visit us</h3>
              <p>Drop by our Dubai office</p>
              <a href="#" class="method-button">Get directions</a>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTACT FORM -->
      <section class="contact-form-section">
        <div class="container">
          <div class="form-wrapper">
            <div class="form-content">
              <h2>Send us a message</h2>
              <p>Tell us what you're interested in and we'll get back to you within 24 hours.</p>

              <form @submit.prevent="handleSubmit" class="contact-form">
                <div class="form-group">
                  <label for="name">Full Name *</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="John Doe"
                  >
                </div>

                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="john@restaurant.com"
                  >
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                    >
                  </div>
                  <div class="form-group">
                    <label for="company">Restaurant Name</label>
                    <input
                      id="company"
                      v-model="form.company"
                      type="text"
                      placeholder="Your Restaurant"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="subject">Subject *</label>
                  <select v-model="form.subject" id="subject" required>
                    <option value="">Select a subject</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Questions</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="6"
                    required
                    placeholder="Tell us more about your needs..."
                  ></textarea>
                </div>

                <div class="form-checkbox">
                  <input
                    id="terms"
                    v-model="form.terms"
                    type="checkbox"
                    required
                  >
                  <label for="terms">
                    I agree to receive emails about our product updates and special offers
                  </label>
                </div>

                <button type="submit" class="submit-button" :disabled="!form.terms">
                  Send Message
                </button>

                <p class="form-note">We'll get back to you within 24 hours.</p>
              </form>
            </div>

            <div class="form-info">
              <h3>Response Time</h3>
              <p>We typically respond to inquiries within 24 hours during business days (Sunday - Thursday).</p>

              <h3>Office Hours</h3>
              <ul class="hours-list">
                <li>
                  <strong>Sunday - Thursday:</strong><br>
                  9:00 AM - 6:00 PM GST
                </li>
                <li>
                  <strong>Friday - Saturday:</strong><br>
                  Closed
                </li>
              </ul>

              <h3>Office Address</h3>
              <address>
                  GrillVibes Inc.<br>
                Dubai Business Hub<br>
                Dubai, UAE<br>
                PO Box 123456
              </address>

              <h3>Follow Us</h3>
              <div class="social-links">
                <a href="#" title="LinkedIn">in</a>
                <a href="#" title="Twitter">𝕏</a>
                <a href="#" title="Instagram">📷</a>
                <a href="#" title="Facebook">f</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ PREVIEW -->
      <section class="faq-preview-section">
        <div class="container">
          <h2>Quick Answers</h2>
          <p class="section-subtitle">Common questions answered instantly</p>

          <div class="faq-preview-grid">
            <div v-for="(item, index) in quickFaqs" :key="item.q" class="faq-preview-card">
              <div class="faq-preview-header" @click="expandedFaq = expandedFaq === index ? -1 : index">
                <h3>{{ item.q }}</h3>
                <span class="toggle">{{ expandedFaq === index ? '−' : '+' }}</span>
              </div>
              <div v-if="expandedFaq === index" class="faq-preview-body">
                {{ item.a }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA SECTION -->
      <section class="contact-cta">
        <div class="container cta-content">
          <h2>Ready to transform your restaurant?</h2>
          <p>Start your free 14-day trial today. No credit card required.</p>
          <button class="marketing-button" @click="goToLogin">Get started free</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { alertDialog } from "../composables/useNotifications";
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
const expandedFaq = ref(0);

const form = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  terms: false,
});

const quickFaqs = [
  {
    q: 'How quickly can we get started?',
    a: 'You can sign up for a free trial in minutes and start exploring GrillVibes immediately. Most restaurants are live and taking orders within 1-3 days with our guided setup process.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) as well as bank transfers for Enterprise customers. Invoicing is available for annual plans.'
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription anytime with no penalties. If you cancel mid-month, we\'ll provide a pro-rated refund based on your usage.'
  },
  {
    q: 'Do you offer discounts for longer commitments?',
    a: 'Yes! We offer 20% discount when you pay annually instead of monthly. Multi-year commitments receive additional discounts. Contact our sales team for details.'
  },
  {
    q: 'What kind of support do you provide?',
    a: 'We offer 24/7 support via email and chat for all plans. Growth and Enterprise plans get priority support and phone access. All customers receive onboarding assistance.'
  },
  {
    q: 'Is there a demo available?',
    a: 'Absolutely! We offer personalized demos tailored to your restaurant\'s needs. Schedule a demo using our contact form or call our sales team at +971 4 350 0198.'
  },
];

const handleSubmit = () => {
  // Handle form submission
  console.log('Form submitted:', form.value);
  alertDialog('Thank you for reaching out! We\'ll get back to you within 24 hours.');

  // Reset form
  form.value = {
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    terms: false,
  };
};

const openChat = () => {
  alertDialog('Chat window would open here');
};

const goToLogin = () => {
  router.visit('/login');
};
</script>

<style scoped>
.contact-page {
  background: #f8fafc;
  color: #0f172a;
}

.container {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.header-content h1 {
  margin: 0 0 16px;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  line-height: 1.2;
}

.header-content p {
  margin: 0;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
}

/* CONTACT METHODS */
.contact-methods-section {
  padding: 80px 0;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
}

.method-card {
  padding: 32px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.method-card:hover {
  box-shadow: 0 12px 40px rgba(79, 70, 229, 0.12);
  border-color: #4f46e5;
  transform: translateY(-4px);
}

.method-icon {
  font-size: 2.8rem;
  margin-bottom: 16px;
}

.method-card h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  color: #0f172a;
}

.method-card > p {
  margin: 0 0 20px;
  color: #64748b;
  font-size: 0.9rem;
  flex-grow: 1;
}

.method-button {
  display: inline-block;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.method-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

/* CONTACT FORM */
.contact-form-section {
  padding: 80px 0;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  align-items: start;
}

.form-content h2 {
  margin: 0 0 8px;
  font-size: 2rem;
  line-height: 1.2;
}

.form-content > p {
  margin: 0 0 32px;
  color: #64748b;
  font-size: 1rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 8px 0;
}

.form-checkbox input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
}

.form-checkbox label {
  flex: 1;
  cursor: pointer;
  font-weight: 400;
  color: #64748b;
  font-size: 0.9rem;
}

.submit-button {
  padding: 14px 28px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.3);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-note {
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

/* FORM INFO SIDEBAR */
.form-info {
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-info h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #0f172a;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: #64748b;
}

.form-info > p {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.hours-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.hours-list li {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.hours-list strong {
  color: #0f172a;
}

address {
  margin: 0 0 24px;
  color: #475569;
  font-size: 0.9rem;
  font-style: normal;
  line-height: 1.7;
}

.social-links {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-links a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  display: grid;
  place-items: center;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.social-links a:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

/* FAQ PREVIEW */
.faq-preview-section {
  padding: 80px 0;
  background: white;
}

.section-subtitle {
  text-align: center;
  color: #64748b;
  font-size: 1.05rem;
  margin-bottom: 40px;
}

.faq-preview-section h2 {
  margin: 0 0 8px;
  text-align: center;
  font-size: 2rem;
  color: #0f172a;
}

.faq-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.faq-preview-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.faq-preview-header {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.faq-preview-header:hover {
  background: white;
}

.faq-preview-header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #0f172a;
  flex: 1;
}

.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #4f46e5;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.faq-preview-body {
  padding: 0 20px 20px;
  color: #64748b;
  line-height: 1.7;
  font-size: 0.9rem;
  border-top: 1px solid #e2e8f0;
}

/* CTA */
.contact-cta {
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content h2 {
  margin: 0 0 12px;
  font-size: 2.2rem;
  line-height: 1.2;
}

.cta-content p {
  margin: 0 0 28px;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
}

.marketing-button {
  background: white;
  color: #4f46e5;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.marketing-button:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .faq-preview-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 60px 0;
  }

  .contact-methods-section {
    padding: 60px 0;
  }

  .contact-form-section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .methods-grid {
    grid-template-columns: 1fr;
  }

  .form-checkbox {
    flex-direction: column;
    gap: 8px;
  }

  .form-checkbox input {
    margin-top: 4px;
  }
}
</style>
