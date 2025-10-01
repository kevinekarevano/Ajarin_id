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

// Update material progress
export const updateProgress = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;
    const { percentage, timeSpent, videoProgress, readingProgress, quizData } = req.body;

    console.log("Updating progress:", { materialId, userId, percentage, timeSpent });

    // Get or create progress
    const material = await materialModel.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    const progress = await MaterialProgress.getOrCreate(userId, materialId, material.course_id);

    // Update progress based on type
    if (quizData) {
      // Handle quiz completion
      await progress.addQuizAttempt(quizData);
    } else {
      // Handle regular progress update
      await progress.updateProgress({
        percentage,
        timeSpent,
        videoProgress,
        readingProgress,
      });
    }

    // Populate the updated progress
    const updatedProgress = await MaterialProgress.findById(progress._id).populate("material_id", "title type").populate("course_id", "title");

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: { progress: updatedProgress },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// Add note to material
export const addNote = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;
    const { content, timestamp = 0 } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
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
    await progress.addNote(content.trim(), timestamp);

    res.status(200).json({
      success: true,
      message: "Note added successfully",
      data: { progress },
    });
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding note",
    });
  }
};

// Rate material
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
      message: "Rating submitted successfully",
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
      .populate("material_id", "title type chapter order duration_minutes")
      .sort({ "material_id.chapter": 1, "material_id.order": 1 });

    res.status(200).json({
      success: true,
      data: {
        overview: progressOverview[0] || {
          course_id: courseId,
          total_materials: 0,
          completed_materials: 0,
          in_progress_materials: 0,
          completion_percentage: 0,
          average_progress: 0,
          total_time_spent: 0,
          total_quiz_attempts: 0,
          average_quiz_score: 0,
        },
        materials: detailedProgress,
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

    const leaderboard = await MaterialProgress.getLeaderboard(courseId, parseInt(limit));

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

// Get user's overall learning analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeframe = "all" } = req.query; // all, month, week

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    if (timeframe === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter.updated_at = { $gte: monthAgo };
    } else if (timeframe === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.updated_at = { $gte: weekAgo };
    }

    // Get user's progress across all courses
    const analytics = await MaterialProgress.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total_materials_accessed: { $sum: 1 },
          total_materials_completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          total_time_spent: { $sum: "$time_spent_minutes" },
          average_progress: { $avg: "$progress_percentage" },
          total_quiz_attempts: { $sum: { $size: "$quiz_attempts" } },
          average_quiz_score: { $avg: "$best_quiz_score" },
          courses_count: { $addToSet: "$course_id" },
        },
      },
      {
        $project: {
          total_materials_accessed: 1,
          total_materials_completed: 1,
          completion_rate: {
            $cond: [
              { $eq: ["$total_materials_accessed", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [{ $divide: ["$total_materials_completed", "$total_materials_accessed"] }, 100],
                  },
                  2,
                ],
              },
            ],
          },
          total_time_spent: 1,
          average_progress: { $round: ["$average_progress", 2] },
          total_quiz_attempts: 1,
          average_quiz_score: { $round: ["$average_quiz_score", 2] },
          courses_count: { $size: "$courses_count" },
        },
      },
    ]);

    // Get recent activity
    const recentActivity = await MaterialProgress.find({
      user_id: userId,
      updated_at: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate("material_id", "title type")
      .populate("course_id", "title")
      .sort({ updated_at: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        analytics: analytics[0] || {
          total_materials_accessed: 0,
          total_materials_completed: 0,
          completion_rate: 0,
          total_time_spent: 0,
          average_progress: 0,
          total_quiz_attempts: 0,
          average_quiz_score: 0,
          courses_count: 0,
        },
        recent_activity: recentActivity,
        timeframe,
      },
    });
  } catch (error) {
    console.error("Get user analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};
