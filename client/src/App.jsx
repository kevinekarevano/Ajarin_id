import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRouter from "./routes/AppRouter";
import useAuthStore from "./store/authStore";
import "./index.css";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth on app startup
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#f1f5f9",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#f1f5f9",
            },
          },
        }}
      />
    </>
  );
}

export default App;
