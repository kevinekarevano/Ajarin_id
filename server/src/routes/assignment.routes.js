import express from "express";
import { submitAssignment, getMySubmissions, getSubmission, gradeAssignment, returnForRevision, getSubmissionsForGrading, getAssignmentStats } from "../controllers/assignment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// All assignment routes require authentication
router.use(authMiddleware);

// 📝 STUDENT ENDPOINTS

// Submit assignment
router.post("/:assignmentId/submit", upload.singleMaterial("file"), submitAssignment);

// Get student's submissions
router.get("/my-submissions", getMySubmissions); // Get all my submissions

// Get single submission details
router.get("/submission/:submissionId", getSubmission);

// 👨‍🏫 MENTOR ENDPOINTS

// Grade assignment
router.post("/submission/:submissionId/grade", gradeAssignment);

// Return assignment for revision
router.post("/submission/:submissionId/return", returnForRevision);

// Get submissions for grading
router.get("/grading", getSubmissionsForGrading); // Query: courseId, assignmentId, status

// Get assignment statistics
router.get("/:assignmentId/stats", getAssignmentStats);

export default router;
