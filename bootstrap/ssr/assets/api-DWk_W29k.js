import axios from "axios";
//#region resources/js/services/http.js
var http = axios.create({
	baseURL: "http://127.0.0.1:8000/api",
	headers: {
		Accept: "application/json",
		"X-Requested-With": "XMLHttpRequest"
	}
});
http.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
http.interceptors.response.use((response) => response, (error) => {
	if (error.response?.status === 401) {
		localStorage.removeItem("token");
		if (window.location.pathname !== "/login") window.location.href = "/login";
	}
	return Promise.reject(error);
});
//#endregion
export {};
