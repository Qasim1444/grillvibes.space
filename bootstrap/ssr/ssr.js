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
		"./pages/AboutPage.vue": () => import("./assets/AboutPage-DriDEC7v.js"),
		"./pages/AdminDashboardPage.vue": () => import("./assets/AdminDashboardPage-CMsHRW5G.js"),
		"./pages/AdminLoginPage.vue": () => import("./assets/AdminLoginPage-Dt-jnN_3.js"),
		"./pages/Blog.vue": () => import("./assets/Blog-B18SKr07.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-CRr3URYJ.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-DpM5tURJ.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-cKgBWpfB.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-BVZV-hU1.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-D3Lmqm8Y.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-EeyZtdgM.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-Chl0URI0.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-Bp5RyuBi.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-BkJ6poNi.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-yzm35i5Y.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-hvVVnZ-6.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-Cb87x0ja.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-Dv-gYrnA.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/Kiosk.vue": () => import("./assets/Kiosk-DOSUvgZs.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-BBMp07EI.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-vU4v7o2-.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-Cae51LhT.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-DnOplM-N.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-DLNwwTYG.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-C4-3CvpJ.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-Gp76SXo5.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-COYYSsh-.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-CuPZexUI.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-Bf4K2qoU.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-FRPJ1fNM.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-DSpVwOTH.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-CaAzkdkn.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-pIEaCbL8.js"),
		"./pages/Login.vue": () => import("./assets/Login-B2Mlv5u0.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-9-kgz1c1.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-t0Esvg16.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-BV5QLxA0.js"),
		"./pages/POS.vue": () => import("./assets/POS-BZ8sGT5c.js"),
		"./pages/Places.vue": () => import("./assets/Places-uqB72c0L.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-DaI14m4W.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-CGbizoPT.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-Dscg-YUf.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-DGgR8AfK.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-BOeN7jLZ.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-OZGX2zsO.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-BBsY8rOn.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-CBW2fqE9.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-CXkPveqR.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-DIuJdX9V.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-DMOJfGRn.js"),
		"./pages/Users.vue": () => import("./assets/Users-B8ppK3Iu.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
