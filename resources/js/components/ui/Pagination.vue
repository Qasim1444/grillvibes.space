<template>
  <nav v-if="paginator && paginator.last_page > 1" class="pager" aria-label="Pagination">
    <span class="pager__info">
      Showing <strong>{{ paginator.from ?? 0 }}</strong>–<strong>{{ paginator.to ?? 0 }}</strong>
      of <strong>{{ paginator.total }}</strong>
    </span>

    <ul class="pager__links">
      <li v-for="(link, i) in paginator.links" :key="i">
        <button
          type="button"
          class="pager__btn"
          :class="{
            'pager__btn--active': link.active,
            'pager__btn--disabled': !link.url,
          }"
          :disabled="!link.url"
          :aria-current="link.active ? 'page' : undefined"
          @click="go(link.url)"
          v-html="link.label"
        ></button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { router } from "@inertiajs/vue3";

/**
 * Renders the link set from a Laravel LengthAwarePaginator (as serialized into
 * Inertia props: { data, links:[{url,label,active}], from, to, total, ... }).
 * Navigating issues a partial Inertia visit so only the paginated prop(s) named
 * in `only` are re-fetched — the rest of the page's props are reused.
 * Labels come from Laravel (« Previous / Next »), so v-html is safe here.
 */
const props = defineProps({
  paginator: { type: Object, default: null },
  only: { type: Array, default: () => [] },
});

const go = (url) => {
  if (!url) return;
  router.get(
    url,
    {},
    {
      preserveState: true,
      preserveScroll: true,
      only: props.only.length ? props.only : undefined,
    }
  );
};
</script>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.pager__info {
  font-size: 0.85rem;
  color: var(--text-soft, #64748b);
}
.pager__info strong {
  color: var(--text, #1e293b);
}

.pager__links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pager__btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border-strong, #cbd5e1);
  border-radius: var(--radius-sm, 8px);
  background: var(--surface, #fff);
  color: var(--text, #334155);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.pager__btn:hover:not(.pager__btn--disabled):not(.pager__btn--active) {
  border-color: var(--brand, #4f46e5);
  color: var(--brand, #4f46e5);
}

.pager__btn--active {
  background: var(--brand, #4f46e5);
  border-color: var(--brand, #4f46e5);
  color: #fff;
  font-weight: 600;
  cursor: default;
}

.pager__btn--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 640px) { .pager__btn { min-width: 44px; height: 44px; } }

</style>
