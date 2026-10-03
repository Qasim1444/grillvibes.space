import { computed } from "vue";
import { usePage } from "@inertiajs/vue3";

/**
 * Reads the permission keys shared by HandleInertiaRequests (auth.permissions).
 * `can()` gates sidebar entries and action buttons; the matching route
 * middleware is what actually enforces access — this only hides the controls.
 */
export function usePermissions() {
  const page = usePage();

  const asList = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return [];
  };

  const permissions = computed(() => asList(page.props.auth?.permissions));
  const roles = computed(() => asList(page.props.auth?.roles));
  const isSuperAdmin = computed(() => roles.value.includes("super-admin"));

  const can = (key) => {
    if (!key) return true;
    if (isSuperAdmin.value) return true;
    return permissions.value.includes(key);
  };

  const canAny = (...keys) => keys.flat().some((key) => can(key));

  return { permissions, roles, isSuperAdmin, can, canAny };
}
