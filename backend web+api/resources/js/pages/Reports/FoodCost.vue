<template>
  <div class="page">
    <PageHeader
      title="Food Cost & Margin"
      :subtitle="`Two clocks, side by side. Each dish is priced at ${props.branchName || 'this outlet'}'s ingredient costs today; the COGS below it is what the food actually cost when it was sold, snapshotted onto each order at the time. They differ when supplier prices have moved — that is the point, not an error.`"
    />

    <!-- Period -->
    <div class="fc__filters">
      <label class="fc__field">
        <span class="fc__field-label">From</span>
        <input v-model="from" type="date" class="ui-input" />
      </label>
      <label class="fc__field">
        <span class="fc__field-label">To</span>
        <input v-model="to" type="date" class="ui-input" />
      </label>
      <label class="fc__field">
        <span class="fc__field-label">Category</span>
        <select v-model="categoryFilter" class="ui-input">
          <option value="">All Categories</option>
          <option v-for="c in props.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="fc__field">
        <span class="fc__field-label">Sort</span>
        <select v-model="sort" class="ui-input">
          <option value="revenue">Highest Revenue</option>
          <option value="food_cost">Worst Food Cost</option>
          <option value="margin">Thinnest Margin</option>
          <option value="units">Most Sold</option>
          <option value="name">Name</option>
        </select>
      </label>
      <div class="fc__presets">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="preset('month')">This Month</button>
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="preset('last')">Last Month</button>
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="preset('week')">Last 7 Days</button>
      </div>
    </div>

    <!-- Period P&L on food -->
    <div class="fc__kpis">
      <div class="fc__kpi fc__kpi--info">
        <span class="fc__kpi-label">Revenue</span>
        <span class="fc__kpi-val">{{ fmt(props.orders.revenue) }}</span>
        <span class="fc__kpi-sub">{{ props.orders.orders }} order(s)</span>
      </div>
      <div class="fc__kpi fc__kpi--warn">
        <span class="fc__kpi-label">Food Cost (COGS)</span>
        <span class="fc__kpi-val">{{ fmt(props.orders.cogs) }}</span>
        <span class="fc__kpi-sub">at the prices paid then</span>
      </div>
      <div class="fc__kpi" :class="foodCostClass(props.orders.food_cost_percent)">
        <span class="fc__kpi-label">Food Cost %</span>
        <span class="fc__kpi-val">{{ pct(props.orders.food_cost_percent) }}</span>
        <span class="fc__kpi-sub">target under {{ props.target }}%</span>
      </div>
      <div class="fc__kpi fc__kpi--ok">
        <span class="fc__kpi-label">Gross Profit</span>
        <span class="fc__kpi-val">{{ fmt(props.orders.gross_profit) }}</span>
        <span class="fc__kpi-sub">{{ pct(props.orders.gross_margin_percent) }} margin</span>
      </div>
    </div>

    <!-- Data-quality warnings: both make every figure above look better than it is -->
    <div v-if="props.orders.uncosted_orders > 0 || props.totals.understating > 0" class="fc__warnings">
      <p v-if="props.orders.uncosted_orders > 0" class="fc__warning">
        <strong>{{ props.orders.uncosted_orders }}</strong> of {{ props.orders.orders }} order(s) in this period were never
        costed — placed before their dishes had recipes, or reversed since. COGS above is a floor, not the full figure.
      </p>
      <p v-if="props.totals.understating > 0" class="fc__warning">
        <strong>{{ props.totals.understating }}</strong> dish(es) sold without a recipe, contributing revenue but no cost.
        <Link href="/inventory/recipes?view=uncosted" class="fc__link">Add their recipes</Link> to close the gap.
      </p>
    </div>

    <!-- Menu-wide costing coverage -->
    <div class="fc__strip">
      <span><strong>{{ props.totals.costed }}</strong> of {{ props.totals.dishes }} dishes costed</span>
      <span><strong>{{ props.totals.over_target }}</strong> over the {{ props.target }}% target</span>
      <span><strong>{{ props.totals.sold }}</strong> sold in this period</span>
      <span><strong>{{ qty(props.totals.units_sold) }}</strong> units</span>
    </div>

    <DataTable
      :columns="columns"
      :rows="props.dishes"
      searchable
      search-placeholder="Search dish…"
      empty-text="No dishes match this period and category."
    >
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span class="fc__cat">{{ row.category_name || 'Uncategorised' }}</span>
      </template>

      <template #cell:price="{ value }">{{ fmt(value) }}</template>

      <template #cell:dish_cost="{ row }">
        <span v-if="!row.has_recipe" class="ui-badge ui-badge--muted">No recipe</span>
        <span v-else>{{ fmt(row.dish_cost) }}</span>
      </template>

      <template #cell:food_cost_percent="{ row }">
        <span v-if="row.food_cost_percent === null" class="fc__muted">—</span>
        <span v-else class="ui-badge" :class="pctBadge(row.food_cost_percent)">{{ row.food_cost_percent }}%</span>
      </template>

      <template #cell:margin="{ row }">
        <span v-if="row.margin === null" class="fc__muted">—</span>
        <span v-else :class="row.margin < 0 ? 'fc__neg' : ''">{{ fmt(row.margin) }}</span>
      </template>

      <template #cell:units_sold="{ row }">
        <span v-if="row.units_sold > 0">{{ qty(row.units_sold) }}</span>
        <span v-else class="fc__muted">—</span>
      </template>

      <template #cell:revenue="{ row }">
        <span v-if="row.units_sold > 0">{{ fmt(row.revenue) }}</span>
        <span v-else class="fc__muted">—</span>
      </template>

      <template #cell:cogs="{ row }">
        <span v-if="row.understates_cogs" class="fc__muted" title="Sold with no recipe, so no cost was recorded.">
          not costed
        </span>
        <span v-else-if="row.units_sold > 0">{{ fmt(row.cogs) }}</span>
        <span v-else class="fc__muted">—</span>
      </template>

      <template #cell:gross_profit="{ row }">
        <template v-if="row.units_sold > 0">
          <strong :class="row.gross_profit < 0 ? 'fc__neg' : ''">{{ fmt(row.gross_profit) }}</strong>
          <span v-if="row.gross_margin_percent !== null" class="fc__cat">{{ row.gross_margin_percent }}% margin</span>
        </template>
        <span v-else class="fc__muted">—</span>
      </template>

      <template #actions="{ row }">
        <Link
          v-if="can('inventory.recipes.view')"
          :href="`/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`"
          class="ui-btn ui-btn--ghost ui-btn--sm"
        >{{ row.has_recipe ? 'Recipe' : 'Add Recipe' }}</Link>
      </template>
    </DataTable>

    <p class="fc__foot">
      Showing the whole menu, not just what sold — a dish with a bad food cost is worth seeing before it sells, not after.
      Dish cost and margin are today's figures; revenue, COGS and gross profit are for
      {{ fmtDate(props.filters.from) }} – {{ fmtDate(props.filters.to) }}.
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  dishes:     { type: Array,  default: () => [] },
  totals:     { type: Object, default: () => ({ dishes: 0, costed: 0, over_target: 0, sold: 0, units_sold: 0, revenue: 0, cogs: 0, gross_profit: 0, gross_margin_percent: null, understating: 0 }) },
  orders:     { type: Object, default: () => ({ orders: 0, revenue: 0, cogs: 0, gross_profit: 0, gross_margin_percent: null, food_cost_percent: null, uncosted_orders: 0, costed_orders: 0 }) },
  categories: { type: Array,  default: () => [] },
  branchName: { type: String, default: '' },
  target:     { type: Number, default: 35 },
  filters:    { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'name',              label: 'Dish' },
  { key: 'price',             label: 'Price' },
  { key: 'dish_cost',         label: 'Cost Today' },
  { key: 'food_cost_percent', label: 'Food Cost' },
  { key: 'margin',            label: 'Margin' },
  { key: 'units_sold',        label: 'Sold' },
  { key: 'revenue',           label: 'Revenue' },
  { key: 'cogs',              label: 'COGS' },
  { key: 'gross_profit',      label: 'Gross Profit' },
];

