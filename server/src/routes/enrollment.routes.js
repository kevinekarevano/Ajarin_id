import express from "express";
import { enrollToCourse, unenrollFromCourse, getMyEnrolledCourses, updateProgress, getEnrollmentDetails, getCourseStudents, getMentorOverview, checkEnrollmentStatus, getLearningStats } from "../controllers/enrollment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All enrollment routes require authentication
router.use(authMiddleware);

// 🎓 LEARNER ENDPOINTS
// Enrollment actions
router.post("/enroll/:courseId", enrollToCourse); // Enroll to course
router.delete("/unenroll/:courseId", unenrollFromCourse); // Unenroll from course

// Learning management
router.get("/my-courses", getMyEnrolledCourses); // Get my enrolled courses
router.get("/course/:courseId", getEnrollmentDetails); // Get enrollment details
router.patch("/course/:courseId/progress", updateProgress); // Update learning progress

// Learning analytics
router.get("/stats", getLearningStats); // Get learning statistics
router.get("/check/:courseId", checkEnrollmentStatus); // Check if enrolled in course

// 👨‍🏫 MENTOR ENDPOINTS
// Student management
router.get("/course/:courseId/students", getCourseStudents); // Get course students (mentor only)
router.get("/mentor/overview", getMentorOverview); // Get mentor overview

export default router;
