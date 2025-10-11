import express from "express";
import { createMaterial, getCourseMaterials, getMaterial, updateMaterial, deleteMaterial, reorderMaterials, getMyMaterials, viewMaterial, servePDF, downloadMaterial } from "../controllers/material.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Protected routes (require authentication for all material endpoints)
router.use(authMiddleware);

// Course materials - requires authentication to check mentor/student permissions
router.get("/course/:courseId", getCourseMaterials); // Get course materials list

router.get("/:materialId", getMaterial); // Get single material info

// Material access requires authentication and enrollment
router.get("/:materialId/view", viewMaterial); // View/access material content
router.get("/:materialId/pdf", servePDF); // Serve PDF files with proper headers
router.get("/:materialId/download", downloadMaterial); // Force download material with original filename

// 👨‍🏫 MENTOR ENDPOINTS
// Material management
router.post("/", upload.singleMaterial("file"), createMaterial); // Create material
router.get("/mentor/my-materials", getMyMaterials); // Get mentor's materials
router.put("/:materialId", upload.singleMaterial("file"), updateMaterial); // Update material
router.delete("/:materialId", deleteMaterial); // Delete material

// Course organization
router.patch("/course/:courseId/reorder", reorderMaterials); // Reorder materials

export default router;
