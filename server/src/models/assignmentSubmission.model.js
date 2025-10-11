import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    // References
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment", // Reference to Assignment model
      required: [true, "Assignment ID is required"],
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    // Submission Details
    submission_type: {
      type: String,
      enum: ["text", "file", "url"],
      required: [true, "Submission type is required"],
    },

    // Content based on submission type
    content: {
      // For text submissions
      text_content: {
        type: String,
        maxlength: [5000, "Text content cannot exceed 5000 characters"],
      },

      // For file submissions (single file - backward compatibility)
      file_info: {
        public_id: String,
        url: String,
        file_name: String,
        file_extension: String,
        file_size: Number, // in bytes
        file_type: String, // MIME type
      },

      // For multiple file submissions
      files_info: [
        {
          public_id: String,
          url: String,
          file_name: String,
          file_extension: String,
          file_size: Number, // in bytes
          file_type: String, // MIME type
        },
      ],

      // For URL submissions
      url_submission: {
        type: String,
        validate: {
          validator: function (v) {
            if (this.submission_type === "url") {
              return /^https?:\/\/.+/.test(v);
            }
            return true;
          },
          message: "Please provide a valid URL",
        },
      },
    },

    // Submission Status & Grading
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "graded", "returned_for_revision"],
      default: "draft",
      index: true,
    },

    // Grading Information
    grading: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      max_points: {
        type: Number,
        default: 100,
      },

      letter_grade: {
        type: String,
        enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"],
        default: null,
      },

      passed: {
        type: Boolean,
        default: null,
      },

      // Feedback from mentor
      feedback: {
        type: String,
        maxlength: [1000, "Feedback cannot exceed 1000 characters"],
        default: "",
      },

      // Private notes for mentor
      private_notes: {
        type: String,
        maxlength: [500, "Private notes cannot exceed 500 characters"],
        default: "",
      },

      // Graded by
      graded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      graded_at: {
        type: Date,
        default: null,
      },
    },

    // Submission Metadata
    attempt_number: {
      type: Number,
      default: 1,
      min: 1,
    },

    is_late: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    submitted_at: {
      type: Date,
      default: null,
    },

    // Revision History
    revisions: [
      {
        revision_number: {
          type: Number,
          required: true,
        },
        content: {
          text_content: String,
          file_info: {
            public_id: String,
            url: String,
            file_name: String,
            file_extension: String,
            file_size: Number,
            file_type: String,
          },
          url_submission: String,
        },
        submitted_at: {
          type: Date,
          default: Date.now,
        },
        feedback_addressed: String,
      },
    ],

    // Timestamps
    created_at: {
      type: Date,
      default: Date.now,
    },

    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using manual timestamps
  }
);

// Indexes for performance
assignmentSubmissionSchema.index({ assignment_id: 1 });
assignmentSubmissionSchema.index({ student_id: 1 });
assignmentSubmissionSchema.index({ course_id: 1 });
// status index already created by index: true in schema
assignmentSubmissionSchema.index({ student_id: 1, assignment_id: 1 });

// Compound index for mentor grading view
assignmentSubmissionSchema.index({
  course_id: 1,
  status: 1,
  submitted_at: -1,
});

// Compound index for student submissions
assignmentSubmissionSchema.index({
  student_id: 1,
  course_id: 1,
  submitted_at: -1,
});

// Pre-save middleware
assignmentSubmissionSchema.pre("save", function (next) {
  this.updated_at = new Date();

  // Set submitted_at when status changes to submitted
  if (this.status === "submitted" && !this.submitted_at) {
    this.submitted_at = new Date();
    // Late submission logic removed (no deadline system)
  }

  // Auto-calculate letter grade based on score
  if (this.grading.score !== null && this.grading.score !== undefined) {
    const score = this.grading.score;
    if (score >= 97) this.grading.letter_grade = "A+";
    else if (score >= 93) this.grading.letter_grade = "A";
    else if (score >= 90) this.grading.letter_grade = "A-";
    else if (score >= 87) this.grading.letter_grade = "B+";
    else if (score >= 83) this.grading.letter_grade = "B";
    else if (score >= 80) this.grading.letter_grade = "B-";
    else if (score >= 77) this.grading.letter_grade = "C+";
    else if (score >= 73) this.grading.letter_grade = "C";
    else if (score >= 70) this.grading.letter_grade = "C-";
    else if (score >= 60) this.grading.letter_grade = "D";
    else this.grading.letter_grade = "F";

    // Determine if passed (usually 70% or above)
    this.grading.passed = score >= 70;
  }

  next();
});

