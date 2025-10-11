import Assignment from "../models/assignment.model.js";
import AssignmentSubmission from "../models/assignmentSubmission.model.js";
import materialModel from "../models/material.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Create new assignment (Mentor only)
export const createAssignment = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { course_id, title, description, instructions, assignment_type, max_file_size, allowed_file_types, max_points, max_attempts, grading_rubric, publish_date, is_published } = req.body;

    console.log("Creating assignment with body:", {
      title,
      course_id,
      assignment_type,
      publish_date,
      is_published,
      hasFile: !!req.file,
    });

    // Validate required fields
    if (!course_id || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide course_id, title, and description",
      });
    }

    // Verify course ownership
    const course = await courseModel.findOne({
      _id: course_id,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to create assignments",
      });
    }

    // Get next order number (assignments are now course-level, not chapter-specific)
    let nextOrder;
    try {
      nextOrder = await Assignment.getNextOrder(course_id, "General");
      console.log("Next order calculated:", nextOrder);
    } catch (orderError) {
      console.error("Error getting next order:", orderError);
      return res.status(500).json({
        success: false,
        message: "Failed to calculate assignment order",
      });
    }

    // Parse grading rubric if provided
    let parsedRubric = [];
    if (grading_rubric) {
      parsedRubric = typeof grading_rubric === "string" ? JSON.parse(grading_rubric) : grading_rubric;
    }

    // Parse allowed file types if provided
    let parsedFileTypes = [];
    if (allowed_file_types) {
      parsedFileTypes = typeof allowed_file_types === "string" ? JSON.parse(allowed_file_types) : allowed_file_types;
    }

    // Handle question file upload if provided
    let questionFileData = null;
    if (req.file) {
      try {
        console.log("Uploading question file:", req.file.originalname);
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: `assignments/${course_id}/questions`,
          public_id: `question_${Date.now()}`,
          resource_type: "auto", // Automatically detect file type
        });

        questionFileData = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          file_name: req.file.originalname,
          file_size: req.file.size,
          file_type: req.file.mimetype,
        };
      } catch (uploadError) {
        console.error("Question file upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload question file",
        });
      }
    }

    // Create assignment
    console.log("Creating assignment with data:", {
      course_id,
      title: title?.trim(),
      assignment_type,
      questionFileData: !!questionFileData,
    });

    // Handle publish_date properly for FormData
    let processedPublishDate = null;
    if (publish_date && publish_date !== "null" && publish_date !== "undefined" && publish_date.trim() !== "") {
      const dateObj = new Date(publish_date);
      if (!isNaN(dateObj.getTime())) {
        processedPublishDate = dateObj;
      }
    } else if (is_published === true || is_published === "true") {
      processedPublishDate = new Date();
    }

    // Handle is_published boolean conversion for FormData
    const isPublishedBool = is_published === true || is_published === "true";

    const assignment = new Assignment({
      course_id,
      mentor_id: mentorId,
      title: title.trim(),
      description: description.trim(),
      instructions: instructions?.trim() || "",
      chapter: "General", // All assignments are course-level
      assignment_type: assignment_type || "both",
      max_file_size: max_file_size || 50 * 1024 * 1024, // 50MB default
      allowed_file_types: parsedFileTypes,
      max_points: parseInt(max_points) || 100,
      max_attempts: parseInt(max_attempts) || 1,
      question_file: questionFileData,
      grading_rubric: parsedRubric,
      order: nextOrder,
      is_published: isPublishedBool,
      publish_date: processedPublishDate,
    });

    console.log("Assignment object created, attempting to save...");
    await assignment.save();
    console.log("Assignment saved successfully");

    // Populate for response
    await assignment.populate("course_id", "title");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating assignment",
    });
  }
};

// Get course assignments (Both mentor and students)
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to the course
    const course = await courseModel.findById(courseId).populate("mentor_id", "fullname username");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isMentor = course.mentor_id._id.toString() === userId;
    let isEnrolled = false;

    if (!isMentor) {
      const enrollment = await enrollmentModel.findOne({
        learner_id: userId,
        course_id: courseId,
      });
      isEnrolled = !!enrollment;
    }

    if (!isMentor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this course",
      });
    }

    // Build query based on user role
    let query = { course_id: courseId };

    // Students can only see published assignments
    if (!isMentor) {
      query.is_published = true;
      query.$or = [{ publish_date: { $lte: new Date() } }, { publish_date: null }];
    }

    const assignments = await Assignment.find(query).populate("mentor_id", "fullname username avatar").sort({ chapter: 1, order: 1 });

    // For students, add submission status
    if (!isMentor) {
      for (let assignment of assignments) {
        const submission = await AssignmentSubmission.findOne({
          assignment_id: assignment._id,
          student_id: userId,
        }).select("status submitted_at score");

        assignment._doc.submission_status = submission
          ? {
              status: submission.status,
              submitted_at: submission.submitted_at,
              score: submission.score,
              has_submitted: true,
            }
          : {
              has_submitted: false,
              can_submit: assignment.canSubmit(),
            };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        assignments,
        course: {
          title: course.title,
          mentor: course.mentor_id,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assignments",
    });
  }
};

