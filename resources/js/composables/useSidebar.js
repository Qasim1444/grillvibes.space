import { reactive } from "vue";

/**
 * Shared UI state for the admin shell.
 * - mobileOpen: admin navigation grid is visible.
 */
const state = reactive({
    mobileOpen: false,
});

export function useSidebar() {
    return {
        state,
        toggleMobile: () => {
            state.mobileOpen = !state.mobileOpen;
        },
        closeMobile: () => {
            state.mobileOpen = false;
        },
    };
}
