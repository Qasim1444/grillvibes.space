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
		"./pages/Blog.vue": () => import("./assets/Blog-DHriuYfX.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-BBzL83JM.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-xj6bGhme.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-Bh5Ov6Ty.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-CFBvYjTA.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-D55i1QWm.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-B0wpNQ4B.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-DT2SFpPd.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-3llmex1M.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-CE1FpqiU.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-CpsDk_oR.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-5POHV5co.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-DaUQG9W5.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-BnLG0Orj.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-BlBQLr9s.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-zCWWZHBP.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-DPD8eThZ.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-Bf3Zdo1w.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-HVTTiY44.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-eDH926Tr.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-CUXJ7jnX.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-DnBWnO0i.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-KNpsl5aL.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-CGLbEStB.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-CiDfCvvl.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-vL7bySR2.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-CWt359AB.js"),
		"./pages/Login.vue": () => import("./assets/Login-p7KWldUU.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-wAKhP7vy.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-B6LaqaCf.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-CYgsxEjI.js"),
		"./pages/POS.vue": () => import("./assets/POS-B1FytHaW.js"),
		"./pages/Places.vue": () => import("./assets/Places-GhZ6q9bL.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-CNvKokxa.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-CHGyu4nc.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-BdnWR8xg.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CWVDr3am.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-jztqXbPc.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-BXu0jrnB.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-DrmtvZ_5.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-CHi4vxPZ.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-3XJkiu-k.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-Bqwd8aCC.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-BvK8LxAe.js"),
		"./pages/Users.vue": () => import("./assets/Users-Dozj_RSl.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
