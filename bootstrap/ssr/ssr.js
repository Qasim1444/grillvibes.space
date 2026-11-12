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
		"./pages/AboutPage.vue": () => import("./assets/AboutPage-DEUHZyse.js"),
		"./pages/AdminDashboardPage.vue": () => import("./assets/AdminDashboardPage-CMsHRW5G.js"),
		"./pages/AdminLoginPage.vue": () => import("./assets/AdminLoginPage-Dt-jnN_3.js"),
		"./pages/Blog.vue": () => import("./assets/Blog-D0uHGEBP.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-tVb6-buV.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-Okj-Y3K_.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-Dvj7YXZb.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-CjuQixDR.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-BoPAfZ1X.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-D7C1PaSI.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-B2SPjexW.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-BWsVo4mA.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-BrTdvO8o.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-CPCFxvhF.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-Btmfqdzd.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-HSYMinbl.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-CjBFr3sr.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-DLwtyYYp.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-hqxbGP6_.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-BMwS3-Cx.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-CF6MByfP.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-CPjqNb8h.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-3OHrwtsq.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-BDmnL1o9.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-CscH6_lI.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-CW_NhDjP.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-u6qnyrhS.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-CPo0O-9F.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-B-S01TTV.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-SZgq1Boa.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-BX711Y-S.js"),
		"./pages/Login.vue": () => import("./assets/Login-DXAy29hC.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-Bawzv7fi.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-BbaGOlt_.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-BODhncpc.js"),
		"./pages/POS.vue": () => import("./assets/POS-D4QbT_rf.js"),
		"./pages/Places.vue": () => import("./assets/Places-0xDJyyG4.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-Bh9yeaFL.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-BSTGOnGn.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-DESD4rR0.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-jld9U1Wu.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-Bk-T7r8n.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-mKuZVQy0.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DHCqaFI7.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-BHpWe1Vh.js"),
		"./pages/Register.vue": () => import("./assets/Register-Dbolgf4Q.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-1AKJluxD.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-CMoo4dIb.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-B0knFvVG.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-DbNqLmb_.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-DLX0V2KQ.js"),
		"./pages/Users.vue": () => import("./assets/Users-47NDedXt.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
