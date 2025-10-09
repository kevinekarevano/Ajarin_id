// Test script untuk validasi authentication
import useAuthStore from "@/store/authStore";
import { tokenManager } from "@/lib/cookieAuth";

// Test authentication flow
const testAuth = () => {
  console.log("=== Testing Cookie-Based Authentication Flow ===");

  const authStore = useAuthStore.getState();

  // Check initial state
  console.log("Initial Auth State:", {
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token ? `${authStore.token.substring(0, 20)}...` : null,
    user: authStore.user,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,
  });

  // Check cookie and localStorage storage
  const cookieToken = tokenManager.getToken();
  const userData = tokenManager.getUserData();

  console.log("Cookie Storage:", {
    hasToken: !!cookieToken,
    tokenPreview: cookieToken ? `${cookieToken.substring(0, 20)}...` : null,
    hasUser: !!userData,
    userName: userData?.name || userData?.fullname,
  });

  // Test initialization
  console.log("Initializing auth...");
  authStore.initializeAuth().then(() => {
    console.log("Auth initialized successfully");
    console.log("Final Auth State:", {
      isAuthenticated: authStore.isAuthenticated,
      token: authStore.token ? `${authStore.token.substring(0, 20)}...` : null,
      user: authStore.user,
      isLoading: authStore.isLoading,
      isInitialized: authStore.isInitialized,
    });
  });
};

// Run test if in development
if (import.meta.env.DEV) {
  window.testAuth = testAuth;
  console.log("Auth test function available as window.testAuth()");
}

export default testAuth;
