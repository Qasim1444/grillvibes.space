import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { createInertiaApp } from "@inertiajs/vue3";
import createServer from "@inertiajs/vue3/server";
//#region node_modules/laravel-vite-plugin/inertia-helpers/index.js
async function resolvePageComponent(path, pages) {
	for (const p of Array.isArray(path) ? path : [path]) {
		const page = pages[p];
		if (typeof page === "undefined") continue;
		return typeof page === "function" ? page() : page;
	}
	throw new Error(`Page not found: ${path}`);
}
//#endregion
//#region resources/js/ssr.js
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	title: (title) => title ? `${title} — GrillVibes Admin` : "GrillVibes Admin",
	resolve: (name) => resolvePageComponent(`./pages/${name}.vue`, /* #__PURE__ */ Object.assign({
		"./pages/AboutPage.vue": () => import("./assets/AboutPage-DriDEC7v.js"),
		"./pages/AdminDashboardPage.vue": () => import("./assets/AdminDashboardPage-CMsHRW5G.js"),
		"./pages/AdminLoginPage.vue": () => import("./assets/AdminLoginPage-Dt-jnN_3.js"),
		"./pages/Blog.vue": () => import("./assets/Blog-o601JiZs.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-Cyp1zZXP.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-DXhzSnHk.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-CK7Ki-Bw.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-CZ9Up_Aw.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-B12XPkV2.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-EeyZtdgM.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-Jp0aDd4Y.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-BZwTPEtR.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-C4ur59aV.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-Dwre1hqR.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-BEvEd70s.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-BCpwkT8c.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-Cxuj_GM9.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/Kiosk.vue": () => import("./assets/Kiosk-DOSUvgZs.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-BBMp07EI.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-B2QK2t4X.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-hJqkkyrN.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-CRZZAicW.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-D1YM5Bk-.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-D2gBSDQy.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-B4LY-b6V.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-DP80AK-5.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-y0Vhccp8.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-Bf4K2qoU.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-Dpt9hPek.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-DSrtrmJU.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-BefVWYCb.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-Bj7I2Qxa.js"),
		"./pages/Login.vue": () => import("./assets/Login-B2Mlv5u0.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-p1Kz5-PK.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-BCyeRKSn.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-DoWLHTX2.js"),
		"./pages/POS.vue": () => import("./assets/POS-BZ8sGT5c.js"),
		"./pages/Places.vue": () => import("./assets/Places-BL7U4zHN.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-dUSyK7sr.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-CF6hUNxe.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-DuFj8xIW.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-DGgR8AfK.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-DzFMD8JJ.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-BTx0HwqY.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-DHtDcs75.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-BO7o1aJ0.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-NdNEehuT.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-KwwexODy.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-Jpolvu2f.js"),
		"./pages/Users.vue": () => import("./assets/Users-DwVFLUDN.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
