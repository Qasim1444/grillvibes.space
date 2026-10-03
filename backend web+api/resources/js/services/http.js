import axios from "axios";

// Base URL is configurable via Vite env; falls back to the local API server.
const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const http = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Attach the bearer token (if any) to every outgoing request.
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On an expired / invalid session, clear the token and bounce to login.
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default http;
