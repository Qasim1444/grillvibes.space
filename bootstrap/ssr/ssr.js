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
		"./pages/Blog.vue": () => import("./assets/Blog-CanQM6GP.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-1SsE8LPn.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-N5mP27iU.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-pjvO5Pp7.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-DqecGvuQ.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-Db2BoctG.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-DS98bquO.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-BJVLWf0u.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-BWsVo4mA.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-B_S7-X7l.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-DXCCzafo.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-Dvz6ORSH.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-uRIomknb.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-Dez6d_VN.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-BFrDgBPV.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-hqxbGP6_.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-BMwS3-Cx.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-BJbdYFZ5.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-C-QFFsFg.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-TQn_oP2O.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-CB002A7H.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-BUErEVI3.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-CMOoQKzp.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-B1KIxEca.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-7BrsABX4.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-B-S01TTV.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-CKsQvcBt.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-Uq_8ap0q.js"),
		"./pages/Login.vue": () => import("./assets/Login-DDPswKt0.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-CDa8GPSV.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-D46M-bOx.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-Ol9tNily.js"),
		"./pages/POS.vue": () => import("./assets/POS-C1sLRuAx.js"),
		"./pages/Places.vue": () => import("./assets/Places-Ca_2sD9B.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-CgLhxsQ4.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-B1hFR60Q.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-7WT74v2d.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-jld9U1Wu.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-BnnlpSQ7.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-mKuZVQy0.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DHCqaFI7.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-utcdlLXR.js"),
		"./pages/Register.vue": () => import("./assets/Register-CK-ILYhd.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-1AKJluxD.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-Dj-y-HTf.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-grWpl7DJ.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-BOlK4J-s.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-C_o5LjLz.js"),
		"./pages/Users.vue": () => import("./assets/Users-CeIKHKnj.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
