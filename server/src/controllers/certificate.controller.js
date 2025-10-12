import Certificate from "../models/certificate.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import MaterialProgress from "../models/materialProgress.model.js";
import Material from "../models/material.model.js";
import { nanoid } from "nanoid";

// Helper function to check course completion
const checkCourseCompletion = async (userId, courseId) => {
  try {
    console.log("🔍 Checking course completion for:", { userId, courseId });

    // Get course materials
    const materials = await Material.find({ course_id: courseId }).sort({ order: 1 });
    console.log("📚 Found materials:", materials.length);

    if (materials.length === 0) {
      console.log("❌ No materials found for course");
      return { isCompleted: false, completionPercentage: 0, error: "Course has no materials" };
    }

    // Get user's material progress
    const progressRecords = await MaterialProgress.find({
      user_id: userId,
      course_id: courseId,
    });
    console.log("📈 Found progress records:", progressRecords.length);

    // Calculate completion
    const completedMaterials = progressRecords.filter((progress) => progress.is_completed);
    const completionPercentage = Math.round((completedMaterials.length / materials.length) * 100);

    console.log("📊 Completion calculation:", {
      totalMaterials: materials.length,
      completedMaterials: completedMaterials.length,
      completionPercentage,
      isCompleted: completionPercentage === 100,
    });

    // Debug: Show individual progress
    progressRecords.forEach((progress, index) => {
      console.log(`📄 Progress ${index + 1}:`, {
        material_id: progress.material_id,
        is_completed: progress.is_completed,
        completed_at: progress.completed_at,
      });
    });

    return {
      isCompleted: completionPercentage === 100,
      completionPercentage,
      totalMaterials: materials.length,
      completedMaterials: completedMaterials.length,
      lastCompletedAt: completedMaterials.length > 0 ? new Date(Math.max(...completedMaterials.map((p) => new Date(p.completed_at || p.updated_at)))) : null,
    };
  } catch (error) {
    console.error("Error checking course completion:", error);
    return { isCompleted: false, completionPercentage: 0, error: error.message };
  }
};

