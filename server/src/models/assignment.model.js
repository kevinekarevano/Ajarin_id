import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    instructions: {
      type: String, // Detailed instructions for the assignment
    },
    chapter: {
      type: String,
      default: "General", // All assignments are general course-level
    },
    // Removed assignment_type - students can submit text or files or both
    // Simplified: no specific type restrictions
    max_points: {
      type: Number,
      default: 100,
    },
    max_attempts: {
      type: Number,
      default: 1,
    },
    auto_grading: {
      type: Boolean,
      default: false,
    },
    // Question file for mentors to upload assignment questions
    question_file: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
      file_name: {
        type: String,
        default: null,
      },
      file_size: {
        type: Number,
        default: 0,
      },
      file_type: {
        type: String,
        default: null,
      },
    },
    grading_rubric: [
      {
        criteria: String,
        max_points: Number,
        description: String,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    is_published: {
      type: Boolean,
      default: false,
    },
    publish_date: {
      type: Date,
    },
    // Statistics
    total_submissions: {
      type: Number,
      default: 0,
    },
    total_graded: {
      type: Number,
      default: 0,
    },
    average_score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
assignmentSchema.index({ course_id: 1, order: 1 });
assignmentSchema.index({ mentor_id: 1 });

assignmentSchema.index({ is_published: 1, publish_date: 1 });

// Virtual for submissions
assignmentSchema.virtual("submissions", {
  ref: "AssignmentSubmission",
  localField: "_id",
  foreignField: "assignment_id",
});

// Methods

assignmentSchema.methods.canSubmit = function () {
  if (!this.is_published) return false;
  if (this.publish_date && new Date() < this.publish_date) return false;
  return true;
};

// Static methods
assignmentSchema.statics.getNextOrder = async function (courseId, chapter = "General") {
  const lastAssignment = await this.findOne({
    course_id: courseId,
    chapter,
  }).sort({ order: -1 });

  return lastAssignment ? lastAssignment.order + 1 : 1;
};

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
