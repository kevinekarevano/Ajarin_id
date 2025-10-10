import express from "express";
import multer from "multer";
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

// Debug middleware for POST requests
const debugMiddleware = (req, res, next) => {
  console.log("=== ROUTE DEBUG ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Body keys:", Object.keys(req.body || {}));
  console.log("Files:", req.files);
  console.log("File:", req.file);
  next();
};

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log("=== MULTER ERROR ===");
    console.log("Error code:", err.code);
    console.log("Error message:", err.message);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File terlalu besar. Maksimal 10MB diperbolehkan.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Field file tidak dikenali. Gunakan field 'cover' untuk upload gambar.",
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle file filter errors (wrong file type)
  if (err.message && err.message.includes("Only image files are allowed")) {
    return res.status(400).json({
      success: false,
      message: "Format file tidak didukung. Hanya file gambar yang diperbolehkan (JPEG, JPG, PNG, GIF, WebP).",
    });
  }

  // Pass other errors to next middleware
  next(err);
};

// Mentor course management
router.post("/", debugMiddleware, upload.single("cover"), multerErrorHandler, createCourse); // Create new course
router.get("/mentor/my-courses", getMyCourses); // Get mentor's courses
router.put("/:id", debugMiddleware, upload.single("cover"), multerErrorHandler, updateCourse); // Update course
router.delete("/:id", debugMiddleware, deleteCourse); // Delete course
router.patch("/:id/status", debugMiddleware, toggleCourseStatus); // Change course status

export default router;