// Generate certificate for completed course
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      learner_id: userId,
      course_id: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user_id: userId,
      course_id: courseId,
      status: "active",
    });

    if (existingCertificate) {
      return res.status(409).json({
        success: false,
        message: "Certificate already exists for this course",
        data: { certificate: existingCertificate },
      });
    }

    // Check course completion
    const completion = await checkCourseCompletion(userId, courseId);

    if (!completion.isCompleted) {
      return res.status(400).json({
        success: false,
        message: `Course not completed. Current progress: ${completion.completionPercentage}%`,
        data: {
          completionPercentage: completion.completionPercentage,
          completedMaterials: completion.completedMaterials,
          totalMaterials: completion.totalMaterials,
        },
      });
    }

    // Get course and user details
    const [course, user] = await Promise.all([Course.findById(courseId).populate("mentor_id", "fullname"), User.findById(userId)]);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found",
      });
    }

    // Calculate course duration (rough estimate based on materials)
    const materials = await Material.find({ course_id: courseId });
    const estimatedHours = Math.max(1, Math.ceil(materials.length * 0.5)); // 30min per material

    // Generate unique certificate number and public URL
    const certificateNumber = `CERT-${Date.now()}-${nanoid(8)}`;
    const certificateId = nanoid(16);
    const publicUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/certificate/${certificateId}`;

    // Create certificate
    const certificate = new Certificate({
      certificate_id: certificateId,
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
      recipient_name: user.fullname,
      course_title: course.title,
      course_category: course.category,
      mentor_name: course.mentor_id.fullname,
      completion_date: completion.lastCompletedAt || new Date(),
      total_materials: completion.totalMaterials,
      completion_percentage: 100,
      course_duration_hours: estimatedHours,
      public_url: publicUrl,
    });

    await certificate.save();

    // Populate the saved certificate
    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate("user_id", "fullname username email")
      .populate("course_id", "title category cover_image")
      .populate({
        path: "course_id",
        populate: {
          path: "mentor_id",
          select: "fullname username",
        },
      });

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: { certificate: populatedCertificate },
    });
  } catch (error) {
    console.error("Generate certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
      error: error.message,
    });
  }
};

// Get user's certificates
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const certificates = await Certificate.find({
      user_id: userId,
      status: "active",
    })
      .populate("course_id", "title category cover_image")
      .sort({ issued_date: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalCertificates = await Certificate.countDocuments({
      user_id: userId,
      status: "active",
    });

    res.status(200).json({
      success: true,
      data: {
        certificates,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCertificates / limitNum),
          totalCertificates,
          hasNextPage: pageNum < Math.ceil(totalCertificates / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve certificates",
      error: error.message,
    });
  }
};

// Get public certificate (no auth required)
export const getPublicCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findByPublicId(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or has been revoked",
      });
    }

    // Increment view count
    await certificate.incrementView();

    res.status(200).json({
      success: true,
      data: { certificate },
    });
  } catch (error) {
    console.error("Get public certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve certificate",
      error: error.message,
    });
  }
};

// Get certificate by ID (authenticated)
export const getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.userId;

    const certificate = await Certificate.findOne({
      certificate_id: certificateId,
      user_id: userId,
      status: "active",
    })
      .populate("user_id", "fullname username email")
      .populate("course_id", "title category cover_image")
      .populate({
        path: "course_id",
        populate: {
          path: "mentor_id",
          select: "fullname username",
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { certificate },
    });
  } catch (error) {
    console.error("Get certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve certificate",
      error: error.message,
    });
  }
};

// Check if user can claim certificate
export const checkCertificateEligibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    console.log("🎓 Checking certificate eligibility:", { courseId, userId });

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      learner_id: userId,
      course_id: courseId,
      status: "active",
    });

    console.log("📚 Enrollment found:", !!enrollment);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course",
        data: { eligible: false, reason: "not_enrolled" },
      });
    }

    // Check existing certificate
    const existingCertificate = await Certificate.findOne({
      user_id: userId,
      course_id: courseId,
      status: "active",
    });

    console.log("🏆 Existing certificate found:", !!existingCertificate);

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        data: {
          eligible: false,
          reason: "already_claimed",
          certificate: existingCertificate,
        },
      });
    }

    // Check completion
    const completion = await checkCourseCompletion(userId, courseId);
    console.log("📊 Course completion result:", completion);

    res.status(200).json({
      success: true,
      data: {
        eligible: completion.isCompleted,
        reason: completion.isCompleted ? "eligible" : "incomplete",
        completionPercentage: completion.completionPercentage,
        completedMaterials: completion.completedMaterials,
        totalMaterials: completion.totalMaterials,
      },
    });
  } catch (error) {
    console.error("Check certificate eligibility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
      error: error.message,
    });
  }
};

// Download certificate (increment download count)
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findByPublicId(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Increment download count
    await certificate.incrementDownload();

    // Return certificate data for PDF generation
    res.status(200).json({
      success: true,
      message: "Certificate ready for download",
      data: { certificate },
    });
  } catch (error) {
    console.error("Download certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to prepare certificate download",
      error: error.message,
    });
  }
};

// Verify certificate authenticity
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      certificate_number: certificateNumber,
      status: "active",
    })
      .populate("user_id", "fullname username")
      .populate("course_id", "title category")
      .populate({
        path: "course_id",
        populate: {
          path: "mentor_id",
          select: "fullname",
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid",
        data: { verified: false },
      });
    }

    res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: {
        verified: true,
        certificate: {
          certificate_number: certificate.certificate_number,
          recipient_name: certificate.recipient_name,
          course_title: certificate.course_title,
          mentor_name: certificate.mentor_name,
          issued_date: certificate.issued_date,
          completion_date: certificate.completion_date,
        },
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify certificate",
      error: error.message,
    });
  }
};

// Get course certificates (for mentors)
export const getCourseCertificates = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is the mentor of this course
    const course = await Course.findOne({
      _id: courseId,
      mentor_id: userId,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not the mentor of this course",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const certificates = await Certificate.find({
      course_id: courseId,
      status: "active",
    })
      .populate("user_id", "fullname username email")
      .sort({ issued_date: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalCertificates = await Certificate.countDocuments({
      course_id: courseId,
      status: "active",
    });

    res.status(200).json({
      success: true,
      data: {
        certificates,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCertificates / limitNum),
          totalCertificates,
          hasNextPage: pageNum < Math.ceil(totalCertificates / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get course certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve course certificates",
      error: error.message,
    });
  }
};
