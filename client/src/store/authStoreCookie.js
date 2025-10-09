import { create } from "zustand";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { setInitializationMode } from "@/lib/api";
import { tokenManager } from "@/lib/cookieAuth";

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Login action
  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      // Store token in cookie and user data in localStorage
      tokenManager.setToken(token);
      tokenManager.setUserData(user);

      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success(`Selamat datang, ${user.name}!`);
      return { success: true, data: { user, token } };
    } catch (error) {
      const message = error.response?.data?.message || "Login gagal";
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  },

  // Register action
  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;

      // Store token in cookie and user data in localStorage
      tokenManager.setToken(token);
      tokenManager.setUserData(user);

      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success(`Registrasi berhasil! Selamat datang, ${user.name}!`);
      return { success: true, data: { user, token } };
    } catch (error) {
      const message = error.response?.data?.message || "Registrasi gagal";
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      tokenManager.clearAll();

      // Reset state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

      toast.success("Logout berhasil");
    }
  },

  // Initialize auth from stored data
  initializeAuth: async () => {
    console.log("AuthStore: Initializing authentication...");
    setInitializationMode(true);
    set({ isLoading: true, isInitialized: false });

    try {
      // Get token from cookie
      const storedToken = tokenManager.getToken();
      const storedUser = tokenManager.getUserData();

      console.log("AuthStore: Stored data check", {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
        tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : null,
      });

      if (storedToken && storedUser) {
        // Set temporary state
        set({
          token: storedToken,
          user: storedUser,
          isAuthenticated: true,
        });

        try {
          // Validate token with server
          const response = await authService.validateToken();

          if (response.data.success) {
            console.log("AuthStore: Token validation successful");
            set({
              user: response.data.data,
              token: storedToken,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
          } else {
            throw new Error("Token validation failed");
          }
        } catch (error) {
          console.log("AuthStore: Token validation failed, clearing auth");
          // Token is invalid, clear everything
          tokenManager.clearAll();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      } else {
        console.log("AuthStore: No stored authentication found");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("AuthStore: Initialization error:", error);
      // Clear on any error
      tokenManager.clearAll();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: "Authentication initialization failed",
      });
    } finally {
      setInitializationMode(false);
    }
  },

  // Get current token (for API calls)
  getToken: () => {
    const state = get();
    return state.token || tokenManager.getToken();
  },

  // Force refresh user data
  refreshUser: async () => {
    const currentToken = get().getToken();
    if (!currentToken) {
      return false;
    }

    try {
      const response = await authService.validateToken();
      if (response.data.success) {
        const user = response.data.data;
        tokenManager.setUserData(user);
        set({ user });
        return true;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }

    return false;
  },
}));

export default useAuthStore;
