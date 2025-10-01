import express from "express";
import {
  getCourseDiscussions,
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
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User's discussions
router.get("/user/discussions", getUserDiscussions);

// Course discussions
router.get("/course/:courseId/discussions", getCourseDiscussions);
router.post("/course/:courseId/discussions", createDiscussion);

// Search discussions in course
router.get("/course/:courseId/discussions/search", searchDiscussions);

// Single discussion operations
router.get("/discussions/:discussionId", getDiscussion);
router.put("/discussions/:discussionId", updateDiscussion);
router.delete("/discussions/:discussionId", deleteDiscussion);

// Discussion interactions
router.post("/discussions/:discussionId/like", toggleLikeDiscussion);
router.post("/discussions/:discussionId/pin", togglePinDiscussion);
router.post("/discussions/:discussionId/lock", toggleLockDiscussion);
router.post("/discussions/:discussionId/resolve", markAsResolved);

export default router;
