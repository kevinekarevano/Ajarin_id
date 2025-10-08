import axios from "axios";
import toast from "react-hot-toast";

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
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      window.location.href = "/login";
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
