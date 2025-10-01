import express from "express";
import { getOrCreateProgress, toggleCompletion, rateMaterial, getCourseProgress, getCourseLeaderboard, getUserStats } from "../controllers/progress.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All progress routes require authentication
router.use(authMiddleware);

// 📊 SIMPLE PROGRESS TRACKING ENDPOINTS

// Material progress
router.get("/material/:materialId", getOrCreateProgress); // Get or create material progress
router.post("/material/:materialId/toggle", toggleCompletion); // Mark as completed/incomplete

// Rating
router.post("/material/:materialId/rate", rateMaterial); // Rate material

// Course progress
router.get("/course/:courseId", getCourseProgress); // Get user's course progress
router.get("/course/:courseId/leaderboard", getCourseLeaderboard); // Get course leaderboard

// User statistics
router.get("/stats", getUserStats); // Get user's learning statistics

export default router;
