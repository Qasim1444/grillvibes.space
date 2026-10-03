<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__logo">J</div>
        <div>
          <strong>GrillVibes</strong>
          <span>Operations</span>
        </div>
      </div>

      <nav class="sidebar__nav" aria-label="Admin sidebar">
        <button type="button" class="nav-item nav-item--active">Dashboard</button>
        <button type="button" class="nav-item">Orders</button>
        <button type="button" class="nav-item">Kitchen Display</button>
        <button type="button" class="nav-item">Menu & Recipes</button>
        <button type="button" class="nav-item">Inventory / Stock</button>
        <button type="button" class="nav-item">Procurement</button>
        <button type="button" class="nav-item">Branches</button>
        <button type="button" class="nav-item">Reports</button>
        <button type="button" class="nav-item">Users & Roles</button>
        <button type="button" class="nav-item">Settings</button>
      </nav>
    </aside>

    <div class="main-panel">
      <header class="topbar">
        <div>
          <p class="topbar__eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>

        <div class="topbar__actions">
          <button class="topbar__icon" type="button" aria-label="Notifications">🔔</button>
          <div class="topbar__user">
            <div class="topbar__avatar">{{ userInitials }}</div>
            <div>
              <strong>{{ userName }}</strong>
              <span>{{ userRole }}</span>
            </div>
          </div>
          <button class="topbar__logout" type="button" @click="logout">Logout</button>
        </div>
      </header>

      <main class="content">
        <div class="page-header">
          <div>
            <h2>Dashboard Overview</h2>
            <p>Track your business and branch performance in real time.</p>
          </div>
          <button class="primary-button" type="button">Export report</button>
        </div>

        <div class="kpi-grid">
          <div v-for="item in kpis" :key="item.label" class="kpi-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small :class="item.trend >= 0 ? 'positive' : 'negative'">
              {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
            </small>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="panel">
            <div class="panel__header">
              <h3>Revenue trend</h3>
              <span>Last 30 days</span>
            </div>
            <div class="chart-bars" aria-label="Revenue chart">
              <div v-for="bar in chartBars" :key="bar.label" class="chart-bar" :style="{ height: bar.value + '%' }">
                <span>{{ bar.label }}</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel__header">
              <h3>Activity</h3>
              <span>Live feed</span>
            </div>
            <ul class="activity-list">
              <li v-for="activity in activities" :key="activity.title">
                <span class="activity-dot" :style="{ background: activity.color }"></span>
                <div>
                  <strong>{{ activity.title }}</strong>
                  <small>{{ activity.time }}</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="panel table-panel">
          <div class="panel__header">
            <h3>Recent activity</h3>
            <button class="ghost-button" type="button">View all</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recentRows" :key="row.source">
                <td>{{ row.source }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.branch }}</td>
                <td><span class="status" :class="statusClass(row.status)">{{ row.status }}</span></td>
                <td>{{ row.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userRole = computed(() => localStorage.getItem('grillvibes_admin_role') === 'SUB_ADMIN' ? 'Sub-Admin' : 'Super Admin');
const userName = computed(() => userRole.value === 'Sub-Admin' ? 'Samir Gomez' : 'Ariana Chen');
const userInitials = computed(() => userName.value.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase());

const kpis = [
  { label: 'Orders today', value: '1,284', trend: 12 },
  { label: 'Avg. ticket', value: '$42.80', trend: 8 },
  { label: 'Inventory alerts', value: '17', trend: -4 },
  { label: 'Open tasks', value: '24', trend: 3 },
];

const chartBars = [
  { label: 'Jan', value: 44 },
  { label: 'Feb', value: 60 },
  { label: 'Mar', value: 52 },
  { label: 'Apr', value: 80 },
  { label: 'May', value: 72 },
  { label: 'Jun', value: 92 },
  { label: 'Jul', value: 76 },
  { label: 'Aug', value: 84 },
];

const activities = [
  { title: 'Inventory restock approved', time: '2 mins ago', color: '#4f46e5' },
  { title: 'Kitchen prep delay alert', time: '12 mins ago', color: '#f59e0b' },
  { title: 'Branch 2 sales crossed target', time: '34 mins ago', color: '#22c55e' },
  { title: 'User role update completed', time: '1 hr ago', color: '#3b82f6' },
];

const recentRows = [
  { source: 'North Tower', type: 'Order', branch: 'Downtown', status: 'Completed', amount: '$1,280' },
  { source: 'Procurement', type: 'Purchase', branch: 'Harbor', status: 'Pending', amount: '$840' },
  { source: 'Inventory', type: 'Adjustment', branch: 'Flagship', status: 'Review', amount: '$155' },
  { source: 'KDS', type: 'Kitchen', branch: 'Riverside', status: 'Running', amount: '$620' },
];

const statusClass = (status) => {
  const map = {
    Completed: 'status--completed',
    Pending: 'status--pending',
    Review: 'status--review',
    Running: 'status--running',
  };
  return map[status] || 'status--pending';
};

const logout = () => {
  localStorage.removeItem('grillvibes_admin_token');
  localStorage.removeItem('grillvibes_admin_role');
  router.push('/login');
};
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: flex;
  background: #f3f6fb;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: white;
  padding: 18px 14px;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.sidebar__logo {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
}

.sidebar__brand strong,
.sidebar__brand span {
  display: block;
}

.sidebar__brand span {
  font-size: 0.72rem;
  color: rgba(191, 219, 254, 0.7);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
}

.nav-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(226, 232, 240, 0.9);
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  font: inherit;
  cursor: pointer;
}

.nav-item--active {
  background: rgba(79, 70, 229, 0.18);
  color: white;
}

.main-panel {
  flex: 1;
}

.topbar {
  height: 78px;
  padding: 18px 26px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar__eyebrow {
  margin: 0 0 4px;
  font-size: 0.72rem;
  color: #6b7280;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topbar h1 {
  margin: 0;
  font-size: 1.35rem;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar__icon {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 10px;
  background: #eef2ff;
  cursor: pointer;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
}

.topbar__user strong,
.topbar__user span {
  display: block;
}

.topbar__user span {
  font-size: 0.7rem;
  color: #6b7280;
}

.topbar__logout {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
}

.content {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 1.8rem;
}

.page-header p {
  margin: 0;
  color: #64748b;
}

.primary-button,
.ghost-button {
  border-radius: 12px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: 0;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.ghost-button {
  border: 1px solid #e2e8f0;
  background: white;
  color: #111827;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.kpi-card,
.panel {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.kpi-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-card span {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kpi-card strong {
  font-size: 1.9rem;
}

.kpi-card small {
  font-weight: 700;
}

.positive { color: #15803d; }
.negative { color: #dc2626; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 18px;
  margin-bottom: 24px;
}

.panel {
  padding: 18px 20px;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 18px;
  border-bottom: 1px solid #eef2f7;
}

.panel__header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.panel__header span {
  font-size: 0.74rem;
  color: #64748b;
}

.chart-bars {
  height: 220px;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.chart-bar {
  position: relative;
  border-radius: 14px 14px 0 0;
  background: linear-gradient(180deg, #a5b4fc, #4f46e5);
  min-height: 30px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

.chart-bar span {
  position: absolute;
  bottom: -22px;
  font-size: 0.68rem;
  color: #64748b;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-list li {
  display: flex;
  gap: 12px;
  align-items: center;
}

.activity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.activity-list strong,
.activity-list small {
  display: block;
}

.activity-list small {
  color: #64748b;
}

.table-panel table {
  width: 100%;
  border-collapse: collapse;
}

.table-panel th,
.table-panel td {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid #eef2f7;
}

.table-panel th {
  color: #64748b;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status--completed { background: #dcfce7; color: #166534; }
.status--pending { background: #fef3c7; color: #92400e; }
.status--review { background: #e0f2fe; color: #075985; }
.status--running { background: #ede9fe; color: #5b21b6; }

@media (max-width: 980px) {
  .admin-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header,
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .topbar__actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}
</style>
