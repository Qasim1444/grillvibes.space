<template>
  <div class="page">
    <PageHeader
      title="Recipes & Dish Cost"
      subtitle="What each dish is made of, and what that costs at this outlet's current ingredient prices. Cost is never stored — it is worked out from the recipe every time this page loads, so it moves on its own as suppliers move."
    />

    <!-- Summary strip -->
    <div class="rc__kpis">
      <div class="rc__kpi rc__kpi--info">
        <span class="rc__kpi-label">Menu</span>
        <span class="rc__kpi-val">{{ props.summary.total_dishes }}</span>
        <span class="rc__kpi-sub">{{ props.summary.costed }} with a recipe</span>
      </div>
      <div class="rc__kpi" :class="props.summary.uncosted > 0 ? 'rc__kpi--warn' : 'rc__kpi--ok'">
        <span class="rc__kpi-label">Uncosted</span>
        <span class="rc__kpi-val">{{ props.summary.uncosted }}</span>
        <span class="rc__kpi-sub">no recipe, so no COGS</span>
      </div>
      <div class="rc__kpi rc__kpi--ok">
        <span class="rc__kpi-label">Avg. Food Cost</span>
        <span class="rc__kpi-val">{{ props.summary.avg_food_cost === null ? '—' : props.summary.avg_food_cost + '%' }}</span>
        <span class="rc__kpi-sub">across costed dishes</span>
      </div>
      <div class="rc__kpi" :class="props.summary.over_target > 0 ? 'rc__kpi--danger' : 'rc__kpi--ok'">
        <span class="rc__kpi-label">Over 40%</span>
        <span class="rc__kpi-val">{{ props.summary.over_target }}</span>
        <span class="rc__kpi-sub">where margin leaks</span>
      </div>
    </div>

    <p v-if="missingDeepLink" class="rc__notice">
      That dish isn't on this page — search for it by name to open its recipe.
    </p>

    <!-- Filters -->
    <div class="rc__filters">
      <input v-model="search" class="ui-input rc__search" placeholder="Search dish / code…" />
      <select v-model="categoryFilter" class="ui-input" style="width:200px">
        <option value="">All Categories</option>
        <option v-for="c in props.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <div class="rc__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="rc__tab"
          :class="{ 'rc__tab--on': viewFilter === tab.value }"
          @click="viewFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="items"
      empty-text="No dishes match. Food items are created under the menu — recipes are attached to them here."
    >
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span v-if="row.code" class="rc__muted rc__code">{{ row.code }}</span>
        <span class="rc__cat">{{ row.category_name || 'Uncategorised' }}</span>
      </template>

      <template #cell:price="{ value }">{{ fmt(value) }}</template>

      <template #cell:dish_cost="{ row }">
        <span v-if="row.line_count === 0" class="ui-badge ui-badge--muted">No recipe</span>
        <template v-else>
          {{ fmt(row.dish_cost) }}
          <span class="rc__muted rc__lines">{{ row.line_count }} ingredient(s)</span>
        </template>
      </template>

      <template #cell:food_cost_percent="{ row }">
        <span v-if="row.food_cost_percent === null" class="rc__muted">—</span>
        <span v-else class="ui-badge" :class="pctBadge(row.food_cost_percent)">{{ row.food_cost_percent }}%</span>
      </template>

      <template #cell:margin="{ row }">
        <span v-if="row.margin === null" class="rc__muted">—</span>
        <span v-else :class="row.margin < 0 ? 'rc__neg' : ''">{{ fmt(row.margin) }}</span>
      </template>

      <template #cell:portions_available="{ row }">
        <span v-if="row.portions_available === null" class="rc__muted">—</span>
        <span v-else :class="row.portions_available === 0 ? 'rc__neg' : (row.portions_available < 10 ? 'rc__low' : '')">
          {{ row.portions_available }}
        </span>
      </template>

      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openBuilder(row)">
          {{ can('inventory.recipes.update') ? (row.line_count ? 'Edit Recipe' : 'Add Recipe') : 'View Recipe' }}
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.items" :only="['items', 'summary']" />

    <!-- Recipe builder -->
    <Modal v-model="showBuilder" :title="builderTitle" width="880px">
      <div v-if="dish" class="rc__build">
        <!-- Live costing header -->
        <div class="rc__live">
          <div class="rc__live-cell">
            <span class="rc__live-label">Selling Price</span>
            <span class="rc__live-val">{{ fmt(dish.price) }}</span>
          </div>
          <div class="rc__live-cell">
            <span class="rc__live-label">Dish Cost</span>
            <span class="rc__live-val">{{ fmt(liveCost) }}</span>
          </div>
          <div class="rc__live-cell">
            <span class="rc__live-label">Food Cost</span>
            <span class="rc__live-val" :class="livePctClass">{{ livePercent === null ? '—' : livePercent + '%' }}</span>
          </div>
          <div class="rc__live-cell">
            <span class="rc__live-label">Margin</span>
            <span class="rc__live-val" :class="liveMargin < 0 ? 'rc__neg' : 'rc__pos'">{{ fmt(liveMargin) }}</span>
          </div>
        </div>

        <p class="rc__hint">
          Quantities are per portion, in each ingredient's own unit. Unit costs are this outlet's moving average — an
          ingredient with no delivery booked yet costs nothing, which will understate the dish until it is received.
        </p>

        <!-- Lines -->
        <table class="rc__table">
          <thead>
            <tr>
              <th style="width:34%">Ingredient</th>
              <th style="width:16%">Qty / Portion</th>
              <th style="width:14%" class="rc__right">Unit Cost</th>
              <th style="width:14%" class="rc__right">Line Cost</th>
              <th>Note</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!form.lines.length">
              <td colspan="6" class="rc__muted rc__empty">
                No ingredients yet. Add the first line to start costing this dish.
              </td>
            </tr>
            <tr v-for="(line, i) in form.lines" :key="i">
              <td>
                <select v-model="line.ingredient_id" class="ui-input" :disabled="!editable">
                  <option value="">Select…</option>
                  <option v-for="ing in props.ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                </select>
                <span v-if="isDuplicate(line, i)" class="rc__err">Already listed above</span>
              </td>
              <td>
                <div class="rc__qty">
                  <input v-model.number="line.quantity" type="number" step="0.0001" min="0" class="ui-input" :disabled="!editable" />
                  <span class="rc__unit">{{ unitOf(line.ingredient_id) }}</span>
                </div>
              </td>
              <td class="rc__right rc__muted">{{ fmt(costOf(line.ingredient_id)) }}</td>
              <td class="rc__right"><strong>{{ fmt(lineCost(line)) }}</strong></td>
              <td><input v-model="line.note" class="ui-input" placeholder="e.g. diced" :disabled="!editable" /></td>
              <td>
                <button v-if="editable" class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" @click="removeLine(i)">×</button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="form.lines.length">
            <tr>
              <td colspan="3" class="rc__right"><strong>Total</strong></td>
              <td class="rc__right"><strong>{{ fmt(liveCost) }}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <p v-if="form.errors.lines" class="rc__err">{{ form.errors.lines }}</p>

        <button v-if="editable" class="ui-btn ui-btn--secondary ui-btn--sm rc__add" @click="addLine">+ Add Ingredient</button>

        <p v-if="dish.portions_available !== null" class="rc__stockline">
          Current stock can make <strong>{{ dish.portions_available }}</strong> portion(s) of this dish as saved.
        </p>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showBuilder = false">{{ editable ? 'Cancel' : 'Close' }}</button>
        <button v-if="editable" class="ui-btn ui-btn--primary" :disabled="form.processing || hasDuplicates" @click="save">
          Save Recipe
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, onMounted, ref, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import Pagination from '../../components/ui/Pagination.vue';
import Modal from '../../components/ui/Modal.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  items:        { type: Object, default: () => ({ data: [] }) },
  categories:   { type: Array,  default: () => [] },
  ingredients:  { type: Array,  default: () => [] },
  summary:      { type: Object, default: () => ({ total_dishes: 0, costed: 0, uncosted: 0, avg_food_cost: null, over_target: 0 }) },
  filters:      { type: Object, default: () => ({}) },
  openFoodItem: { type: Number, default: null },
});

