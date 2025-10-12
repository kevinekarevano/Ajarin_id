import express from "express";
import {
  getCourseDiscussions,
  getMentorCourseDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLikeDiscussion,
  togglePinDiscussion,
  toggleLockDiscussion,
  markAsResolved,
  searchDiscussions,
  getUserDiscussions,
} from "../controllers/discussion.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User's discussions
router.get("/user/discussions", getUserDiscussions);

// Course discussions
router.get("/course/:courseId/discussions", getCourseDiscussions);
router.post("/course/:courseId/discussions", createDiscussion);

// Mentor course discussions (simplified access)
router.get("/mentor/course/:courseId/discussions", getMentorCourseDiscussions);

// Search discussions in course
router.get("/course/:courseId/discussions/search", searchDiscussions);

// Single discussion operations
router.get("/:discussionId", getDiscussion);
router.put("/:discussionId", updateDiscussion);
router.delete("/:discussionId", deleteDiscussion);

// Discussion interactions
router.post("/:discussionId/like", toggleLikeDiscussion);
router.post("/:discussionId/pin", togglePinDiscussion);
router.post("/:discussionId/lock", toggleLockDiscussion);
router.post("/:discussionId/resolve", markAsResolved);

export default router;
