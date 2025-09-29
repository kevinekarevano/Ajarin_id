import express from "express";
import { createCourse, getAllCourses, getCourse, updateCourse, deleteCourse, getMyCourses, toggleCourseStatus, searchCourses } from "../controllers/course.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCourses); // Get all published courses with filters
router.get("/search", searchCourses); // Search courses
router.get("/:id", getCourse); // Get single course by ID or slug

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

// Mentor course management
router.post("/", upload.single("cover"), createCourse); // Create new course
router.get("/mentor/my-courses", getMyCourses); // Get mentor's courses
router.put("/:id", upload.single("cover"), updateCourse); // Update course
router.delete("/:id", deleteCourse); // Delete course
router.patch("/:id/status", toggleCourseStatus); // Change course status

export default router;
