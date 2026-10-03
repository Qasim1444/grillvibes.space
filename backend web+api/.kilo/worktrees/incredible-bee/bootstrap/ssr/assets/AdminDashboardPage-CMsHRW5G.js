import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { useRouter } from "vue-router";
//#region resources/js/pages/AdminDashboardPage.vue
var _sfc_main = {
	__name: "AdminDashboardPage",
	__ssrInlineRender: true,
	setup(__props) {
		useRouter();
		const userRole = computed(() => localStorage.getItem("grillvibes_admin_role") === "SUB_ADMIN" ? "Sub-Admin" : "Super Admin");
		const userName = computed(() => userRole.value === "Sub-Admin" ? "Samir Gomez" : "Ariana Chen");
		const userInitials = computed(() => userName.value.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase());
		const kpis = [
			{
				label: "Orders today",
				value: "1,284",
				trend: 12
			},
			{
				label: "Avg. ticket",
				value: "$42.80",
				trend: 8
			},
			{
				label: "Inventory alerts",
				value: "17",
				trend: -4
			},
			{
				label: "Open tasks",
				value: "24",
				trend: 3
			}
		];
		const chartBars = [
			{
				label: "Jan",
				value: 44
			},
			{
				label: "Feb",
				value: 60
			},
			{
				label: "Mar",
				value: 52
			},
			{
				label: "Apr",
				value: 80
			},
			{
				label: "May",
				value: 72
			},
			{
				label: "Jun",
				value: 92
			},
			{
				label: "Jul",
				value: 76
			},
			{
				label: "Aug",
				value: 84
			}
		];
		const activities = [
			{
				title: "Inventory restock approved",
				time: "2 mins ago",
				color: "#4f46e5"
			},
			{
				title: "Kitchen prep delay alert",
				time: "12 mins ago",
				color: "#f59e0b"
			},
			{
				title: "Branch 2 sales crossed target",
				time: "34 mins ago",
				color: "#22c55e"
			},
			{
				title: "User role update completed",
				time: "1 hr ago",
				color: "#3b82f6"
			}
		];
		const recentRows = [
			{
				source: "North Tower",
				type: "Order",
				branch: "Downtown",
				status: "Completed",
				amount: "$1,280"
			},
			{
				source: "Procurement",
				type: "Purchase",
				branch: "Harbor",
				status: "Pending",
				amount: "$840"
			},
			{
				source: "Inventory",
				type: "Adjustment",
				branch: "Flagship",
				status: "Review",
				amount: "$155"
			},
			{
				source: "KDS",
				type: "Kitchen",
				branch: "Riverside",
				status: "Running",
				amount: "$620"
			}
		];
		const statusClass = (status) => {
			return {
				Completed: "status--completed",
				Pending: "status--pending",
				Review: "status--review",
				Running: "status--running"
			}[status] || "status--pending";
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-shell" }, _attrs))} data-v-7b119154><aside class="sidebar" data-v-7b119154><div class="sidebar__brand" data-v-7b119154><div class="sidebar__logo" data-v-7b119154>J</div><div data-v-7b119154><strong data-v-7b119154>GrillVibes</strong><span data-v-7b119154>Operations</span></div></div><nav class="sidebar__nav" aria-label="Admin sidebar" data-v-7b119154><button type="button" class="nav-item nav-item--active" data-v-7b119154>Dashboard</button><button type="button" class="nav-item" data-v-7b119154>Orders</button><button type="button" class="nav-item" data-v-7b119154>Kitchen Display</button><button type="button" class="nav-item" data-v-7b119154>Menu &amp; Recipes</button><button type="button" class="nav-item" data-v-7b119154>Inventory / Stock</button><button type="button" class="nav-item" data-v-7b119154>Procurement</button><button type="button" class="nav-item" data-v-7b119154>Branches</button><button type="button" class="nav-item" data-v-7b119154>Reports</button><button type="button" class="nav-item" data-v-7b119154>Users &amp; Roles</button><button type="button" class="nav-item" data-v-7b119154>Settings</button></nav></aside><div class="main-panel" data-v-7b119154><header class="topbar" data-v-7b119154><div data-v-7b119154><p class="topbar__eyebrow" data-v-7b119154>Overview</p><h1 data-v-7b119154>Dashboard</h1></div><div class="topbar__actions" data-v-7b119154><button class="topbar__icon" type="button" aria-label="Notifications" data-v-7b119154>🔔</button><div class="topbar__user" data-v-7b119154><div class="topbar__avatar" data-v-7b119154>${ssrInterpolate(userInitials.value)}</div><div data-v-7b119154><strong data-v-7b119154>${ssrInterpolate(userName.value)}</strong><span data-v-7b119154>${ssrInterpolate(userRole.value)}</span></div></div><button class="topbar__logout" type="button" data-v-7b119154>Logout</button></div></header><main class="content" data-v-7b119154><div class="page-header" data-v-7b119154><div data-v-7b119154><h2 data-v-7b119154>Dashboard Overview</h2><p data-v-7b119154>Track your business and branch performance in real time.</p></div><button class="primary-button" type="button" data-v-7b119154>Export report</button></div><div class="kpi-grid" data-v-7b119154><!--[-->`);
			ssrRenderList(kpis, (item) => {
				_push(`<div class="kpi-card" data-v-7b119154><span data-v-7b119154>${ssrInterpolate(item.label)}</span><strong data-v-7b119154>${ssrInterpolate(item.value)}</strong><small class="${ssrRenderClass(item.trend >= 0 ? "positive" : "negative")}" data-v-7b119154>${ssrInterpolate(item.trend >= 0 ? "+" : "")}${ssrInterpolate(item.trend)}% </small></div>`);
			});
			_push(`<!--]--></div><div class="dashboard-grid" data-v-7b119154><div class="panel" data-v-7b119154><div class="panel__header" data-v-7b119154><h3 data-v-7b119154>Revenue trend</h3><span data-v-7b119154>Last 30 days</span></div><div class="chart-bars" aria-label="Revenue chart" data-v-7b119154><!--[-->`);
			ssrRenderList(chartBars, (bar) => {
				_push(`<div class="chart-bar" style="${ssrRenderStyle({ height: bar.value + "%" })}" data-v-7b119154><span data-v-7b119154>${ssrInterpolate(bar.label)}</span></div>`);
			});
			_push(`<!--]--></div></div><div class="panel" data-v-7b119154><div class="panel__header" data-v-7b119154><h3 data-v-7b119154>Activity</h3><span data-v-7b119154>Live feed</span></div><ul class="activity-list" data-v-7b119154><!--[-->`);
			ssrRenderList(activities, (activity) => {
				_push(`<li data-v-7b119154><span class="activity-dot" style="${ssrRenderStyle({ background: activity.color })}" data-v-7b119154></span><div data-v-7b119154><strong data-v-7b119154>${ssrInterpolate(activity.title)}</strong><small data-v-7b119154>${ssrInterpolate(activity.time)}</small></div></li>`);
			});
			_push(`<!--]--></ul></div></div><div class="panel table-panel" data-v-7b119154><div class="panel__header" data-v-7b119154><h3 data-v-7b119154>Recent activity</h3><button class="ghost-button" type="button" data-v-7b119154>View all</button></div><table data-v-7b119154><thead data-v-7b119154><tr data-v-7b119154><th data-v-7b119154>Source</th><th data-v-7b119154>Type</th><th data-v-7b119154>Branch</th><th data-v-7b119154>Status</th><th data-v-7b119154>Amount</th></tr></thead><tbody data-v-7b119154><!--[-->`);
			ssrRenderList(recentRows, (row) => {
				_push(`<tr data-v-7b119154><td data-v-7b119154>${ssrInterpolate(row.source)}</td><td data-v-7b119154>${ssrInterpolate(row.type)}</td><td data-v-7b119154>${ssrInterpolate(row.branch)}</td><td data-v-7b119154><span class="${ssrRenderClass([statusClass(row.status), "status"])}" data-v-7b119154>${ssrInterpolate(row.status)}</span></td><td data-v-7b119154>${ssrInterpolate(row.amount)}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></main></div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/AdminDashboardPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AdminDashboardPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7b119154"]]);
//#endregion
export { AdminDashboardPage_default as default };
