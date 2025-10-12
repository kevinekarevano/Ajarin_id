import express from "express";
import { generateCertificate, getUserCertificates, getPublicCertificate, getCertificate, checkCertificateEligibility, downloadCertificate, verifyCertificate, getCourseCertificates } from "../controllers/certificate.controller.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/public/:certificateId", getPublicCertificate);
router.get("/download/:certificateId", downloadCertificate);
router.get("/verify/:certificateNumber", verifyCertificate);

// Protected routes (authentication required)
router.use(authenticate);

// User certificates
router.get("/my-certificates", getUserCertificates);

// Certificate generation and eligibility
router.post("/generate/:courseId", generateCertificate);
router.get("/eligibility/:courseId", checkCertificateEligibility);

// Individual certificate access
router.get("/:certificateId", getCertificate);

// Course certificates (for mentors)
router.get("/course/:courseId", getCourseCertificates);

// Debug endpoint to manually check completion
router.get("/debug/completion/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const Material = await import("../models/material.model.js").then((m) => m.default);
    const MaterialProgress = await import("../models/materialProgress.model.js").then((m) => m.default);

    const materials = await Material.find({ course_id: courseId }).sort({ order: 1 });
    const progressRecords = await MaterialProgress.find({
      user_id: userId,
      course_id: courseId,
    });

    const completedMaterials = progressRecords.filter((progress) => progress.is_completed);

    res.json({
      success: true,
      debug: {
        courseId,
        userId,
        materials: materials.map((m) => ({ id: m._id, title: m.title, order: m.order })),
        progressRecords: progressRecords.map((p) => ({
          material_id: p.material_id,
          is_completed: p.is_completed,
          completed_at: p.completed_at,
        })),
        summary: {
          totalMaterials: materials.length,
          completedMaterials: completedMaterials.length,
          completionPercentage: Math.round((completedMaterials.length / materials.length) * 100),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
