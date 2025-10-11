import MaterialProgress from "../models/materialProgress.model.js";
import materialModel from "../models/material.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";

// Get or create material progress
export const getOrCreateProgress = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;

    // Get material and course info
    const material = await materialModel.findById(materialId).populate("course_id");
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check if user is enrolled or is mentor
    const enrollment = await enrollmentModel.findOne({
      learner_id: userId,
      course_id: material.course_id._id,
    });

    const isMentor = material.course_id.mentor_id.toString() === userId;

    if (!enrollment && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to track progress",
      });
    }

    // Get or create progress
    const progress = await MaterialProgress.getOrCreate(userId, materialId, material.course_id._id);

    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching progress",
    });
  }
};

// Mark material as completed/incomplete (Simple toggle)
export const toggleCompletion = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;
    const { completed } = req.body; // true or false

    console.log("Toggling completion:", { materialId, userId, completed });

    // Get material and validate
    const material = await materialModel.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check if user is enrolled or is mentor
    const enrollment = await enrollmentModel.findOne({
      learner_id: userId,
      course_id: material.course_id,
    });

    const isMentor = material.mentor_id && material.mentor_id.toString() === userId;

    if (!enrollment && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to track progress",
      });
    }

    // Get or create progress
    const progress = await MaterialProgress.getOrCreate(userId, materialId, material.course_id);

    // Toggle completion status
    if (completed) {
      await progress.markAsCompleted();
    } else {
      await progress.markAsIncomplete();
    }

    // Return updated progress
    const updatedProgress = await MaterialProgress.findById(progress._id).populate("material_id", "title type").populate("course_id", "title");

    res.status(200).json({
      success: true,
      message: completed ? "Material marked as completed ✅" : "Material marked as incomplete ⏳",
      data: { progress: updatedProgress },
    });
  } catch (error) {
    console.error("Toggle completion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// Rate material (Optional feature)
export const rateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;
    const { rating, feedback = "" } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const material = await materialModel.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    const progress = await MaterialProgress.getOrCreate(userId, materialId, material.course_id);
    await progress.rateMaterial(rating, feedback.trim());

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully ⭐",
      data: { progress },
    });
  } catch (error) {
    console.error("Rate material error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rating material",
    });
  }
};

// Get user's course progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if user is enrolled or is mentor
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrollment = await enrollmentModel.findOne({
      learner_id: userId,
      course_id: courseId,
    });

    const isMentor = course.mentor_id.toString() === userId;

    if (!enrollment && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to view progress",
      });
    }

    // Get course progress overview
    const progressOverview = await MaterialProgress.getUserCourseProgress(userId, courseId);

    // Get detailed progress for each material
    const detailedProgress = await MaterialProgress.find({
      user_id: userId,
      course_id: courseId,
    })
      .populate("material_id", "title type chapter order")
      .sort({ "material_id.chapter": 1, "material_id.order": 1 });

    res.status(200).json({
      success: true,
      data: {
        overview: progressOverview[0] || {
          course_id: courseId,
          total_materials: 0,
          completed_materials: 0,
          completion_percentage: 0,
          average_rating: 0,
        },
        material_progress: detailedProgress, // Changed from 'materials' to 'material_progress'
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Get course progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course progress",
    });
  }
};

// Get course leaderboard
export const getCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 10 } = req.query;

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const leaderboard = await MaterialProgress.getCourseLeaderboard(courseId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching leaderboard",
    });
  }
};

// Get user's overall learning statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's progress across all courses
    const stats = await MaterialProgress.getUserStats(userId);

    // Get recent completed materials
    const recentCompletions = await MaterialProgress.find({
      user_id: userId,
      is_completed: true,
    })
      .populate("material_id", "title type")
      .populate("course_id", "title")
      .sort({ marked_completed_at: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          total_materials: 0,
          completed_materials: 0,
          completion_rate: 0,
          courses_count: 0,
          average_rating_given: 0,
        },
        recent_completions: recentCompletions,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    });
  }
};
