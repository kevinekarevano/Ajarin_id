import express from "express";

const app = express();

// Basic middleware
app.use(express.json());

// Simple health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Ajarin.id API is running!",
    version: "1.0.0",
  });
});

// Simple API test
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API endpoint working!",
    data: {
      method: req.method,
      path: req.path,
      env: process.env.NODE_ENV,
    },
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

// Export for Vercel
export default app;
