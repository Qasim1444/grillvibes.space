<template>
  <div class="features-page">
    <header class="page-header">
      <div class="container header-content">
        <h1>Powerful Features for Every Aspect of Your Restaurant</h1>
        <p>Comprehensive tools designed to streamline operations, from orders to analytics</p>
      </div>
    </header>

    <main>
      <!-- FEATURE DETAIL 1: ORDERS -->
      <section class="feature-detail">
        <div class="container">
          <div class="feature-layout">
            <div class="feature-text">
              <span class="feature-badge">📋</span>
              <h2>Order Management System</h2>
              <p>Capture and manage orders from all channels in one unified system. Streamline the entire order lifecycle from placement to fulfillment.</p>
              <ul class="feature-benefits">
                <li>Accept orders from dine-in, takeaway, and delivery</li>
                <li>Real-time order synchronization across POS systems</li>
                <li>Intelligent order routing to kitchen stations</li>
                <li>Customer order history and preferences</li>
                <li>Integration with delivery platforms</li>
                <li>Order modification and special requests handling</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview">
                  <div class="preview-header">Orders Dashboard</div>
                  <div class="preview-items">
                    <div class="preview-item">Order #1024</div>
                    <div class="preview-item">Order #1025</div>
                    <div class="preview-item">Order #1026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE DETAIL 2: KITCHEN DISPLAY -->
      <section class="feature-detail feature-detail--alt">
        <div class="container">
          <div class="feature-layout feature-layout--reverse">
            <div class="feature-text">
              <span class="feature-badge">👨‍🍳</span>
              <h2>Kitchen Display System (KDS)</h2>
              <p>Coordinate your entire kitchen operation with real-time visibility into all orders, prep requirements, and station assignments.</p>
              <ul class="feature-benefits">
                <li>Real-time kitchen queue with visual alerts</li>
                <li>Multi-station management and assignment</li>
                <li>Order priority and timer management</li>
                <li>Prep time tracking and optimization</li>
                <li>Multiple display screens for different stations</li>
                <li>Automatic order bundling for efficiency</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview kds-preview">
                  <div class="kds-station">Station 1</div>
                  <div class="kds-station active">Station 2</div>
                  <div class="kds-station">Station 3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE DETAIL 3: INVENTORY -->
      <section class="feature-detail">
        <div class="container">
          <div class="feature-layout">
            <div class="feature-text">
              <span class="feature-badge">📦</span>
              <h2>Inventory & Stock Management</h2>
              <p>Track stock levels in real-time, set par levels, receive alerts for low stock, and minimize food waste across your operations.</p>
              <ul class="feature-benefits">
                <li>Real-time inventory tracking</li>
                <li>Par level management and alerts</li>
                <li>Stock movement history and analytics</li>
                <li>Barcode scanning for accuracy</li>
                <li>Waste tracking and reporting</li>
                <li>Multi-location inventory sync</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview">
                  <div class="inventory-item">🥕 Carrots - 45 units</div>
                  <div class="inventory-item warning">🧅 Onions - 8 units (Low)</div>
                  <div class="inventory-item">🍗 Chicken - 120 units</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE DETAIL 4: PROCUREMENT -->
      <section class="feature-detail feature-detail--alt">
        <div class="container">
          <div class="feature-layout feature-layout--reverse">
            <div class="feature-text">
              <span class="feature-badge">🚚</span>
              <h2>Procurement & Vendor Management</h2>
              <p>Manage vendor relationships, create purchase orders, track goods receipts, and automate your procurement workflow.</p>
              <ul class="feature-benefits">
                <li>Vendor database and relationship tracking</li>
                <li>Purchase order creation and tracking</li>
                <li>Goods receipt management</li>
                <li>Automated reordering based on par levels</li>
                <li>Pricing history and cost comparison</li>
                <li>Invoice and payment tracking</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview">
                  <div class="vendor-item">Fresh Farms Ltd - 12 active POs</div>
                  <div class="vendor-item">Quality Meats Inc - 8 active POs</div>
                  <div class="vendor-item">Organic Produce Co - 5 active POs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE DETAIL 5: RECIPES -->
      <section class="feature-detail">
        <div class="container">
          <div class="feature-layout">
            <div class="feature-text">
              <span class="feature-badge">📖</span>
              <h2>Recipe & Costing Management</h2>
              <p>Standardize recipes, calculate food costs accurately, and track ingredient usage per dish for better profitability.</p>
              <ul class="feature-benefits">
                <li>Recipe creation and standardization</li>
                <li>Ingredient cost tracking</li>
                <li>Automatic recipe costing</li>
                <li>Portion size management</li>
                <li>Recipe modification history</li>
                <li>Nutritional information tracking</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview">
                  <div class="recipe-item">Margherita Pizza - $2.50 cost</div>
                  <div class="recipe-item">Caesar Salad - $1.80 cost</div>
                  <div class="recipe-item">Beef Burger - $3.20 cost</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE DETAIL 6: ANALYTICS -->
      <section class="feature-detail feature-detail--alt">
        <div class="container">
          <div class="feature-layout feature-layout--reverse">
            <div class="feature-text">
              <span class="feature-badge">📊</span>
              <h2>Analytics & Reporting</h2>
              <p>Get actionable insights with real-time dashboards, custom reports, and data-driven recommendations for your business.</p>
              <ul class="feature-benefits">
                <li>Real-time sales and revenue tracking</li>
                <li>Profitability analysis by dish and category</li>
                <li>Staff performance and productivity metrics</li>
                <li>Customer insights and behavior tracking</li>
                <li>Custom report builder</li>
                <li>Predictive analytics and forecasting</li>
              </ul>
              <button class="marketing-button" @click="goToLogin">Get started free</button>
            </div>
            <div class="feature-visual">
              <div class="visual-placeholder">
                <div class="feature-preview analytics-preview">
                  <div class="chart-bar" style="height: 60%"></div>
                  <div class="chart-bar" style="height: 75%"></div>
                  <div class="chart-bar" style="height: 45%"></div>
                  <div class="chart-bar" style="height: 90%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA SECTION -->
      <section class="features-cta">
        <div class="container cta-content">
          <h2>Ready to transform your restaurant operations?</h2>
          <p>Get started with a free 14-day trial. No credit card required.</p>
          <button class="marketing-button" @click="goToLogin">Start free trial</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3';

