import http from "./http";

/**
 * Build a small CRUD client for a REST resource.
 *
 * Usage:
 *   const users = resource("users");
 *   await users.list();
 *   await users.create(payload);
 */
export function resource(path) {
    return {
        list: (params) => http.get(`/${path}`, { params }).then((r) => r.data),
        get: (id) => http.get(`/${path}/${id}`).then((r) => r.data),
        create: (payload, config) =>
            http.post(`/${path}`, payload, config).then((r) => r.data),
        update: (id, payload, config) =>
            http.put(`/${path}/${id}`, payload, config).then((r) => r.data),
        remove: (id) => http.delete(`/${path}/${id}`).then((r) => r.data),
    };
}

// Resource clients — paths match routes/api.php exactly.
export const usersApi = resource("users");
export const customersApi = resource("customers");
export const foodCategoriesApi = resource("food-categories");
export const foodItemsApi = resource("food-items");
export const placesApi = resource("places");
export const ordersApi = resource("orders");

// Report endpoints — all accept optional { start_date, end_date } params.
export const reportsApi = {
    dailySummary: (params) =>
        http.get("/daily-summary/report", { params }).then((r) => r.data),
    dailySummaryOnWay: (params) =>
        http.get("/daily-summary/reportonway", { params }).then((r) => r.data),
    dailySummaryDining: (params) =>
        http.get("/daily-summary/reportdining", { params }).then((r) => r.data),
    dailySummaryDelivery: (params) =>
        http.get("/daily-summary/reportdelivery", { params }).then((r) => r.data),
    categorySales: (params) =>
        http.get("/daily-category-sales/report", { params }).then((r) => r.data),
    categorySalesByItemQty: (params) =>
        http
            .get("/daily-category-sales-by-item-quantity/report", { params })
            .then((r) => r.data),
    categorySalesByItemQtyCurrentDate: (params) =>
        http
            .get("/daily-category-sales-by-item-quantity/reportcurrentdate", { params })
            .then((r) => r.data),
    quick: () => http.get("/daily-summary/quick-report").then((r) => r.data),
    topTen: () => http.get("/daily-summary/top-ten-deals-report").then((r) => r.data),
    // Read-only: lists orders soft-deleted today.
    deleted: () => http.get("/deletereport").then((r) => r.data),
};

// WhatsApp chat endpoints (proxied through the Laravel backend).
export const whatsappApi = {
    status: () => http.get("/whatsapp/status").then((r) => r.data),
    conversations: (params) =>
        http.get("/whatsapp/conversations", { params }).then((r) => r.data),
    messages: (number, params) =>
        http
            .get(`/whatsapp/messages/${encodeURIComponent(number)}`, { params })
            .then((r) => r.data),
    sendMessage: (payload) =>
        http.post("/whatsapp/send-message", payload).then((r) => r.data),
    sendImage: (formData) =>
        http
            .post("/whatsapp/send-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data),
    sendMedia: (formData) =>
        http
            .post("/whatsapp/send-media", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data),
    calls: (params) => http.get("/whatsapp/calls", { params }).then((r) => r.data),
    rejectCall: (callId, payload) =>
        http
            .post(`/whatsapp/calls/${encodeURIComponent(callId)}/reject`, payload)
            .then((r) => r.data),
};

// Auth / account endpoints.
export const auth = {
    login: (payload) => http.post("/login", payload).then((r) => r.data),
    register: (payload) => http.post("/register", payload).then((r) => r.data),
    logout: () => http.post("/logout").then((r) => r.data),
    loggedUser: () => http.get("/logged-user").then((r) => r.data),
    updateProfile: (payload) =>
        http.post("/update-profile", payload).then((r) => r.data),
    changePassword: (payload) =>
        http.post("/change-password", payload).then((r) => r.data),
    forgotPassword: (payload) =>
        http.post("/forgot-password", payload).then((r) => r.data),
    resetPassword: (payload) =>
        http.post("/reset-password", payload).then((r) => r.data),
};

// Settings endpoints (non-standard shape: update/delete via POST/DELETE without id).
export const settingsApi = {
    list: () => http.get("/settings").then((r) => r.data),
    create: (payload, config) =>
        http.post("/settings", payload, config).then((r) => r.data),
    update: (payload, config) =>
        http.post("/settings/update", payload, config).then((r) => r.data),
    remove: () => http.delete("/settings/delete").then((r) => r.data),
};

export default http;
