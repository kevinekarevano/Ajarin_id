import { create } from "zustand";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { setInitializationMode } from "@/lib/api";
import { tokenManager } from "@/lib/cookieAuth";

const useAuthStore = create(
  (set, get) => ({
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

        // Only set in Zustand store, persist will handle localStorage automatically
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success(`Selamat datang, ${user.fullname}!`);
        return { success: true, user };
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Login gagal";
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });

        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },

    // Register action
    register: async (userData) => {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.register(userData);
        const { user, token } = response.data;

        // Only set in Zustand store, persist will handle localStorage automatically
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success(`Akun berhasil dibuat! Selamat datang, ${user.fullname}!`);
        return { success: true, user };
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Registrasi gagal";
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });

        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },

    // Logout action
    logout: async () => {
      set({ isLoading: true });

      try {
        await authService.logout();
      } catch (error) {
        // Even if API call fails, we still want to logout locally
        console.error("Logout API call failed:", error);
      } finally {
        // Clear auth state, persist will handle localStorage automatically
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        toast.success("Berhasil logout");
      }
    },

    // Get current user
    getCurrentUser: async () => {
      const currentState = get();
      if (!currentState.token) {
        return;
      }

      set({ isLoading: true });

      try {
        const response = await authService.getCurrentUser();
        const { user } = response.data;

        set({
          user,
          token: currentState.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Token might be invalid, clear it
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    // Update user profile
    updateProfile: async (profileData) => {
      set({ isLoading: true, error: null });

      try {
        // This would be implemented when we have update profile API
        // const response = await userService.updateProfile(profileData);
        // const { user } = response.data;

        // For now, just update local state
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...profileData };

        set({
          user: updatedUser,
          isLoading: false,
          error: null,
        });

        toast.success("Profil berhasil diperbarui");
        return { success: true, user: updatedUser };
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Gagal memperbarui profil";
        set({
          isLoading: false,
          error: errorMessage,
        });

        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },

    // Initialize auth (check if user is logged in)
    initializeAuth: async () => {
      console.log("AuthStore: Starting initialization...");

      // Wait a bit for persist to hydrate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get current state from Zustand persist (this will restore from localStorage automatically)
      const currentState = get();

      // Also check localStorage directly to compare
      const persistedAuth = localStorage.getItem("auth-storage");
      let persistedState = null;
      if (persistedAuth) {
        try {
          persistedState = JSON.parse(persistedAuth);
          console.log("AuthStore: Persisted data:", persistedState);
        } catch (error) {
          console.error("AuthStore: Error parsing persisted data:", error);
        }
      }

      console.log("AuthStore: Current state:", {
        hasUser: !!currentState.user,
        hasToken: !!currentState.token,
        isAuthenticated: currentState.isAuthenticated,
        token: currentState.token ? currentState.token.substring(0, 20) + "..." : null,
        persistedToken: persistedState?.state?.token ? persistedState.state.token.substring(0, 20) + "..." : null,
      });

      // If persist has data but current state doesn't, manually restore
      if (persistedState?.state?.token && persistedState?.state?.user && !currentState.token) {
        console.log("AuthStore: Manually restoring from persist data");
        set({
          user: persistedState.state.user,
          token: persistedState.state.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      }

      if (currentState.token && currentState.user && currentState.isAuthenticated) {
        console.log("AuthStore: Already initialized from persist storage");
        return;
      }

      // If no valid state, ensure we're not authenticated
      console.log("AuthStore: No valid auth data found, clearing state");
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      });
    },
  }),
  {
    name: "auth-storage",
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    }),
  }
);

export default useAuthStore;
