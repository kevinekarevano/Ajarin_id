import AssignmentSubmission from "../models/assignmentSubmission.model.js";
import Assignment from "../models/assignment.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import MaterialProgress from "../models/materialProgress.model.js";

// =================== MENTOR FUNCTIONS ===================

// Create Assignment (Mentor only)
export const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mentorId = req.user.userId;
    const { title, description, instructions } = req.body;
    const questionFile = req.file; // Optional file for assignment question

    // Verify mentor owns this course
    const course = await courseModel.findOne({
      _id: courseId,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You can only create assignments for your own courses",
      });
    }

    // Handle question file upload if provided
    let questionFileData = null;
    if (questionFile) {
      try {
        const folderPath = "ajarin/assignments/questions";
        const fileExtension = questionFile.originalname.split(".").pop().toLowerCase();
        const uniqueFileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.${fileExtension}`;

        const cloudinaryResult = await uploadToCloudinary(questionFile.buffer, {
          folder: folderPath,
          resource_type: "raw",
          public_id: `${folderPath}/${uniqueFileName}`,
          use_filename: true,
          unique_filename: false,
        });

        questionFileData = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
          file_name: questionFile.originalname,
          file_size: questionFile.size,
          file_type: questionFile.mimetype,
        };
      } catch (uploadError) {
        console.error("Question file upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload question file",
        });
      }
    }

    // Get the next order number
    const lastAssignment = await Assignment.findOne({ course_id: courseId }).sort({ order: -1 }).select("order");
    const nextOrder = lastAssignment ? lastAssignment.order + 1 : 1;

    // Create assignment
    const assignment = new Assignment({
      course_id: courseId,
      mentor_id: mentorId,
      title,
      description,
      instructions,
      question_file: questionFileData,
      order: nextOrder,
      is_published: true,
      publish_date: new Date(),
    });

    await assignment.save();

    // Populate assignment data
    const populatedAssignment = await Assignment.findById(assignment._id).populate("course_id", "title").populate("mentor_id", "fullname username");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating assignment",
    });
  }
};

// Update Assignment (Mentor only)
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const mentorId = req.user.userId;
    const { title, description, instructions } = req.body;
    const questionFile = req.file;

    // Find assignment and verify ownership
    const assignment = await Assignment.findById(assignmentId).populate("course_id");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own assignments",
      });
    }

    // Handle question file upload if provided
    if (questionFile) {
      try {
        // Delete old file if exists
        if (assignment.question_file?.public_id) {
          await deleteFromCloudinary(assignment.question_file.public_id);
        }

        const folderPath = "ajarin/assignments/questions";
        const fileExtension = questionFile.originalname.split(".").pop().toLowerCase();
        const uniqueFileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.${fileExtension}`;

        const cloudinaryResult = await uploadToCloudinary(questionFile.buffer, {
          folder: folderPath,
          resource_type: "raw",
          public_id: `${folderPath}/${uniqueFileName}`,
          use_filename: true,
          unique_filename: false,
        });

        assignment.question_file = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
          file_name: questionFile.originalname,
          file_size: questionFile.size,
          file_type: questionFile.mimetype,
        };
      } catch (uploadError) {
        console.error("Question file upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload question file",
        });
      }
    }

    // Update assignment
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.instructions = instructions || assignment.instructions;

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id).populate("course_id", "title").populate("mentor_id", "fullname username");

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating assignment",
    });
  }
};

// Delete Assignment (Mentor only)
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const mentorId = req.user.userId;

    // Find assignment and verify ownership
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own assignments",
      });
    }

    // Delete question file from cloudinary if exists
    if (assignment.question_file?.public_id) {
      try {
        await deleteFromCloudinary(assignment.question_file.public_id);
      } catch (deleteError) {
        console.error("Error deleting question file:", deleteError);
      }
    }

    // Delete all submissions for this assignment
    const submissions = await AssignmentSubmission.find({ assignment_id: assignmentId });
    for (const submission of submissions) {
      // Delete submission files from cloudinary
      if (submission.content?.files_info) {
        for (const file of submission.content.files_info) {
          if (file.public_id) {
            try {
              await deleteFromCloudinary(file.public_id);
            } catch (deleteError) {
              console.error("Error deleting submission file:", deleteError);
            }
          }
        }
      }
    }

    // Delete submissions
    await AssignmentSubmission.deleteMany({ assignment_id: assignmentId });

    // Delete assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      success: true,
      message: "Assignment and all related submissions deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting assignment",
    });
  }
};

