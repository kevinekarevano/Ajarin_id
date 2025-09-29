import enrollmentModel from "../models/enrollment.model.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";

// Enroll to course
export const enrollToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const learnerId = req.user.userId;

    // Find course and validate
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is published
    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll to unpublished course",
      });
    }

    // Prevent mentor from enrolling to own course
    if (course.mentor_id.toString() === learnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot enroll to your own course",
      });
    }

    // Check if already enrolled
    const existingEnrollment = await enrollmentModel.findOne({
      learner_id: learnerId,
      course_id: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
        data: {
          enrollment: existingEnrollment,
        },
      });
    }

    // Create enrollment
    const enrollment = new enrollmentModel({
      learner_id: learnerId,
      course_id: courseId,
      mentor_id: course.mentor_id,
    });

    await enrollment.save();

    // Updated course enrollment count
    await courseModel.findByIdAndUpdate(courseId, {
      $inc: { total_enrollments: 1 },
    });

    // Populate enrollment for response
    await enrollment.populate([
      { path: "course_id", select: "title slug description category cover_url" },
      { path: "mentor_id", select: "fullname username avatar" },
    ]);

    res.status(201).json({
      success: true,
      message: "Successfully enrolled to course",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error("Enroll to course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during enrollment",
    });
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const learnerId = req.user.userId;

    // Find enrollment
    const enrollment = await enrollmentModel.findOne({
      learner_id: learnerId,
      course_id: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Prevent unenrolling if course is completed (optional business rule)
    if (enrollment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot unenroll from completed course",
      });
    }

    // Delete enrollment
    await enrollmentModel.findByIdAndDelete(enrollment._id);

    // Update course enrollment count
    await courseModel.findByIdAndUpdate(courseId, {
      $inc: { total_enrollments: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unenrolled from course",
    });
  } catch (error) {
    console.error("Unenroll from course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during unenrollment",
    });
  }
};

// Get my enrolled courses
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const learnerId = req.user.userId;
    const { page = 1, limit = 10, status, sort = "-enrolled_at" } = req.query;

    // Build filter
    const filter = { learner_id: learnerId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get enrollments
    const enrollments = await enrollmentModel
      .find(filter)
      .populate("course_id", "title slug description category cover_url rating total_duration_minutes")
      .populate("mentor_id", "fullname username avatar")
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const totalEnrollments = await enrollmentModel.countDocuments(filter);
    const totalPages = Math.ceil(totalEnrollments / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEnrollments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my enrolled courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrolled courses",
    });
  }
};

// Update enrollment progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress_percentage, notes } = req.body;
    const learnerId = req.user.userId;

    // Validate progress percentage
    if (progress_percentage < 0 || progress_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress percentage must be between 0 and 100",
      });
    }

    // Find enrollment
    const enrollment = await enrollmentModel.findOne({
      learner_id: learnerId,
      course_id: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Update progress
    enrollment.progress_percentage = progress_percentage;
    enrollment.last_accessed = new Date();
    if (notes !== undefined) enrollment.notes = notes;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: {
        enrollment: {
          id: enrollment._id,
          progress_percentage: enrollment.progress_percentage,
          status: enrollment.status,
          last_accessed: enrollment.last_accessed,
          completed_at: enrollment.completed_at,
        },
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// Get enrollment details
export const getEnrollmentDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const learnerId = req.user.userId;

    const enrollment = await enrollmentModel
      .findOne({
        learner_id: learnerId,
        course_id: courseId,
      })
      .populate([
        { path: "course_id", select: "title description category cover_url rating total_duration_minutes" },
        { path: "mentor_id", select: "fullname username avatar headline" },
      ]);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error("Get enrollment details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollment details",
    });
  }
};

// Get course students (for mentors)
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mentorId = req.user.userId;
    const { page = 1, limit = 20, status, sort = "-enrolled_at" } = req.query;

    // Verify course ownership
    const course = await courseModel.findOne({
      _id: courseId,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to view its students",
      });
    }

    // Build filter
    const filter = { course_id: courseId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get enrollments
    const enrollments = await enrollmentModel.find(filter).populate("learner_id", "fullname username avatar email").skip(skip).limit(parseInt(limit)).sort(sort);

    const totalStudents = await enrollmentModel.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / parseInt(limit));

    // Get enrollment statistics
    const stats = await enrollmentModel.getEnrollmentStats(courseId);

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          total_enrollments: course.total_enrollments,
        },
        enrollments,
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStudents,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get course students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course students",
    });
  }
};

// Get mentor overview (all students across all courses)
export const getMentorOverview = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    // Get mentor's courses
    const courses = await courseModel.find({ mentor_id: mentorId }).select("title total_enrollments");

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          courses: [],
          totalStudents: 0,
          totalEnrollments: 0,
          recentEnrollments: [],
        },
      });
    }

    const courseIds = courses.map((course) => course._id);

    // Get enrollment statistics
    const totalEnrollments = await enrollmentModel.countDocuments({
      course_id: { $in: courseIds },
    });

    const uniqueStudents = await enrollmentModel.distinct("learner_id", {
      course_id: { $in: courseIds },
    });

    const recentEnrollments = await enrollmentModel
      .find({
        course_id: { $in: courseIds },
      })
      .populate("learner_id", "fullname username avatar")
      .populate("course_id", "title")
      .sort({ enrolled_at: -1 })
      .limit(10);

    // Status breakdown
    const statusStats = await enrollmentModel.aggregate([
      { $match: { course_id: { $in: courseIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses: courses.map((course) => ({
          id: course._id,
          title: course.title,
          enrollments: course.total_enrollments,
        })),
        totalStudents: uniqueStudents.length,
        totalEnrollments,
        statusBreakdown: statusStats,
        recentEnrollments,
      },
    });
  } catch (error) {
    console.error("Get mentor overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching mentor overview",
    });
  }
};

// Check enrollment status
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const learnerId = req.user.userId;

    const enrollment = await enrollmentModel
      .findOne({
        learner_id: learnerId,
        course_id: courseId,
      })
      .select("status progress_percentage enrolled_at last_accessed");

    res.status(200).json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    console.error("Check enrollment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking enrollment status",
    });
  }
};

// Get learning statistics for current user
export const getLearningStats = async (req, res) => {
  try {
    const learnerId = req.user.userId;

    const stats = await enrollmentModel.getLearnerStats(learnerId);
    const recentCourses = await enrollmentModel.findByLearner(learnerId).limit(5);

    res.status(200).json({
      success: true,
      data: {
        statistics: stats[0] || {
          totalEnrollments: 0,
          completedCourses: 0,
          totalLearningTime: 0,
          avgProgress: 0,
        },
        recentCourses,
      },
    });
  } catch (error) {
    console.error("Get learning stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning statistics",
    });
  }
};