const columns = [
  { key: 'name',                label: 'Dish' },
  { key: 'price',               label: 'Price' },
  { key: 'dish_cost',           label: 'Cost' },
  { key: 'food_cost_percent',   label: 'Food Cost' },
  { key: 'margin',              label: 'Margin' },
  { key: 'portions_available',  label: 'Portions' },
];

const tabs = [
  { value: '',         label: 'All' },
  { value: 'costed',   label: 'With Recipe' },
  { value: 'uncosted', label: 'Missing Recipe' },
];

const items = computed(() => props.items?.data ?? []);
const editable = computed(() => can('inventory.recipes.update'));

const search = ref(props.filters?.search ?? '');
const categoryFilter = ref(props.filters?.category ?? '');
const viewFilter = ref(props.filters?.view ?? '');

let timer = null;
const reload = () => router.get('/inventory/recipes',
  {
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    view: viewFilter.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['items', 'summary', 'filters'] });
watch([search, categoryFilter, viewFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

// ── Builder ─────────────────────────────────────────────────────────────────
const showBuilder = ref(false);
const dish = ref(null);
const form = useForm({ lines: [] });

const builderTitle = computed(() => dish.value ? `Recipe — ${dish.value.name}` : 'Recipe');

const openBuilder = row => {
  dish.value = row;
  form.clearErrors();
  form.lines = (row.lines ?? []).map(l => ({
    ingredient_id: l.ingredient_id,
    quantity: l.quantity,
    note: l.note ?? '',
  }));
  showBuilder.value = true;
};

const addLine = () => form.lines.push({ ingredient_id: '', quantity: null, note: '' });
const removeLine = i => form.lines.splice(i, 1);

const save = async () => {
  // Blank rows are an unfinished thought, not a line — drop them rather than
  // failing validation on something the user hasn't filled in yet.
  const lines = form.lines
    .filter(l => l.ingredient_id && Number(l.quantity) > 0)
    .map(l => ({ ingredient_id: l.ingredient_id, quantity: l.quantity, note: l.note || null }));

  if (!lines.length && !(await confirmDialog('No ingredients listed. Save an empty recipe? The dish will stop being costed.'))) return;

  form.transform(() => ({ lines })).put(`/inventory/recipes/${dish.value.id}`, {
    preserveScroll: true,
    onSuccess: () => (showBuilder.value = false),
  });
};

// ── Live costing (mirrors RecipeCostService, so the figure moves as you type) ─
const ingredientMap = computed(() => {
  const map = {};
  props.ingredients.forEach(i => { map[i.id] = i; });
  return map;
});

const unitOf = id => ingredientMap.value[id]?.unit ?? '';
const costOf = id => Number(ingredientMap.value[id]?.average_cost ?? 0);
const lineCost = line => round4(Number(line.quantity || 0) * costOf(line.ingredient_id));

const liveCost = computed(() => round4(form.lines.reduce((sum, l) => sum + lineCost(l), 0)));

const livePercent = computed(() => {
  const price = Number(dish.value?.price ?? 0);
  return price > 0 ? Math.round(liveCost.value / price * 10000) / 100 : null;
});

const liveMargin = computed(() => round2(Number(dish.value?.price ?? 0) - liveCost.value));

const livePctClass = computed(() => {
  const pct = livePercent.value;
  if (pct === null) return '';
  return pct > 40 ? 'rc__neg' : (pct > 35 ? 'rc__low' : 'rc__pos');
});

// The database has a unique (dish, ingredient) index, so catch it here where the
// message can point at the offending row.
const isDuplicate = (line, index) => !!line.ingredient_id
  && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);

const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));

