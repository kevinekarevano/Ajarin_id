import express from "express";
import { createReply, updateReply, deleteReply, toggleLikeReply, markAsBestAnswer, unmarkAsBestAnswer, getNestedReplies, getUserReplies, searchReplies } from "../controllers/reply.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User's replies
router.get("/user/replies", getUserReplies);

// Discussion replies
router.post("/discussion/:discussionId", createReply);

// Search replies in discussion
router.get("/discussion/:discussionId/search", searchReplies);

// Single reply operations
router.put("/:replyId", updateReply);
router.delete("/:replyId", deleteReply);

// Reply interactions
router.post("/:replyId/like", toggleLikeReply);
router.post("/:replyId/best-answer", markAsBestAnswer);
router.delete("/:replyId/best-answer", unmarkAsBestAnswer);

// Nested replies
router.get("/:replyId/nested", getNestedReplies);

export default router;
