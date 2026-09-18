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
		"./pages/Blog.vue": () => import("./assets/Blog-CEmLU6bd.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-COwXtklJ.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-GpD59ogp.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-PUfKOvUx.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-C7N2qKcj.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-BTtWWsOx.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-EeyZtdgM.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-D_OQRuIq.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-tIXzRbJJ.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-CHNSIBmb.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-CFlPsIZz.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-BhcFAUJy.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-CrroHw4Q.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-BneUCqLY.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/Kiosk.vue": () => import("./assets/Kiosk-ChLi300B.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-BBMp07EI.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-CwzedAk3.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-JsxnS6IP.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-CcAE8CAu.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-CsaKZPwF.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-DiViGSva.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-DAJA22kt.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-CnLmxwyR.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-DriPj00-.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-KNpsl5aL.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-BLpHMzLB.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-lDaJAA4B.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-DCGa9cJn.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-Bg_sF3eR.js"),
		"./pages/Login.vue": () => import("./assets/Login-B2Mlv5u0.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-DT4_LR9f.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-CTadzJAa.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-Cm0QMu22.js"),
		"./pages/POS.vue": () => import("./assets/POS-B1FytHaW.js"),
		"./pages/Places.vue": () => import("./assets/Places-Bbf0Bma_.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-C24LhSgR.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-BgiYXyFp.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-D4dWMlyK.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-IT1nCOE5.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-BTrYfO70.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-C6UBpx3n.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-O5OOeWuk.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-DXxwb8Ym.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-Bk8hrClC.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-D_gmbhG3.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-D2mBpY8r.js"),
		"./pages/Users.vue": () => import("./assets/Users-BCppk8IG.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
