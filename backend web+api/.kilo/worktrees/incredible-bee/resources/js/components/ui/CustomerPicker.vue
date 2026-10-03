<template>
  <div class="cpick ui-field" :class="{ 'ui-field--error': error }">
    <label v-if="label" class="ui-label" :for="fieldId">{{ label }}</label>

    <div class="cpick__control">
      <input
        :id="fieldId"
        class="ui-input cpick__input"
        type="text"
        autocomplete="off"
        :placeholder="placeholder"
        :value="text"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="pickActive"
        @keydown.esc="open = false"
      />
      <span v-if="loading" class="cpick__spinner" aria-hidden="true"></span>
      <button
        v-else-if="text"
        type="button"
        class="cpick__clear"
        aria-label="Clear selection"
        @mousedown.prevent="clear"
      >
        &times;
      </button>
    </div>

    <ul v-if="open" class="cpick__menu" role="listbox">
      <li v-if="loading" class="cpick__state">Searching…</li>
      <li v-else-if="noResults" class="cpick__state">No customers found.</li>
      <li
        v-for="(c, i) in results"
        v-else
        :key="c.id"
        class="cpick__option"
        :class="{ 'cpick__option--active': i === activeIndex }"
        role="option"
        :aria-selected="i === activeIndex"
        @mousedown.prevent="pick(c)"
        @mouseenter="activeIndex = i"
      >
        <span class="cpick__name">{{ c.name }}</span>
        <span v-if="c.contact" class="cpick__contact">{{ c.contact }}</span>
      </li>
    </ul>

    <p v-if="error" class="ui-field__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

/**
 * Debounced customer typeahead. The full customer table can hold 100k+ rows and
 * is never shipped to the client, so the Orders / POS customer fields resolve
 * matches on demand via GET /customers/search (capped, JSON). v-model is the
 * selected customer id (or null); `initialName` seeds the visible label when
 * editing an order that already has a customer.
 *
 * `@picked` additionally hands over the whole matched row (or null when cleared)
 * for callers that need more than the id — POS reads `loyalty_points_balance`
 * off it to offer points redemption without a second request.
 */
const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Search customer…" },
  error: { type: String, default: "" },
  initialName: { type: String, default: "" },
  endpoint: { type: String, default: "/customers/search" },
});

const emit = defineEmits(["update:modelValue", "picked"]);

const fieldId = computed(
  () => `cp-${(props.label || "customer").toLowerCase().replace(/\s+/g, "-")}`
);

const text = ref("");
const selectedName = ref("");
const results = ref([]);
const open = ref(false);
const loading = ref(false);
const noResults = ref(false);
const activeIndex = ref(0);
let debounceTimer = null;
let blurTimer = null;

const runSearch = async (q) => {
  loading.value = true;
  noResults.value = false;
  open.value = true;
  try {
    const res = await fetch(`${props.endpoint}?q=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error(`search failed (${res.status})`);
    results.value = await res.json();
    noResults.value = results.value.length === 0;
    activeIndex.value = 0;
  } catch {
    results.value = [];
    noResults.value = true;
  } finally {
    loading.value = false;
  }
};

const onInput = (e) => {
  const q = e.target.value;
  text.value = q;
  clearTimeout(debounceTimer);
  if (!q.trim()) {
    results.value = [];
    noResults.value = false;
    open.value = false;
    // Emptying the field clears the selection.
    emit("update:modelValue", null);
    emit("picked", null);
    selectedName.value = "";
    return;
  }
  debounceTimer = setTimeout(() => runSearch(q.trim()), 300);
};

const pick = (c) => {
  clearTimeout(blurTimer);
  selectedName.value = c.name;
  text.value = c.name;
  results.value = [];
  noResults.value = false;
  open.value = false;
  emit("update:modelValue", c.id);
  emit("picked", c);
};

const pickActive = () => {
  const c = results.value[activeIndex.value];
  if (c) pick(c);
};

const move = (dir) => {
  if (!results.value.length) return;
  activeIndex.value =
    (activeIndex.value + dir + results.value.length) % results.value.length;
};

const clear = () => {
  clearTimeout(blurTimer);
  text.value = "";
  selectedName.value = "";
  results.value = [];
  noResults.value = false;
  open.value = false;
  emit("update:modelValue", null);
  emit("picked", null);
};

const onFocus = () => {
  if (text.value.trim() && results.value.length) open.value = true;
};

const onBlur = () => {
  // Delay so a mousedown on an option registers before the menu closes.
  blurTimer = setTimeout(() => {
    open.value = false;
    // Snap the label back to the committed selection if the user typed but
    // didn't pick a new match.
    if (props.modelValue) text.value = selectedName.value;
  }, 150);
};

// Seed the label from initialName (Orders edit) and keep it in sync when the
// parent clears the model externally (e.g. after placing an order in POS).
watch(
  () => props.modelValue,
  (id) => {
    if (id === null || id === undefined || id === "") {
      text.value = "";
      selectedName.value = "";
    } else if (!selectedName.value && props.initialName) {
      selectedName.value = props.initialName;
      text.value = props.initialName;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.cpick {
  position: relative;
}

.cpick__control {
  position: relative;
}

.cpick__input {
  width: 100%;
  padding-right: 34px;
}

.cpick__spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  width: 15px;
  height: 15px;
  margin-top: -7.5px;
  border: 2px solid var(--border-strong, #cbd5e1);
  border-top-color: var(--brand, #4f46e5);
  border-radius: 50%;
  animation: cpick-spin 0.7s linear infinite;
}

@keyframes cpick-spin {
  to { transform: rotate(360deg); }
}

.cpick__clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: var(--surface-2, #f1f5f9);
  color: var(--text-soft, #64748b);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.cpick__clear:hover {
  background: var(--border, #e2e8f0);
  color: var(--text, #334155);
}

.cpick__menu {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
  background: var(--surface, #fff);
  border: 1px solid var(--border-strong, #cbd5e1);
  border-radius: var(--radius-sm, 8px);
  box-shadow: var(--shadow-lg, 0 10px 30px rgba(0, 0, 0, 0.12));
}

.cpick__state {
  padding: 10px 12px;
  color: var(--text-soft, #64748b);
  font-size: 0.85rem;
}

.cpick__option {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.cpick__option--active {
  background: var(--surface-2, #f1f5f9);
}

.cpick__name {
  font-size: 0.9rem;
  color: var(--text, #1e293b);
}

.cpick__contact {
  font-size: 0.78rem;
  color: var(--text-soft, #64748b);
  white-space: nowrap;
}
</style>