// Get single assignment details (Mentor only)
export const getAssignment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    console.log("Getting assignment:", { assignmentId, userId });

    const assignment = await Assignment.findById(assignmentId).populate("course_id", "title mentor_id");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is mentor
    const isMentor = assignment.course_id.mentor_id.toString() === userId;

    // Check if user is enrolled student
    let isEnrolled = false;
    if (!isMentor) {
      const enrollment = await enrollmentModel.findOne({
        learner_id: userId,
        course_id: assignment.course_id._id,
      });
      isEnrolled = !!enrollment;
    }

    // Verify access permission
    if (!isMentor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this assignment",
      });
    }

    // Students can only see published assignments
    if (!isMentor && !assignment.is_published) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // For students, add submission status
    let assignmentData = assignment.toObject();
    if (!isMentor) {
      const submission = await AssignmentSubmission.findOne({
        assignment_id: assignmentId,
        student_id: userId,
      }).sort({ submitted_at: -1 });

      assignmentData.user_submission = submission;
    }

    res.status(200).json({
      success: true,
      data: assignmentData,
    });
  } catch (error) {
    console.error("Error getting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting assignment",
    });
  }
};

// Update assignment (Mentor only)
export const updateAssignment = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { assignmentId } = req.params;
    const updateData = req.body;

    console.log("Updating assignment:", { assignmentId, mentorId });

    // Find assignment and populate course
    const assignment = await Assignment.findById(assignmentId).populate("course_id", "title mentor_id");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Verify mentor ownership
    if (assignment.course_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this assignment",
      });
    }

    // Filter out chapter field since assignments are course-level now
    const { chapter, ...filteredUpdateData } = updateData;

    // Handle date and boolean conversions for FormData
    if (filteredUpdateData.publish_date !== undefined) {
      if (filteredUpdateData.publish_date && filteredUpdateData.publish_date !== "null" && filteredUpdateData.publish_date !== "undefined" && filteredUpdateData.publish_date.toString().trim() !== "") {
        const dateObj = new Date(filteredUpdateData.publish_date);
        if (!isNaN(dateObj.getTime())) {
          filteredUpdateData.publish_date = dateObj;
        } else {
          delete filteredUpdateData.publish_date;
        }
      } else {
        filteredUpdateData.publish_date = null;
      }
    }

    // Handle is_published boolean conversion
    if (filteredUpdateData.is_published !== undefined) {
      filteredUpdateData.is_published = filteredUpdateData.is_published === true || filteredUpdateData.is_published === "true";
    }

    // Handle question file upload if provided
    if (req.file) {
      try {
        console.log("Updating question file:", req.file.originalname);

        // Delete old question file if exists
        if (assignment.question_file && assignment.question_file.public_id) {
          try {
            await deleteFromCloudinary(assignment.question_file.public_id);
          } catch (deleteError) {
            console.error("Error deleting old question file:", deleteError);
          }
        }

        // Upload new question file
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: `assignments/${assignment.course_id._id}/questions`,
          public_id: `question_${Date.now()}`,
          resource_type: "auto",
        });

        filteredUpdateData.question_file = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          file_name: req.file.originalname,
          file_size: req.file.size,
          file_type: req.file.mimetype,
        };
      } catch (uploadError) {
        console.error("Question file upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload question file",
        });
      }
    }

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, { ...filteredUpdateData, chapter: "General", updated_at: new Date() }, { new: true, runValidators: true }).populate("course_id", "title mentor_id");

    res.status(200).json({
      success: true,
      data: updatedAssignment,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating assignment",
    });
  }
};

// Delete assignment (Mentor only)
export const deleteAssignment = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { assignmentId } = req.params;

    console.log("Deleting assignment:", { assignmentId, mentorId });

    // Find assignment and populate course
    const assignment = await Assignment.findById(assignmentId).populate("course_id", "title mentor_id");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Verify mentor ownership
    if (assignment.course_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this assignment",
      });
    }

    // Check if there are submissions for this assignment
    const submissionsCount = await AssignmentSubmission.countDocuments({ assignment_id: assignmentId });

    if (submissionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete assignment with ${submissionsCount} existing submissions`,
      });
    }

    // Delete assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting assignment",
    });
  }
};

// Reorder assignments (Mentor only)
export const reorderAssignments = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { courseId } = req.params;
    const { assignmentIds } = req.body; // Array of assignment IDs in new order

    console.log("Reordering assignments:", { courseId, mentorId, assignmentIds });

    // Verify course ownership
    const course = await courseModel.findOne({
      _id: courseId,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission",
      });
    }

    // Validate that all assignment IDs belong to this course
    const assignments = await Assignment.find({
      course_id: courseId,
      _id: { $in: assignmentIds },
    });

    if (assignments.length !== assignmentIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some assignment IDs are invalid or don't belong to this course",
      });
    }

    // Update the order field for each assignment
    const updatePromises = assignmentIds.map((assignmentId, index) => Assignment.findByIdAndUpdate(assignmentId, { order: index + 1, updated_at: new Date() }, { new: true }));

    await Promise.all(updatePromises);

    // Fetch updated assignments
    const updatedAssignments = await Assignment.find({ course_id: courseId }).sort({ order: 1, created_at: 1 });

    res.status(200).json({
      success: true,
      data: updatedAssignments,
      message: "Assignments reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering assignments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reordering assignments",
    });
  }
};