// Instance methods
assignmentSubmissionSchema.methods.submit = function () {
  if (this.status === "draft") {
    this.status = "submitted";
    this.submitted_at = new Date();

    // Late submission logic removed (no deadline system)
  }
  return this.save();
};

assignmentSubmissionSchema.methods.grade = function (gradingData, gradedBy) {
  const { score, feedback, privateNotes } = gradingData;

  this.grading.score = score;
  this.grading.feedback = feedback || "";
  this.grading.private_notes = privateNotes || "";
  this.grading.graded_by = gradedBy;
  this.grading.graded_at = new Date();
  this.status = "graded";

  return this.save();
};

assignmentSubmissionSchema.methods.returnForRevision = function (feedback) {
  this.status = "returned_for_revision";
  this.grading.feedback = feedback;
  return this.save();
};

assignmentSubmissionSchema.methods.addRevision = function (content) {
  const revisionNumber = this.revisions.length + 1;

  this.revisions.push({
    revision_number: revisionNumber,
    content,
  });

  // Reset status to submitted for re-grading
  this.status = "submitted";
  this.submitted_at = new Date();

  return this.save();
};

// Static methods
assignmentSubmissionSchema.statics.getSubmissionsByAssignment = function (assignmentId, options = {}) {
  const { status, limit = 50, page = 1 } = options;

  const filter = { assignment_id: assignmentId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  return this.find(filter).populate("student_id", "fullname username avatar email").populate("grading.graded_by", "fullname username").sort({ submitted_at: -1 }).limit(limit).skip(skip);
};

assignmentSubmissionSchema.statics.getStudentSubmissions = function (studentId, courseId = null) {
  const filter = { student_id: studentId };
  if (courseId) filter.course_id = courseId;

  return this.find(filter).populate("assignment_id", "title description max_points").populate("course_id", "title").sort({ created_at: -1 });
};

assignmentSubmissionSchema.statics.getGradingQueue = function (mentorId, courseId) {
  return this.find({
    course_id: courseId,
    status: { $in: ["submitted", "under_review"] },
  })
    .populate("assignment_id", "title description")
    .populate("student_id", "fullname username avatar")
    .sort({ submitted_at: 1 }); // Oldest first
};

assignmentSubmissionSchema.statics.getAssignmentStats = function (assignmentId) {
  return this.aggregate([
    { $match: { assignment_id: new mongoose.Types.ObjectId(assignmentId) } },
    {
      $group: {
        _id: "$assignment_id",
        total_submissions: { $sum: 1 },
        submitted_count: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
        graded_count: {
          $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] },
        },
        average_score: { $avg: "$grading.score" },
        late_submissions: {
          $sum: { $cond: ["$is_late", 1, 0] },
        },
        pass_rate: {
          $avg: { $cond: ["$grading.passed", 1, 0] },
        },
      },
    },
    {
      $project: {
        assignment_id: "$_id",
        total_submissions: 1,
        submitted_count: 1,
        graded_count: 1,
        pending_grading: { $subtract: ["$submitted_count", "$graded_count"] },
        average_score: { $round: ["$average_score", 2] },
        late_submissions: 1,
        pass_rate: { $round: [{ $multiply: ["$pass_rate", 100] }, 2] },
      },
    },
  ]);
};

// Virtual for formatted score
assignmentSubmissionSchema.virtual("formatted_score").get(function () {
  if (this.grading.score === null) return "Not graded";
  return `${this.grading.score}/${this.grading.max_points} (${this.grading.letter_grade})`;
});

// Virtual for submission status badge
assignmentSubmissionSchema.virtual("status_badge").get(function () {
  const badges = {
    draft: "📝 Draft",
    submitted: "✅ Submitted",
    under_review: "👀 Under Review",
    graded: "⭐ Graded",
    returned_for_revision: "🔄 Needs Revision",
  };
  return badges[this.status] || this.status;
});

// Virtual for late status
assignmentSubmissionSchema.virtual("late_status").get(function () {
  if (this.is_late) return "⏰ Late Submission";
  // Deadline system removed
  return "";
});

// Ensure virtual fields are serialized
assignmentSubmissionSchema.set("toJSON", { virtuals: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

export default AssignmentSubmission;