// Get assignments for a course (Mentor view)
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is mentor or enrolled student
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isMentor = course.mentor_id.toString() === userId;
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
        message: "You need to be enrolled in this course or be the mentor",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assignments = await Assignment.find({ course_id: courseId }).populate("mentor_id", "fullname username").sort({ order: 1 }).limit(parseInt(limit)).skip(skip);

    const totalAssignments = await Assignment.countDocuments({ course_id: courseId });
    const totalPages = Math.ceil(totalAssignments / parseInt(limit));

    // If student, add submission status for each assignment
    if (!isMentor) {
      const assignmentIds = assignments.map((a) => a._id);
      const submissions = await AssignmentSubmission.find({
        assignment_id: { $in: assignmentIds },
        student_id: userId,
      }).select("assignment_id status grading");

      const submissionMap = {};
      submissions.forEach((sub) => {
        submissionMap[sub.assignment_id.toString()] = {
          status: sub.status,
          score: sub.grading?.score || null,
          graded: sub.status === "graded",
        };
      });

      assignments.forEach((assignment) => {
        assignment._doc.submission_status = submissionMap[assignment._id.toString()] || {
          status: "not_submitted",
          score: null,
          graded: false,
        };
      });
    }

    res.status(200).json({
      success: true,
      data: {
        assignments,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_assignments: totalAssignments,
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assignments",
    });
  }
};

// Get assignment submissions (Mentor only)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const mentorId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    // Verify mentor owns this assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You can only view submissions for your own assignments",
      });
    }

    const filter = { assignment_id: assignmentId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await AssignmentSubmission.find(filter)
      .populate("assignment_id", "title max_points")
      .populate("student_id", "fullname username email avatar")
      .populate("grading.graded_by", "fullname username")
      .sort({ submitted_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalSubmissions = await AssignmentSubmission.countDocuments(filter);
    const totalPages = Math.ceil(totalSubmissions / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        submissions,
        assignment,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_submissions: totalSubmissions,
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
    });
  }
};

// Grade assignment submission (Mentor only)
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const mentorId = req.user.userId;
    const { score, comments, letter_grade } = req.body;

    // Find submission and verify mentor ownership
    const submission = await AssignmentSubmission.findById(submissionId).populate("assignment_id").populate("student_id", "fullname username email");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.assignment_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You can only grade submissions for your own assignments",
      });
    }

    // Update grading
    submission.grading = {
      score: parseInt(score),
      max_points: submission.assignment_id.max_points || 100,
      letter_grade: letter_grade || null,
      comments: comments || "",
      graded_by: mentorId,
      graded_at: new Date(),
    };

    submission.status = "graded";
    await submission.save();

    const populatedSubmission = await AssignmentSubmission.findById(submission._id).populate("assignment_id", "title max_points").populate("student_id", "fullname username email").populate("grading.graded_by", "fullname username");

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: { submission: populatedSubmission },
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while grading submission",
    });
  }
};

// =================== STUDENT FUNCTIONS ===================

