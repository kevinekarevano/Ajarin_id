import { Navigate } from "react-router";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  // Show loading spinner while checking authentication or not yet initialized
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-[#0F1624] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