const from = ref(props.filters?.from ?? '');
const to = ref(props.filters?.to ?? '');
const categoryFilter = ref(props.filters?.category ?? '');
const sort = ref(props.filters?.sort ?? 'revenue');

let timer = null;
const reload = () => router.get('/reports/food-cost',
  {
    from: from.value || undefined,
    to: to.value || undefined,
    category: categoryFilter.value || undefined,
    sort: sort.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['dishes', 'totals', 'orders', 'filters'] });
watch([from, to, categoryFilter, sort], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const preset = which => {
  const now = new Date();
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (which === 'month') {
    from.value = iso(new Date(now.getFullYear(), now.getMonth(), 1));
    to.value = iso(now);
  } else if (which === 'last') {
    from.value = iso(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    to.value = iso(new Date(now.getFullYear(), now.getMonth(), 0));
  } else {
    from.value = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    to.value = iso(now);
  }
};

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = v => Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 });
const pct = v => v === null || v === undefined ? '—' : v + '%';
const fmtDate = v => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const pctBadge = p => p > props.target + 5 ? 'ui-badge--danger' : (p > props.target ? 'ui-badge--warning' : 'ui-badge--success');
const foodCostClass = p => {
  if (p === null || p === undefined) return 'fc__kpi--muted';
  return p > props.target + 5 ? 'fc__kpi--danger' : (p > props.target ? 'fc__kpi--warn' : 'fc__kpi--ok');
};
</script>

<style scoped>
.fc__filters   { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; align-items: flex-end; }
.fc__field     { display: flex; flex-direction: column; gap: 4px; }
.fc__field-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.fc__presets   { display: flex; gap: 6px; margin-left: auto; }
.fc__kpis      { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.fc__kpi       { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.fc__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.fc__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.fc__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.fc__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.fc__kpi--muted  { border-left: 3px solid var(--border); }
.fc__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.fc__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.fc__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.fc__warnings  { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.fc__warning   { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--warning, #d97706); border-radius: var(--radius); padding: 10px 14px; font-size: 0.8rem; margin: 0; line-height: 1.5; }
.fc__link      { color: var(--brand, #6366f1); text-decoration: underline; }
.fc__strip     { display: flex; gap: 22px; flex-wrap: wrap; font-size: 0.8rem; color: var(--text-soft); margin-bottom: 14px; padding: 0 2px; }
.fc__muted     { color: var(--text-soft); }
.fc__cat       { display: block; font-size: 0.72rem; color: var(--text-soft); }
.fc__neg       { color: var(--danger, #dc2626); font-weight: 700; }
.fc__foot      { font-size: 0.78rem; color: var(--text-soft); margin-top: 16px; line-height: 1.5; }
@media (max-width: 900px) { .fc__kpis { grid-template-columns: repeat(2, 1fr); } .fc__presets { margin-left: 0; } }
</style>
