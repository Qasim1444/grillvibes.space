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
		"./pages/Blog.vue": () => import("./assets/Blog-CK1etbEL.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-DgxPG6Md.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-C5tLVq1o.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-CJSXnhoS.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-CUQ_mS9G.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-BgDfm9cU.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-Z-3Z42Mq.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-IkHNRJQI.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-BEYMKjht.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-CvQyVaP3.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-BQ_gUD-8.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-M5Xsvls1.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-C7IqqAAx.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-hmNDzrU8.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-DLwtyYYp.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-QtQo99Q9.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch--H-mPahb.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-OIzsJepZ.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-C7Ldq_FV.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-C2ihlHYn.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-CP4rRhYR.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-BbKHlPYu.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-BehfgpDc.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-CvW5dcl_.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-mT2Nqoln.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-C-MzSCoG.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-DUqO6WlE.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-wgjEZNtW.js"),
		"./pages/Login.vue": () => import("./assets/Login-DXAy29hC.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-BTZNR6qA.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-_rzKDwp9.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-D8nqO-aj.js"),
		"./pages/POS.vue": () => import("./assets/POS-BUQwE1q5.js"),
		"./pages/Places.vue": () => import("./assets/Places-7EvYmA5B.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-C0TzWj9G.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-BS7fDSea.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-BPOhrOMS.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CL491UOH.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-DSYNpOWw.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-BlGh04AZ.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-BxWdjcW1.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-BT-46a5d.js"),
		"./pages/Register.vue": () => import("./assets/Register-Dbolgf4Q.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-BkjjxbJl.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-B1lZ2zyS.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-cKONu8Sm.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-CcRGqhgT.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-B2gfyZ40.js"),
		"./pages/Users.vue": () => import("./assets/Users-B1FuwxRt.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
