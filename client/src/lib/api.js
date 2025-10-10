import axios from "axios";
import toast from "react-hot-toast";
import { tokenManager } from "./cookieAuth";

// Flag to track if we're in initialization mode
let isInitializing = false;

// Function to set initialization mode
export const setInitializationMode = (mode) => {
  isInitializing = mode;
};

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = tokenManager.getToken();

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "Terjadi kesalahan pada server";

    // Don't show errors or redirect during initialization
    if (isInitializing) {
      return Promise.reject(error);
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear all auth data
      tokenManager.clearAll();

      // Only show toast and redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        // Use setTimeout to prevent blocking the current request
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } else if (error.response?.status === 403) {
      toast.error("Anda tidak memiliki izin untuk mengakses resource ini.");
    } else if (error.response?.status >= 500) {
      toast.error("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