const goToLogin = () => {
  router.visit('/login');
};
</script>

<style scoped>
.features-page {
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
  padding: 100px 0;
  text-align: center;
}

.header-content h1 {
  margin: 0 0 16px;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  line-height: 1.2;
}

.header-content p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

.feature-detail {
  padding: 80px 0;
  border-bottom: 1px solid #e2e8f0;
}

.feature-detail:last-of-type {
  border-bottom: none;
}

.feature-detail--alt {
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.03), rgba(14, 116, 144, 0.03));
}

.feature-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.feature-layout--reverse {
  direction: rtl;
}

.feature-layout--reverse > * {
  direction: ltr;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-badge {
  font-size: 3rem;
  line-height: 1;
}

.feature-text h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1.2;
}

.feature-text > p {
  margin: 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
}

.feature-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-benefits li {
  color: #475569;
  font-size: 0.95rem;
  padding-left: 28px;
  position: relative;
  line-height: 1.6;
}

.feature-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.feature-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-placeholder {
  width: 100%;
  padding: 40px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.feature-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  padding: 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 600;
  color: #0f172a;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  color: #78350f;
  font-size: 0.9rem;
  font-weight: 500;
}

.kds-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.kds-station {
  padding: 24px;
  background: #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
}

.kds-station.active {
  background: #10b981;
  color: white;
}

.inventory-item {
  padding: 12px;
  background: #e0f2fe;
  border-radius: 6px;
  color: #0369a1;
  font-weight: 500;
  margin-bottom: 8px;
}

.inventory-item.warning {
  background: #fef3c7;
  color: #78350f;
}

.vendor-item {
  padding: 12px;
  background: #dbeafe;
  border-radius: 6px;
  color: #1e40af;
  font-weight: 500;
  margin-bottom: 8px;
}

.recipe-item {
  padding: 12px;
  background: #f3e8ff;
  border-radius: 6px;
  color: #6b21a8;
  font-weight: 500;
  margin-bottom: 8px;
}

.analytics-preview {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #4f46e5, #7c3aed);
  border-radius: 4px;
  min-height: 20px;
}

.features-cta {
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content h2 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
}

.cta-content p {
  margin: 0 0 28px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.marketing-button {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  box-shadow: 0 18px 35px rgba(79, 70, 229, 0.22);
  transition: all 0.2s;
}

.marketing-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 45px rgba(79, 70, 229, 0.28);
}

.features-cta .marketing-button {
  background: white;
  color: #4f46e5;
  box-shadow: none;
}

.features-cta .marketing-button:hover {
  background: #f1f5f9;
}

@media (max-width: 768px) {
  .feature-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .feature-layout--reverse {
    direction: ltr;
  }

  .feature-detail {
    padding: 60px 0;
  }

  .page-header {
    padding: 60px 0;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .kds-preview {
    grid-template-columns: 1fr;
  }
}
</style>
