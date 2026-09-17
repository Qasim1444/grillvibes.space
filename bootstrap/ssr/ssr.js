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
		"./pages/Blog.vue": () => import("./assets/Blog-8vooRjcZ.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-DuIzyzNM.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-Bjcx30xN.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-Bo_ptF0h.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-CdvTVRW2.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-CsnSB6gf.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-EeyZtdgM.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-Dll1Trt9.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-DOCWCdLE.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-DH03ks64.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-DgluuFwr.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-BcDOC_Qs.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-CZGHV5Vo.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-DjS0iIYf.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-CbGU5rZU.js"),
		"./pages/Guest/Kiosk.vue": () => import("./assets/Kiosk-ChLi300B.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-BBMp07EI.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-BpRWb8M7.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-C47KTKod.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-zgnzXye7.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-CUZr0zc3.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-CfW9NGn4.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-BByWZXho.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-COPmTbGU.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-l7hbxDGa.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-DATogDkm.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-B9tH3C1p.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-uBBiQ0sK.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-DNqA0fpR.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-B-za4sjG.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-H49LDdT4.js"),
		"./pages/Login.vue": () => import("./assets/Login-B2Mlv5u0.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-wny0t1Od.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-DuYYN53g.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-CEE7QAur.js"),
		"./pages/POS.vue": () => import("./assets/POS-B1FytHaW.js"),
		"./pages/Places.vue": () => import("./assets/Places-Dir8wWnH.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-VJwqTb-E.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-DRqOJ2CY.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-PEdEHtGS.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-DGgR8AfK.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-Dl3zKAWX.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-B-G0dpdy.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-DFBvQ2lI.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-D1KGGQME.js"),
		"./pages/Register.vue": () => import("./assets/Register-B0uYGzjT.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-CC_n7hQR.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-NYAxoh-T.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-BOAWMgzO.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-CqIMIoFO.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-Cv-YOcRQ.js"),
		"./pages/Users.vue": () => import("./assets/Users-DIeItexx.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
