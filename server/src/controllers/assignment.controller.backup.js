import AssignmentSubmission from "../models/assignmentSubmission.model.js";
import Assignment from "../models/assignment.model.js";
import materialModel from "../models/material.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import MaterialProgress from "../models/materialProgress.model.js";

// Submit assignment (Student)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;
    const { submissionType, textContent, urlSubmission } = req.body;
    const files = req.files || [];

    console.log("Assignment submission:", { assignmentId, studentId, submissionType, hasFiles: files.length > 0 });

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

    // Validate submission type matches requirements
    const allowedTypes = assignment.assignment_data?.submission_type ? [assignment.assignment_data.submission_type] : ["text", "file", "url"];
    if (!allowedTypes.includes(submissionType)) {
      return res.status(400).json({
        success: false,
        message: `This assignment only accepts ${allowedTypes.join(", ")} submissions`,
      });
    }

    // Check if there's already a submission (might be a revision)
    let existingSubmission = await AssignmentSubmission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    });

    let submission;
    let content = {};

    // Handle different submission types
    if (submissionType === "text") {
      if (!textContent || textContent.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Text content is required for text submissions",
        });
      }
      content.text_content = textContent.trim();
    } else if (submissionType === "file") {
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one file is required for file submissions",
        });
      }

      // Validate file size and type for all files
      const maxFileSize = assignment.assignment_data?.max_file_size || 10; // MB
      const allowedExtensions = assignment.assignment_data?.allowed_extensions || [];

      const uploadedFiles = [];

      for (const file of files) {
        if (file.size > maxFileSize * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} size cannot exceed ${maxFileSize}MB`,
          });
        }

        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname}: Only ${allowedExtensions.join(", ")} files are allowed`,
          });
        }

        try {
          // Upload to Cloudinary
          const folderPath = "ajarin/assignments";
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
    } else if (submissionType === "url") {
      if (!urlSubmission || !/^https?:\/\/.+/.test(urlSubmission)) {
        return res.status(400).json({
          success: false,
          message: "Valid URL is required for URL submissions",
        });
      }
      content.url_submission = urlSubmission;
    }

    if (existingSubmission) {
      // This is a revision
      await existingSubmission.addRevision(content);
      submission = existingSubmission;
    } else {
      // New submission
      const attemptNumber =
        (await AssignmentSubmission.countDocuments({
          assignment_id: assignmentId,
          student_id: studentId,
        })) + 1;

      submission = new AssignmentSubmission({
        assignment_id: assignmentId,
        student_id: studentId,
        course_id: assignment.course_id._id,
        submission_type: submissionType,
        content,
        attempt_number: attemptNumber,
        status: "submitted",
      });

      await submission.save();
    }

    // Update material progress
    const progress = await MaterialProgress.getOrCreate(studentId, assignmentId, assignment.course_id._id);
    await progress.updateProgress({ percentage: 100 }); // Assignment submitted = 100% progress

    // Populate submission details
    const populatedSubmission = await AssignmentSubmission.findById(submission._id).populate("assignment_id", "title description assignment_data").populate("course_id", "title");

    res.status(200).json({
      success: true,
      message: existingSubmission ? "Assignment revision submitted successfully" : "Assignment submitted successfully",
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

// Get student's submissions
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    const filter = { student_id: studentId };
    if (courseId) filter.course_id = courseId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await AssignmentSubmission.find(filter)
      .populate("assignment_id", "title description assignment_data")
      .populate("course_id", "title")
      .populate("grading.graded_by", "fullname username")
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalSubmissions = await AssignmentSubmission.countDocuments(filter);
    const totalPages = Math.ceil(totalSubmissions / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubmissions,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
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
export const getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.userId;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("assignment_id", "title description assignment_data")
      .populate("course_id", "title mentor_id")
      .populate("student_id", "fullname username avatar")
      .populate("grading.graded_by", "fullname username");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check access permissions
    const isStudent = submission.student_id._id.toString() === userId;
    const isMentor = submission.course_id.mentor_id.toString() === userId;

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this submission",
      });
    }

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submission",
    });
  }
};

