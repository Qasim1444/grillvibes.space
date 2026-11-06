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
		"./pages/Blog.vue": () => import("./assets/Blog-A1QAoR5R.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-k5GOyS8_.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-5FUaiUEJ.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-VqooW0S9.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-CfOu0yy5.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-iTZQf_h0.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-C5GtjKdd.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-CwqE7-d7.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-BU6MxeiT.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-BRZTd950.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-B92DQ8LH.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-DOMptmFA.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-Zw3jEuB-.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-CgZJlIiA.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-DXAzn2pU.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-D85cjqaI.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-BdUdResA.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-BFiekiL7.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-DwZlpNXf.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-Cht-dtPj.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-xUk2eqDn.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-5JHCz0X_.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-BMM3RuiB.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-BVVLhNpK.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-DAfmNY85.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-DdrzADX-.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-BwTm8F64.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-CiUKMj7i.js"),
		"./pages/Login.vue": () => import("./assets/Login-DTbeR1XI.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-CNkDsFqx.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-BVA45XVk.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-UDdQsIgX.js"),
		"./pages/POS.vue": () => import("./assets/POS-BfVqghHa.js"),
		"./pages/Places.vue": () => import("./assets/Places-SHMxDJQF.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-BuMSvB3d.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-CsfsF5q8.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-CCEAGX4Z.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-Dc8U_yen.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-9jDNYjB8.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-BfEFwqiG.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-n44yo39B.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-BLJHh6iQ.js"),
		"./pages/Register.vue": () => import("./assets/Register-BCrt6H0_.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-DlAshJVn.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-BbbrcT36.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-Bq627Jwk.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-DdqJoB2t.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-N4trPnUX.js"),
		"./pages/Users.vue": () => import("./assets/Users-BlcbpZuo.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
