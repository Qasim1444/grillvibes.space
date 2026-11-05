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
		"./pages/Blog.vue": () => import("./assets/Blog-BmjYosd1.js"),
		"./pages/Branches.vue": () => import("./assets/Branches-B-Od5_4s.js"),
		"./pages/CRM/Discounts.vue": () => import("./assets/Discounts-Cd_VETsu.js"),
		"./pages/CRM/Feedback.vue": () => import("./assets/Feedback-Bjr0P6QL.js"),
		"./pages/CRM/Loyalty.vue": () => import("./assets/Loyalty-Ci1oFPmo.js"),
		"./pages/CRM/PromoCodes.vue": () => import("./assets/PromoCodes-mxp2uLcU.js"),
		"./pages/ChangePassword.vue": () => import("./assets/ChangePassword-D2uHTFxC.js"),
		"./pages/ContactPage.vue": () => import("./assets/ContactPage-CM1Q_jmf.js"),
		"./pages/Customers.vue": () => import("./assets/Customers-DJrwYL74.js"),
		"./pages/Dashboard.vue": () => import("./assets/Dashboard-DoKxffPm.js"),
		"./pages/FeaturesPage.vue": () => import("./assets/FeaturesPage-wVsTXPgA.js"),
		"./pages/Finance/Expenses.vue": () => import("./assets/Expenses-BGoiWXyt.js"),
		"./pages/Finance/PettyCash.vue": () => import("./assets/PettyCash-BwU9pMJ2.js"),
		"./pages/Finance/Vouchers.vue": () => import("./assets/Vouchers-Cg13TGQo.js"),
		"./pages/FoodCategories.vue": () => import("./assets/FoodCategories-qbJQ-GZ8.js"),
		"./pages/FoodItems.vue": () => import("./assets/FoodItems-BR9fU7xK.js"),
		"./pages/ForgotPassword.vue": () => import("./assets/ForgotPassword-DXAzn2pU.js"),
		"./pages/Guest/QRMenu.vue": () => import("./assets/QRMenu-DIvJKtme.js"),
		"./pages/HR/Attendance.vue": () => import("./assets/Attendance-BpTNFWTE.js"),
		"./pages/HR/AttendancePunch.vue": () => import("./assets/AttendancePunch-BKK_eCEm.js"),
		"./pages/HR/Designations.vue": () => import("./assets/Designations-CRUkKc5a.js"),
		"./pages/HR/Employees.vue": () => import("./assets/Employees-DFMgMM6s.js"),
		"./pages/HR/Leaves.vue": () => import("./assets/Leaves-BH9d8W4n.js"),
		"./pages/HR/Loans.vue": () => import("./assets/Loans-DDsg98Xd.js"),
		"./pages/HR/Overtime.vue": () => import("./assets/Overtime-BA1lwysu.js"),
		"./pages/HR/Payroll.vue": () => import("./assets/Payroll-BMRH1Cbr.js"),
		"./pages/HomePage.vue": () => import("./assets/HomePage-BlHZ_jEZ.js"),
		"./pages/Inventory/Ingredients.vue": () => import("./assets/Ingredients-JnJLtxNi.js"),
		"./pages/Inventory/Recipes.vue": () => import("./assets/Recipes-u9D-iopP.js"),
		"./pages/Inventory/Stock.vue": () => import("./assets/Stock-0zuZNkFL.js"),
		"./pages/KDS/Board.vue": () => import("./assets/Board-CGcqpjz8.js"),
		"./pages/KDS/Stations.vue": () => import("./assets/Stations-D8QAgXIJ.js"),
		"./pages/Login.vue": () => import("./assets/Login-1qzAjLsG.js"),
		"./pages/Maintenance/Assets.vue": () => import("./assets/Assets-Fh77_GSo.js"),
		"./pages/Maintenance/MaintenanceLogs.vue": () => import("./assets/MaintenanceLogs-BhYS1ipX.js"),
		"./pages/Orders.vue": () => import("./assets/Orders-D5MgZcdl.js"),
		"./pages/POS.vue": () => import("./assets/POS-BfVqghHa.js"),
		"./pages/Places.vue": () => import("./assets/Places-DGAYqiql.js"),
		"./pages/PricingPage.vue": () => import("./assets/PricingPage-DN3Gr8cc.js"),
		"./pages/Procurement/GoodsReceipts.vue": () => import("./assets/GoodsReceipts-BqbSn0Pl.js"),
		"./pages/Procurement/PurchaseOrders.vue": () => import("./assets/PurchaseOrders-DCIQeJWJ.js"),
		"./pages/Procurement/Vendors.vue": () => import("./assets/Vendors-BFBf253T.js"),
		"./pages/ProductPage.vue": () => import("./assets/ProductPage-CbuSfbFb.js"),
		"./pages/Profile.vue": () => import("./assets/Profile-3JDTtp2w.js"),
		"./pages/PublicBlog.vue": () => import("./assets/PublicBlog-BwhDgfzb.js"),
		"./pages/PublicBlogPost.vue": () => import("./assets/PublicBlogPost-D_jiPLwD.js"),
		"./pages/QRCodes.vue": () => import("./assets/QRCodes-C_O4-uUd.js"),
		"./pages/Register.vue": () => import("./assets/Register-BCrt6H0_.js"),
		"./pages/Reports/FoodCost.vue": () => import("./assets/FoodCost-CwrzrPiF.js"),
		"./pages/Reservations/FloorPlan.vue": () => import("./assets/FloorPlan-URV_Dc31.js"),
		"./pages/Reservations/Index.vue": () => import("./assets/Index-COk-dBtN.js"),
		"./pages/Roles.vue": () => import("./assets/Roles-C3f3MvPL.js"),
		"./pages/Settings.vue": () => import("./assets/Settings-09SecroP.js"),
		"./pages/Users.vue": () => import("./assets/Users-C-Lu1awW.js")
	})),
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
