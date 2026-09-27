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
		"./pages/Blog.vue": () => import("./assets/Blog-CMN2wskG.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-CoqIi5n3.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-DpJk6NEb.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-ePr5xb1X.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-CEuRPczh.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-B21h6CKn.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-B0wpNQ4B.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-vpenumUh.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-B5D4hT2x.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-DHvbeD-D.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-BfvxYohE.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-CYvM0ti0.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-Bhtnrq7D.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-BBfkWJZp.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-B_IbnhUN.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-NnTkQvW9.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-C56oT2_J.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-CbjgF1yi.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-C1A3gG_d.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-CIi2qi1T.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-CgJWmJQm.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-BYo1tTS1.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-KNpsl5aL.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-BjDrs3lj.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-CQu3za22.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-DGuX5K54.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-B07hpQs8.js"),
		"./pages/Login.vue": () => import("./assets/Login-p7KWldUU.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-BNSImi88.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-DIZir8qL.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-BoOiJVQZ.js"),
		"./pages/POS.vue": () => import("./assets/POS-C1uLrAtB.js"),
		"./pages/Places.vue": () => import("./assets/Places-BGrVs40I.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-ByWsImoq.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-CC49IFTM.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-BzIR6aUS.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CWVDr3am.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-DSZRLBpJ.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-C07F_c2v.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-DLqfaq9v.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-DI-sJBpN.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-v9xSxKoB.js"),
		"./pages/Riders.vue": () => import("./assets/Riders-CGFz9nh_.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-Dz_n_V_f.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-zKdysRu7.js"),
		"./pages/Users.vue": () => import("./assets/Users-Cy-elQFe.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
