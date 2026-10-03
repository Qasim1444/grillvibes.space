<template>
  <div class="ui-card">
    <div v-if="searchable" class="data-table__toolbar">
      <div class="data-table__search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="queryValue"
          class="data-table__search-input"
          type="text"
          :placeholder="searchPlaceholder"
        />
      </div>
    </div>

    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="index" style="width: 56px">#</th>
            <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : null">
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRows.length === 0">
            <td class="data-table__empty" :colspan="totalColumns">{{ emptyText }}</td>
          </tr>
          <tr v-for="(row, i) in filteredRows" :key="row.id ?? i">
            <td v-if="index">{{ i + 1 }}</td>
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell:${col.key}`" :row="row" :value="row[col.key]">
                {{ formatCell(row, col) }}
              </slot>
            </td>
            <td v-if="$slots.actions">
              <div class="data-table__actions">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, width?, format? }]
  rows: { type: Array, default: () => [] },
  index: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: "Search…" },
  emptyText: { type: String, default: "No records found." },
  // When a `query` model is bound, the parent owns the search term (server-side
  // filtering) and the table renders `rows` as-is. Left unbound, the table keeps
  // its original client-side filtering behaviour.
  query: { type: String, default: null },
});

const emit = defineEmits(["update:query"]);

// Internal term for client-side mode; proxied to the parent in server mode.
const internalQuery = ref("");
const serverMode = computed(() => props.query !== null);
const queryValue = computed({
  get: () => (serverMode.value ? props.query : internalQuery.value),
  set: (v) => {
    if (serverMode.value) emit("update:query", v);
    else internalQuery.value = v;
  },
});

const totalColumns = computed(
  () => props.columns.length + (props.index ? 1 : 0) + 1
);

const filteredRows = computed(() => {
  // In server mode the parent has already filtered; render rows verbatim.
  if (serverMode.value || !props.searchable || !internalQuery.value.trim())
    return props.rows;
  const q = internalQuery.value.toLowerCase();
  return props.rows.filter((row) =>
    props.columns.some((col) =>
      String(row[col.key] ?? "").toLowerCase().includes(q)
    )
  );
});

function formatCell(row, col) {
  const value = row[col.key];
  return col.format ? col.format(value, row) : value;
}
</script>

<style scoped>
.data-table__toolbar {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.data-table__search {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 320px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-soft);
}

.data-table__search:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.data-table__search-input {
  border: none;
  outline: none;
  width: 100%;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text);
  background: transparent;
}

.data-table__search-input { min-width: 0; }
@media (max-width: 640px) { .data-table__search-input { font-size: 16px; } .data-table__search { max-width: none; min-height: 44px; } }

</style>
