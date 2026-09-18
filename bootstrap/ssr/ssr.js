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
		"./pages/Blog.vue": () => import("./assets/Blog-Bsmi3Ss4.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-BJCgOa97.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-BytkrfnH.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-DoM8A4GA.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-XXisp9hc.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-BTtWWsOx.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-B0wpNQ4B.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-DHAUjPjK.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-tIXzRbJJ.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-D44LE1Ge.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-ocYvLalY.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-TRBeNBJE.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-Byt2dg5u.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-YGPssXzB.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/Kiosk.vue": () => import("./assets/Kiosk-ChLi300B.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-BBMp07EI.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-B0i0ksCY.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-JsxnS6IP.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-BZLcFn5G.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-BqTpqu0z.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-DsHSrmZH.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-DdgUEWqq.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-CfSbfHCW.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-JS77FH8l.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-KNpsl5aL.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-BGZQJWV_.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-CkxApcMF.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-BdOsomnW.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-VE9IdC9Y.js"),
		"./pages/Login.vue": () => import("./assets/Login-p7KWldUU.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-Dc6NZ6gH.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-CwV44nUa.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-DqaSJAJp.js"),
		"./pages/POS.vue": () => import("./assets/POS-B1FytHaW.js"),
		"./pages/Places.vue": () => import("./assets/Places-DuwfR4Fd.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-Bxr9pIbc.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-BMqN4Fxb.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-CLttX0dW.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-IT1nCOE5.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-BTrYfO70.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-DTQQagaS.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-O5OOeWuk.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-dt-CbOY8.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-vEP2W6QT.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-C7sv4QIm.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-5WEVuGMj.js"),
		"./pages/Users.vue": () => import("./assets/Users-DlcmiJia.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
