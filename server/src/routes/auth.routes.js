import express from "express";
import { register, login, logout, getProfile } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authMiddleware, getProfile);

export default router;