// Grade assignment (Mentor)
export const gradeAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const mentorId = req.user.userId;
    const { score, feedback, privateNotes } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    const submission = await AssignmentSubmission.findById(submissionId).populate("course_id", "mentor_id").populate("assignment_id student_id");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if user is the mentor of this course
    if (submission.course_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to grade this submission",
      });
    }

    // Grade the submission
    await submission.grade(
      {
        score: parseFloat(score),
        feedback: feedback || "",
        privateNotes: privateNotes || "",
      },
      mentorId
    );

    // Update material progress if assignment passed
    if (submission.grading.passed) {
      const progress = await MaterialProgress.getOrCreate(submission.student_id._id, submission.assignment_id._id, submission.course_id._id);
      await progress.updateProgress({ percentage: 100 });
    }

    const gradedSubmission = await AssignmentSubmission.findById(submissionId).populate("assignment_id", "title").populate("student_id", "fullname username email").populate("grading.graded_by", "fullname username");

    res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: { submission: gradedSubmission },
    });
  } catch (error) {
    console.error("Grade assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while grading assignment",
    });
  }
};

// Return assignment for revision (Mentor)
export const returnForRevision = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const mentorId = req.user.userId;
    const { feedback } = req.body;

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required when returning for revision",
      });
    }

    const submission = await AssignmentSubmission.findById(submissionId).populate("course_id", "mentor_id");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.course_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this submission",
      });
    }

    await submission.returnForRevision(feedback.trim());

    res.status(200).json({
      success: true,
      message: "Assignment returned for revision",
      data: { submission },
    });
  } catch (error) {
    console.error("Return for revision error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while returning assignment",
    });
  }
};

// Get submissions for grading (Mentor)
export const getSubmissionsForGrading = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { courseId, assignmentId, status = "submitted", page = 1, limit = 20 } = req.query;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Verify mentor owns the course
    const course = await courseModel.findById(courseId);
    if (!course || course.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this course",
      });
    }

    const filter = { course_id: courseId };
    if (assignmentId) filter.assignment_id = assignmentId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await AssignmentSubmission.find(filter)
      .populate("assignment_id", "title description assignment_data")
      .populate("student_id", "fullname username avatar email")
      .sort({ submitted_at: 1 }) // Oldest first
      .limit(parseInt(limit))
      .skip(skip);

    const totalSubmissions = await AssignmentSubmission.countDocuments(filter);
    const totalPages = Math.ceil(totalSubmissions / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubmissions,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get submissions for grading error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
    });
  }
};

// Get assignment statistics (Mentor)
export const getAssignmentStats = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const mentorId = req.user.userId;

    // Verify assignment exists and mentor owns it
    const assignment = await materialModel.findById(assignmentId).populate("course_id");
    if (!assignment || assignment.type !== "assignment") {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.course_id.mentor_id.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this assignment",
      });
    }

    const stats = await AssignmentSubmission.getAssignmentStats(assignmentId);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          assignment_id: assignmentId,
          total_submissions: 0,
          submitted_count: 0,
          graded_count: 0,
          pending_grading: 0,
          average_score: 0,
          late_submissions: 0,
          pass_rate: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get assignment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assignment statistics",
    });
  }
};

// Get user's submission for an assignment (Student)
export const getUserSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;

    console.log("Getting user submission:", { assignmentId, studentId });

    // First verify the assignment exists and get course info
    const assignment = await Assignment.findById(assignmentId).populate("course_id");
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
        data: { submission: null },
      });
    }

    // Check if student is enrolled in the course
    const enrollment = await enrollmentModel.findOne({
      learner_id: studentId,
      course_id: assignment.course_id._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You need to be enrolled in this course to view submissions",
        data: { submission: null },
      });
    }

    // Find the user's submission for this assignment
    const submission = await AssignmentSubmission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    })
      .populate("assignment_id", "title max_points assignment_type max_attempts")
      .populate("student_id", "username email")
      .sort({ submitted_at: -1 }); // Get latest submission

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this assignment",
        data: { submission: null },
      });
    }

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (error) {
    console.error("Get user submission error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submission",
    });
  }
};
