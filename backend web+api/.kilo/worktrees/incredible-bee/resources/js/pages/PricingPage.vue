<template>
  <div class="pricing-page">
    <header class="page-header">
      <div class="container header-content">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the perfect plan for your restaurant. All plans include 14-day free trial.</p>
      </div>
    </header>

    <main>
      <!-- PRICING TOGGLE -->
      <section class="pricing-section">
        <div class="container">
          <div class="pricing-toggle-wrapper">
            <div class="pricing-toggle">
              <button type="button" :class="{ active: billing === 'monthly' }" @click="billing = 'monthly'">Monthly billing</button>
              <button type="button" :class="{ active: billing === 'annual' }" @click="billing = 'annual'">Annual billing <span class="discount-badge">Save 20%</span></button>
            </div>
          </div>

          <!-- PRICING CARDS -->
          <div class="pricing-grid">
            <article v-for="plan in plans" :key="plan.name" class="pricing-card" :class="{ 'pricing-card--featured': plan.featured }">
              <div class="pricing-card__label" v-if="plan.featured">Most popular</div>
              <h3>{{ plan.name }}</h3>
              <p class="plan-subtitle">{{ plan.subtitle }}</p>

              <div class="price-section">
                <div class="price-row">
                  <span class="currency">$</span>
                  <strong>{{ billing === 'annual' ? Math.floor(plan.annual) : Math.floor(plan.monthly) }}</strong>
                  <span class="period">/month</span>
                </div>
                <p class="price-note">{{ plan.priceNote }}</p>
              </div>

              <button type="button" class="marketing-button" :class="plan.featured ? '' : 'marketing-button--secondary'" @click="goToLogin">
                {{ plan.cta }}
              </button>

              <div class="plan-includes">
                <p class="includes-label">Includes:</p>
                <ul class="features-list">
                  <li v-for="feature in plan.features" :key="feature">
                    <span class="checkmark">✓</span>
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </article>
          </div>

          <!-- COMPARISON TABLE -->
          <div class="comparison-section">
            <h2>Detailed Feature Comparison</h2>
            <div class="comparison-table">
              <div class="table-header">
                <div class="table-cell feature-name">Feature</div>
                <div class="table-cell plan-name">Starter</div>
                <div class="table-cell plan-name">Growth</div>
                <div class="table-cell plan-name">Enterprise</div>
              </div>

              <div v-for="(category, index) in comparisonData" :key="category.name" class="comparison-category">
                <div class="category-header">{{ category.name }}</div>
                <div v-for="feature in category.features" :key="feature.name" class="table-row" :class="{ 'row-alt': index % 2 === 1 }">
                  <div class="table-cell feature-name">{{ feature.name }}</div>
                  <div class="table-cell">{{ feature.starter }}</div>
                  <div class="table-cell">{{ feature.growth }}</div>
                  <div class="table-cell">{{ feature.enterprise }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ SECTION -->
          <div class="pricing-faq">
            <h2>Frequently Asked Questions</h2>
            <div class="faq-grid">
              <div v-for="(item, index) in pricingFaqs" :key="item.q" class="faq-card">
                <div class="faq-header" @click="expandedFaq = expandedFaq === index ? -1 : index">
                  <h3>{{ item.q }}</h3>
                  <span class="toggle">{{ expandedFaq === index ? '−' : '+' }}</span>
                </div>
                <div v-if="expandedFaq === index" class="faq-body">
                  {{ item.a }}
                </div>
              </div>
            </div>
          </div>

          <!-- FINAL CTA -->
          <div class="pricing-cta">
            <h2>Ready to get started?</h2>
            <p>Join 500+ restaurants that trust GrillVibes with their operations.</p>
            <button class="marketing-button" @click="goToLogin">Start your free trial</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
const billing = ref('monthly');
const expandedFaq = ref(0);

const plans = [
  {
    name: 'Starter',
    subtitle: 'For independent restaurants',
    monthly: 99,
    annual: 79,
    cta: 'Start free trial',
    priceNote: 'per location • billed monthly',
    features: [
      'Up to 1 location',
      'Orders & POS integration',
      'Basic inventory tracking',
      'Simple reporting dashboard',
      'Email support',
      'Mobile app access',
      '14-day free trial',
    ]
  },
  {
    name: 'Growth',
    subtitle: 'For growing restaurants',
    monthly: 249,
    annual: 199,
    cta: 'Choose Growth',
    featured: true,
    priceNote: 'per location • billed monthly',
    features: [
      'Up to 5 locations',
      'Kitchen display system',
      'Advanced inventory management',
      'Procurement workflows',
      'Advanced analytics & reporting',
      'API access',
      'Priority email & chat support',
      'Custom integrations',
      'Team training included',
    ]
  },
  {
    name: 'Enterprise',
    subtitle: 'For large franchises',
    monthly: 599,
    annual: 479,
    cta: 'Contact sales',
    priceNote: 'unlimited locations • custom pricing',
    features: [
      'Unlimited locations',
      'Dedicated account manager',
      'Custom onboarding & training',
      'Multi-brand permissions',
      'White-label options',
      'Advanced API & webhooks',
      'Phone & priority support',
      'Custom integrations',
      'Data export & analytics',
      'Security & compliance',
    ]
  },
];

const comparisonData = [
  {
    name: 'Core Features',
    features: [
      { name: 'Locations included', starter: '1', growth: '5', enterprise: 'Unlimited' },
      { name: 'Orders management', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'POS integration', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Kitchen display system', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Menu management', starter: '✓', growth: '✓', enterprise: '✓' },
    ]
  },
  {
    name: 'Inventory & Operations',
    features: [
      { name: 'Inventory tracking', starter: 'Basic', growth: 'Advanced', enterprise: 'Advanced+' },
      { name: 'Stock alerts', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Procurement module', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Vendor management', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Recipe management', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Food cost tracking', starter: '−', growth: '✓', enterprise: '✓' },
    ]
  },
  {
    name: 'Analytics & Reporting',
    features: [
      { name: 'Basic reports', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Advanced analytics', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Custom reports', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Predictive analytics', starter: '−', growth: '−', enterprise: '✓' },
      { name: 'Data export', starter: '−', growth: 'Limited', enterprise: '✓' },
    ]
  },
  {
    name: 'Support & Integrations',
    features: [
      { name: 'Email support', starter: '✓', growth: '✓', enterprise: '✓' },
      { name: 'Chat support', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Phone support', starter: '−', growth: '−', enterprise: '✓' },
      { name: 'API access', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Custom integrations', starter: '−', growth: '✓', enterprise: '✓' },
      { name: 'Dedicated account manager', starter: '−', growth: '−', enterprise: '✓' },
    ]
  },
];

const pricingFaqs = [
  {
    q: 'Do I need to provide a credit card for the free trial?',
    a: 'No, you do not need a credit card to start your free trial. You can explore GrillVibes for 14 days completely free. We\'ll only ask for payment if you decide to subscribe after the trial ends.'
  },
  {
    q: 'Can I upgrade or downgrade my plan anytime?',
    a: 'Absolutely! You can change your plan at any time. If you upgrade, we\'ll pro-rate the cost. If you downgrade, we\'ll credit your account. Charges only apply monthly or annually based on your billing cycle.'
  },
  {
    q: 'What happens after my free trial ends?',
    a: 'After 14 days, you\'ll need to select a plan to continue using GrillVibes. You\'ll receive multiple reminders before the trial expires. Your data is never deleted, and you can pause or cancel anytime.'
  },
  {
    q: 'Is the price per location or per account?',
    a: 'Pricing is per location. So if you have 3 locations and choose the Growth plan at $249/month, your total cost would be $747/month. However, Enterprise plans offer unlimited locations with custom pricing.'
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes! We offer 20% discount on all plans when you pay annually instead of monthly. So the Growth plan would be $1,990/year instead of $2,988/year (about $199/month).'
  },
  {
    q: 'What\'s included in the "custom integrations"?',
    a: 'Our team can help integrate GrillVibes with your existing systems like accounting software, delivery platforms, or internal tools. Growth plans get support for 2 custom integrations, while Enterprise gets unlimited.'
  },
  {
    q: 'Is there a setup fee or onboarding cost?',
    a: 'No setup fees! Starter plans include self-service onboarding. Growth and Enterprise plans include dedicated onboarding support at no extra cost to help you launch quickly.'
  },
  {
    q: 'Can I get a refund if I\'m not satisfied?',
    a: 'We\'re confident you\'ll love GrillVibes. If you\'re not satisfied within the first 30 days, we\'ll provide a full refund. No questions asked.'
  },
];

const goToLogin = () => {
  router.visit('/login');
};
</script>

<style scoped>
.pricing-page {
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

.pricing-section {
  padding: 80px 0;
}

.pricing-toggle-wrapper {
  text-align: center;
  margin-bottom: 56px;
}

.pricing-toggle {
  display: flex;
  gap: 12px;
  justify-content: center;
  background: white;
  padding: 8px;
  border-radius: 12px;
  width: fit-content;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
}

.pricing-toggle button {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
  font-size: 0.95rem;
  white-space: nowrap;
}

.pricing-toggle button.active {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.discount-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 4px 8px;
  background: #10b981;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
  max-width: 1100px;
  margin: 0 auto 80px;
}

.pricing-card {
  padding: 40px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  box-shadow: 0 12px 40px rgba(79, 70, 229, 0.12);
}

.pricing-card--featured {
  border-color: #4f46e5;
  transform: scale(1.05);
  box-shadow: 0 20px 50px rgba(79, 70, 229, 0.2);
}

.pricing-card__label {
  position: absolute;
  top: -14px;
  left: 20px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.pricing-card h3 {
  margin: 0 0 8px;
  font-size: 1.4rem;
  color: #0f172a;
}

.plan-subtitle {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 0.9rem;
}

.price-section {
  margin: 20px 0 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.currency {
  color: #64748b;
  font-size: 1.2rem;
}

.price-row strong {
  font-size: 2.8rem;
  color: #0f172a;
}

.period {
  color: #64748b;
  font-size: 1rem;
}

.price-note {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.marketing-button {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  box-shadow: 0 18px 35px rgba(79, 70, 229, 0.22);
  transition: all 0.2s;
  margin-bottom: 24px;
}

.marketing-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 45px rgba(79, 70, 229, 0.28);
}

.marketing-button--secondary {
  background: #eef2ff;
  color: #1f2937;
  box-shadow: none;
}

.marketing-button--secondary:hover {
  background: #e0e7ff;
}

.plan-includes {
  margin-top: auto;
}

.includes-label {
  margin: 0 0 14px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.1em;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features-list li {
  color: #475569;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkmark {
  color: #10b981;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* COMPARISON TABLE */
.comparison-section {
  margin-top: 100px;
  padding-top: 80px;
  border-top: 2px solid #e2e8f0;
}

.comparison-section h2 {
  margin: 0 0 40px;
  text-align: center;
  font-size: 2rem;
  color: #0f172a;
}

.comparison-table {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 700;
  color: #0f172a;
}

.table-cell {
  padding: 16px 20px;
  border-right: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.table-cell:last-child {
  border-right: none;
}

.feature-name {
  color: #0f172a;
  font-weight: 600;
}

.plan-name {
  text-align: center;
  color: #4f46e5;
}

.comparison-category {
  border-bottom: 1px solid #e2e8f0;
}

.category-header {
  padding: 16px 20px;
  background: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e2e8f0;
}

.table-row.row-alt {
  background: #f8fafc;
}

.table-row .table-cell {
  padding: 14px 20px;
  font-size: 0.9rem;
  color: #475569;
  text-align: center;
}

.table-row .feature-name {
  text-align: left;
  color: #374151;
}

/* PRICING FAQ */
.pricing-faq {
  margin-top: 80px;
  padding-top: 80px;
  border-top: 2px solid #e2e8f0;
}

.pricing-faq h2 {
  margin: 0 0 40px;
  text-align: center;
  font-size: 2rem;
  color: #0f172a;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.faq-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.faq-header {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.faq-header:hover {
  background: #f8fafc;
}

.faq-header h3 {
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

.faq-body {
  padding: 0 20px 20px;
  color: #64748b;
  line-height: 1.7;
  font-size: 0.9rem;
  border-top: 1px solid #e2e8f0;
}

/* PRICING CTA */
.pricing-cta {
  margin-top: 80px;
  padding: 60px;
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  border-radius: 16px;
  text-align: center;
  color: white;
}

.pricing-cta h2 {
  margin: 0 0 12px;
  font-size: 2.2rem;
  line-height: 1.2;
}

.pricing-cta p {
  margin: 0 0 28px;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
}

.pricing-cta .marketing-button {
  width: auto;
  background: white;
  color: #4f46e5;
  box-shadow: none;
}

.pricing-cta .marketing-button:hover {
  background: #f1f5f9;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card--featured {
    transform: scale(1);
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
  }

  .plan-name,
  .table-row .table-cell:not(.feature-name) {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr 1fr;
  }

  .table-row .feature-name {
    grid-column: 1;
  }

  .comparison-section {
    margin-top: 60px;
    padding-top: 60px;
  }

  .page-header {
    padding: 60px 0;
  }

  .pricing-section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .pricing-toggle {
    flex-direction: column;
    width: 100%;
  }

  .pricing-toggle button {
    width: 100%;
  }

  .pricing-cta {
    padding: 40px 20px;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
