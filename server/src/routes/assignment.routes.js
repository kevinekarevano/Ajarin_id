import express from "express";
import {
  // Mentor functions
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getCourseAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
  // Student functions
  submitAssignment,
  getMySubmissions,
  getSubmissionDetails,
  getAssignmentDetails,
} from "../controllers/assignment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// All assignment routes require authentication
router.use(authMiddleware);

// =================== MENTOR ROUTES ===================

// Create assignment (with optional question file)
router.post("/course/:courseId/create", upload.single("question_file"), createAssignment);

// Update assignment (with optional question file)
router.put("/:assignmentId/update", upload.single("question_file"), updateAssignment);

// Delete assignment
router.delete("/:assignmentId/delete", deleteAssignment);

// Get assignments for a course (mentor view with stats)
router.get("/course/:courseId", getCourseAssignments);

// Get submissions for an assignment (mentor only)
router.get("/:assignmentId/submissions", getAssignmentSubmissions);

// Grade a submission (mentor only)
router.post("/submission/:submissionId/grade", gradeSubmission);

// =================== STUDENT ROUTES ===================

// Get assignment details by ID (for students to view assignment)
router.get("/:assignmentId/details", getAssignmentDetails);

// Submit assignment (with multiple files support)
router.post("/:assignmentId/submit", upload.multiple("files", 10), submitAssignment);

// Get student's own submissions
router.get("/my-submissions", getMySubmissions);

// Get single submission details (student or mentor)
router.get("/submission/:submissionId", getSubmissionDetails);

export default router;
