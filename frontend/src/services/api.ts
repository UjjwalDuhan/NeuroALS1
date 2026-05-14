import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getStoredToken, clearAuthStorage } from "@/utils/storage";
import { ApiResponse } from "@/types";

// ── Create Axios Instance ─────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: Attach JWT token ─────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // If 401 → token expired or invalid → force logout
    if (error.response?.status === 401) {
      const msg = error.response.data?.message || "";
      // Don't auto-logout on wrong password (that's also 401)
      if (msg.includes("expired") || msg.includes("Invalid token")) {
        clearAuthStorage();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