// ── Deep link from the Food Items page ──────────────────────────────────────
const missingDeepLink = ref(false);

onMounted(() => {
  if (!props.openFoodItem) return;
  const row = items.value.find(r => r.id === props.openFoodItem);
  if (row) openBuilder(row);
  else missingDeepLink.value = true;
});

// ── Helpers ─────────────────────────────────────────────────────────────────
const round2 = v => Math.round(v * 100) / 100;
const round4 = v => Math.round(v * 10000) / 10000;
const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctBadge = pct => pct > 40 ? 'ui-badge--danger' : (pct > 35 ? 'ui-badge--warning' : 'ui-badge--success');
</script>

<style scoped>
.rc__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.rc__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.rc__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.rc__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.rc__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.rc__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.rc__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.rc__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.rc__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.rc__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.rc__search  { flex: 1; max-width: 300px; }
.rc__tabs    { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 3px; }
.rc__tab     { border: 0; background: transparent; padding: 6px 14px; border-radius: calc(var(--radius) - 3px); font-size: 0.82rem; cursor: pointer; color: var(--text-soft); font-weight: 600; }
.rc__tab--on { background: var(--brand, #6366f1); color: #fff; }
.rc__notice  { background: var(--surface); border: 1px solid var(--warning, #d97706); border-left-width: 3px; border-radius: var(--radius); padding: 10px 14px; font-size: 0.82rem; margin-bottom: 14px; }
.rc__muted   { color: var(--text-soft); }
.rc__code    { font-size: 0.76rem; margin-left: 8px; }
.rc__cat     { display: block; font-size: 0.72rem; color: var(--text-soft); }
.rc__lines   { font-size: 0.72rem; margin-left: 6px; }
.rc__neg     { color: var(--danger, #dc2626); font-weight: 700; }
.rc__pos     { color: var(--success, #16a34a); font-weight: 700; }
.rc__low     { color: var(--warning, #d97706); font-weight: 700; }
.rc__right   { text-align: right; }
.rc__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 0 0 14px; line-height: 1.5; }
.rc__live      { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 14px; }
.rc__live-cell { display: flex; flex-direction: column; gap: 2px; }
.rc__live-label{ font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.rc__live-val  { font-size: 1.15rem; font-weight: 700; }
.rc__table   { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.rc__table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-soft); padding: 6px 8px; border-bottom: 1px solid var(--border); }
.rc__table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
.rc__table th.rc__right, .rc__table td.rc__right { text-align: right; }
.rc__table tfoot td { border-bottom: 0; padding-top: 10px; }
.rc__empty   { text-align: center; padding: 18px 8px; }
.rc__qty     { display: flex; align-items: center; gap: 6px; }
.rc__unit    { font-size: 0.74rem; color: var(--text-soft); white-space: nowrap; }
.rc__add     { margin-top: 12px; }
.rc__err     { color: var(--danger, #dc2626); font-size: 0.74rem; display: block; margin-top: 4px; }
.rc__stockline { font-size: 0.78rem; color: var(--text-soft); margin: 14px 0 0; }
@media (max-width: 900px) { .rc__kpis, .rc__live { grid-template-columns: repeat(2, 1fr); } }
</style>
