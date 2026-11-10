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
		"./pages/Blog.vue": () => import("./assets/Blog-aB1xOrXR.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-BfOdel4-.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-jDNLovDW.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-Bupt-qBg.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-D4BJ2pGs.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-BKtl9pw0.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-CMo8UX4i.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-Lvo7YKJB.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-CRyULKHT.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-DurFi5fS.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-rHBe4Fhi.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-f23s04MC.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-CSFeIdm0.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-CeJhW15T.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-Ccw3WgzB.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-D7v-NjEA.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-8Hh6a9AD.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-DocO4PSU.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-RNWE5MKF.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-GUOZutwG.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-CvwOjz01.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-5vzDMZN_.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-CQSCyQHR.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-w1XWuML4.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-CYCZFHXq.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-D-DGCNXc.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-C9C3oQL1.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-yTm9gLVN.js"),
		"./pages/Login.vue": () => import("./assets/Login-DXAy29hC.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-C6qyytwU.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-BEokx1TE.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-7KQZDs31.js"),
		"./pages/POS.vue": () => import("./assets/POS-C-baH2tq.js"),
		"./pages/Places.vue": () => import("./assets/Places-QS3aIvM7.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-B8VLHQpD.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-IfKDAYwN.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-Be64meUA.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CL491UOH.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-BLyEKIeT.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-BlGh04AZ.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-BxWdjcW1.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-DA03YmYn.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-CWJ0oktI.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-U-cj5Ew2.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-DbFhVwln.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-CwXZAb8J.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-CWvPAo22.js"),
		"./pages/Users.vue": () => import("./assets/Users-eaCdwh23.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