// Submit assignment (Student only)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;
    const { textContent } = req.body;
    const files = req.files || [];

    console.log("Assignment submission:", { assignmentId, studentId, hasFiles: files.length > 0, hasText: !!textContent });

    // Validate assignment exists
    const assignment = await Assignment.findById(assignmentId).populate("course_id");
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if student is enrolled
    const enrollment = await enrollmentModel.findOne({
      learner_id: studentId,
      course_id: assignment.course_id._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to submit assignments",
      });
    }

    // Student must provide either text content OR files (or both)
    const hasText = textContent && textContent.trim().length > 0;
    const hasFiles = files && files.length > 0;

    if (!hasText && !hasFiles) {
      return res.status(400).json({
        success: false,
        message: "Please provide either text content or file(s) for your submission",
      });
    }

    // Check if there's already a submission (revision)
    let existingSubmission = await AssignmentSubmission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    });

    let content = {};
    let submissionType = "text"; // Default to text

    // Process text content if provided
    if (hasText) {
      content.text_content = textContent.trim();
      submissionType = "text";
    }

    // Process files if provided
    if (hasFiles) {
      submissionType = hasText ? "file" : "file"; // If both text and files, prioritize file type

      const uploadedFiles = [];

      for (const file of files) {
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} size cannot exceed 50MB`,
          });
        }

        // Validate file type (PDF, images, documents)
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "doc", "docx", "txt"];

        if (!allowedExtensions.includes(fileExtension)) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname}: Only PDF, images, and document files are allowed`,
          });
        }

        try {
          // Upload to Cloudinary
          const folderPath = "ajarin/assignments/submissions";
          const uniqueFileName = `${file.originalname.replace(/\.[^/.]+$/, "")}-${Date.now()}.${fileExtension}`;

          const cloudinaryResult = await uploadToCloudinary(file.buffer, {
            folder: folderPath,
            resource_type: "raw",
            public_id: `${folderPath}/${uniqueFileName}`,
            use_filename: true,
            unique_filename: false,
          });

          uploadedFiles.push({
            public_id: cloudinaryResult.public_id,
            url: cloudinaryResult.url,
            file_name: file.originalname,
            file_extension: fileExtension,
            file_size: file.size,
            file_type: file.mimetype,
          });
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: `Failed to upload file ${file.originalname}`,
          });
        }
      }

      content.files_info = uploadedFiles;
    }

    let submission;

    if (existingSubmission) {
      // This is a revision - delete old files if they exist
      if (existingSubmission.content?.files_info) {
        for (const file of existingSubmission.content.files_info) {
          if (file.public_id) {
            try {
              await deleteFromCloudinary(file.public_id);
            } catch (deleteError) {
              console.error("Error deleting old file:", deleteError);
            }
          }
        }
      }

      // Update existing submission
      existingSubmission.content = content;
      existingSubmission.submission_type = submissionType;
      existingSubmission.status = "submitted";
      existingSubmission.submitted_at = new Date();
      existingSubmission.grading = undefined; // Reset grading

      await existingSubmission.save();
      submission = existingSubmission;
    } else {
      // New submission
      submission = new AssignmentSubmission({
        assignment_id: assignmentId,
        student_id: studentId,
        course_id: assignment.course_id._id,
        submission_type: submissionType,
        content,
        status: "submitted",
        submitted_at: new Date(),
      });

      await submission.save();
    }

    // Update material progress
    try {
      const progress = await MaterialProgress.getOrCreate(studentId, assignmentId, assignment.course_id._id);
      await progress.updateProgress({ percentage: 100 });
    } catch (progressError) {
      console.error("Progress update error:", progressError);
      // Don't fail the submission if progress update fails
    }

    // Populate submission details
    const populatedSubmission = await AssignmentSubmission.findById(submission._id).populate("assignment_id", "title description max_points").populate("course_id", "title");

    res.status(200).json({
      success: true,
      message: existingSubmission ? "Assignment resubmitted successfully" : "Assignment submitted successfully",
      data: { submission: populatedSubmission },
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting assignment",
    });
  }
};

// Get student's own submissions
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    const filter = { student_id: studentId };
    if (courseId) filter.course_id = courseId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await AssignmentSubmission.find(filter)
      .populate("assignment_id", "title description max_points")
      .populate("course_id", "title")
      .populate("grading.graded_by", "fullname username")
      .sort({ submitted_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalSubmissions = await AssignmentSubmission.countDocuments(filter);
    const totalPages = Math.ceil(totalSubmissions / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_submissions: totalSubmissions,
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
    });
  }
};

// Get single submission details
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.userId;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("assignment_id", "title description max_points mentor_id")
      .populate("course_id", "title mentor_id")
      .populate("student_id", "fullname username avatar")
      .populate("grading.graded_by", "fullname username");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if user is student who made submission or mentor who owns assignment
    const isStudent = submission.student_id._id.toString() === userId;
    const isMentor = submission.assignment_id.mentor_id.toString() === userId;

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own submissions or submissions for assignments you created",
      });
    }

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (error) {
    console.error("Get submission details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submission details",
    });
  }
};
