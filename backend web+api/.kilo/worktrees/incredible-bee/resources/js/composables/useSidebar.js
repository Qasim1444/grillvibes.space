import { reactive } from "vue";

/**
 * Shared UI state for the admin shell.
 * - collapsed: desktop sidebar collapsed to icons-only.
 * - mobileOpen: sidebar drawer visible on small screens.
 */
const state = reactive({
    collapsed: false,
    mobileOpen: false,
});

export function useSidebar() {
    return {
        state,
        toggleCollapse: () => {
            state.collapsed = !state.collapsed;
        },
        toggleMobile: () => {
            state.mobileOpen = !state.mobileOpen;
        },
        closeMobile: () => {
            state.mobileOpen = false;
        },
    };
}
