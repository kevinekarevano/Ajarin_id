import express from "express";
import { createReply, updateReply, deleteReply, toggleLikeReply, markAsBestAnswer, unmarkAsBestAnswer, getNestedReplies, getUserReplies, searchReplies } from "../controllers/reply.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User's replies
router.get("/user/replies", getUserReplies);

// Discussion replies
router.post("/discussions/:discussionId/replies", createReply);

// Search replies in discussion
router.get("/discussions/:discussionId/replies/search", searchReplies);

// Single reply operations
router.put("/replies/:replyId", updateReply);
router.delete("/replies/:replyId", deleteReply);

// Reply interactions
router.post("/replies/:replyId/like", toggleLikeReply);
router.post("/replies/:replyId/best-answer", markAsBestAnswer);
router.delete("/replies/:replyId/best-answer", unmarkAsBestAnswer);

// Nested replies
router.get("/replies/:replyId/nested", getNestedReplies);

export default router;
