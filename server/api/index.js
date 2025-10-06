import express from "express";
import dotenv from "dotenv";
import connectDB from "../src/configs/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/auth.routes.js";
import courseRoutes from "../src/routes/course.routes.js";
import enrollmentRoutes from "../src/routes/enrollment.routes.js";
import materialRoutes from "../src/routes/material.routes.js";
import progressRoutes from "../src/routes/progress.routes.js";
import assignmentRoutes from "../src/routes/assignment.routes.js";
import discussionRoutes from "../src/routes/discussion.routes.js";
import replyRoutes from "../src/routes/reply.routes.js";

// Initialize environment
dotenv.config();

const app = express();

// Global error handler
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception:", error);
});

// Database connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    cachedDb = await connectDB();
    return cachedDb;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS for Vercel
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to Ajarin ID API!",
    version: "1.0.0",
    documentation: "https://github.com/kevinekarevano/Ajarin_id",
    endpoints: {
      health: "GET /health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile",
      },
      courses: {
        getAllCourses: "GET /api/courses",
        getCourse: "GET /api/courses/:id",
        createCourse: "POST /api/courses",
      },
      forum: {
        getCourseDiscussions: "GET /api/forum/course/:courseId/discussions",
        createDiscussion: "POST /api/forum/course/:courseId/discussions",
      },
    },
  });
});

// Initialize database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/forum", discussionRoutes);
app.use("/api/forum", replyRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
    suggestion: "Check the API documentation for available endpoints",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      path: req.path,
      method: req.method,
    }),
  });
});

export default app;
