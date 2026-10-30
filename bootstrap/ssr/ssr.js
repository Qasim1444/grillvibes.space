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
		"./pages/Blog.vue": () => import("./assets/Blog-Ci0geQ4-.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-C5XcKI2J.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-uF-1usbz.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-ClVHDLxf.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-CDjVVFx5.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-D8mraUfi.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-D2uHTFxC.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-B0wpNQ4B.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-C4MXvAi-.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-DYLzeNhI.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-C6g7BgOz.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-RfVZi1Xm.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-BdbJno8j.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-DlE0v2Qz.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-Dc-Nt04n.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-DXAzn2pU.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-DN93Bj-q.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-BKK_eCEm.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-DSmvNhiN.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-ULb2AO25.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-D0e7Fhq9.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-BGbsqAal.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-P68LMqnD.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-DUBg1aCy.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-KNpsl5aL.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-FEVd0rgr.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-hneLyg6f.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-WHHg-H2L.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-DQqIDjtS.js"),
		"./pages/Login.vue": () => import("./assets/Login-oSevyOe2.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-BlyPGY8G.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-DhlTc3je.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-D8YjXBiJ.js"),
		"./pages/POS.vue": () => import("./assets/POS-C1uLrAtB.js"),
		"./pages/Places.vue": () => import("./assets/Places-DLtMHWyN.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-DkKM03Ym.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-DH4qIudC.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-cVAGhe31.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CWVDr3am.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-3JDTtp2w.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-ByGKEUj9.js"),
		"./pages/Register.vue": () => import("./assets/Register-BCrt6H0_.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-CwrzrPiF.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-BS7ODdvJ.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-C9EIr5Z3.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-A3vKhY06.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-BkBIwoM0.js"),
		"./pages/Users.vue": () => import("./assets/Users-Dbdtrmwo.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
