import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { setInitializationMode } from "@/lib/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
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

          // Store token and user in localStorage
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_data", JSON.stringify(user));

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

          // Store token and user in localStorage
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_data", JSON.stringify(user));

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
          // Clear local storage
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");

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
        const token = localStorage.getItem("auth_token");
        if (!token) {
          return;
        }

        set({ isLoading: true });

        try {
          const response = await authService.getCurrentUser();
          const { user } = response.data;

          // Store updated user data
          localStorage.setItem("user_data", JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token might be invalid, clear it
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");

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
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user_data");

        if (token) {
          // Try to load user from localStorage first for faster initial load
          if (userData) {
            try {
              const user = JSON.parse(userData);
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });

              // If we have valid user data, we can skip server verification for now
              // The token will be validated on the next API call if needed
              return;
            } catch (parseError) {
              console.error("Failed to parse stored user data:", parseError);
              // Continue to server verification if localStorage data is corrupted
            }
          }

          // Only verify with server if no valid user data in localStorage
          set({ isLoading: true });
          setInitializationMode(true);
          try {
            const result = await get().getCurrentUser();
            // getCurrentUser will update the store if successful
          } catch (error) {
            console.error("Auth verification failed:", error);
            // If server verification fails, clear everything quietly
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            set({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
              error: null,
            });
          } finally {
            // Always reset initialization mode
            setInitializationMode(false);
          }
        } else {
          // No token, ensure we're not loading and clear any stale data
          localStorage.removeItem("user_data");
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
            error: null,
          });
        }
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
  )
);

export default useAuthStore;
