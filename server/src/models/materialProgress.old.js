import mongoose from "mongoose";

const materialProgressSchema = new mongoose.Schema(
  {
    // References
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "Material ID is required"],
    },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    // Simple Progress Status
    is_completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Timestamps
    started_at: {
      type: Date,
      default: null,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    // Video/Content specific tracking
    last_position: {
      type: Number, // For videos: seconds, for documents: page/scroll position
      default: 0,
    },

    // Quiz/Assignment specific
    quiz_attempts: [
      {
        attempt_date: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        answers: [
          {
            question_index: Number,
            selected_option: Number,
            is_correct: Boolean,
            time_taken: Number, // seconds
          },
        ],
        time_taken_minutes: Number,
        passed: Boolean,
      },
    ],

    assignment_submission: {
      submitted_at: Date,
      submission_type: {
        type: String,
        enum: ["file", "text", "url"],
      },
      submission_content: String, // File URL, text content, or URL
      file_info: {
        public_id: String,
        url: String,
        file_name: String,
        file_size: Number,
      },
      grade: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      graded_at: Date,
      graded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Interaction tracking
    bookmarks: [
      {
        position: Number,
        note: String,
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    notes: {
      type: String,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },

    // Timestamps
    started_at: {
      type: Date,
      default: null,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    last_accessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
materialProgressSchema.index({ enrollment_id: 1 });
materialProgressSchema.index({ material_id: 1 });
materialProgressSchema.index({ learner_id: 1 });
materialProgressSchema.index({ course_id: 1 });
materialProgressSchema.index({ status: 1 });
materialProgressSchema.index({ learner_id: 1, course_id: 1 });
materialProgressSchema.index({ learner_id: 1, material_id: 1 }, { unique: true });

// Pre-save middleware to handle status changes
materialProgressSchema.pre("save", function (next) {
  // Set started_at when first accessed
  if (this.isModified("status") && this.status !== "not_started" && !this.started_at) {
    this.started_at = new Date();
  }

  // Set completed_at when completed
  if (this.isModified("status") && this.status === "completed" && !this.completed_at) {
    this.completed_at = new Date();
  }

  // Auto-complete based on progress percentage
  if (this.isModified("progress_percentage") && this.progress_percentage >= 100 && this.status !== "completed") {
    this.status = "completed";
    this.completed_at = new Date();
  }

  // Update last_accessed
  this.last_accessed = new Date();

  next();
});

// Instance methods
materialProgressSchema.methods.markAsStarted = function () {
  if (this.status === "not_started") {
    this.status = "in_progress";
    this.started_at = new Date();
  }
  this.last_accessed = new Date();
  return this.save();
};

materialProgressSchema.methods.markAsCompleted = function () {
  this.status = "completed";
  this.progress_percentage = 100;
  this.completed_at = new Date();
  this.last_accessed = new Date();
  return this.save();
};

materialProgressSchema.methods.updateProgress = function (percentage, timeSpent = 0) {
  this.progress_percentage = Math.min(100, Math.max(0, percentage));

  if (timeSpent > 0) {
    this.time_spent_minutes += timeSpent;
  }

  // Update status based on progress
  if (this.progress_percentage > 0 && this.status === "not_started") {
    this.status = "in_progress";
    this.started_at = new Date();
  }

  if (this.progress_percentage >= 100) {
    this.status = "completed";
    this.completed_at = new Date();
  }

  this.last_accessed = new Date();
  return this.save();
};

materialProgressSchema.methods.addQuizAttempt = function (score, answers, timeTaken, passed) {
  this.quiz_attempts.push({
    score,
    answers,
    time_taken_minutes: timeTaken,
    passed,
  });

  // Update overall progress based on best score
  const bestScore = Math.max(...this.quiz_attempts.map((attempt) => attempt.score));
  this.progress_percentage = bestScore;

  if (passed) {
    this.status = "completed";
    this.completed_at = new Date();
  }

  this.last_accessed = new Date();
  return this.save();
};

materialProgressSchema.methods.submitAssignment = function (submissionData) {
  this.assignment_submission = {
    submitted_at: new Date(),
    ...submissionData,
  };

  this.status = "completed"; // Assignment submission counts as completion
  this.progress_percentage = 100;
  this.completed_at = new Date();
  this.last_accessed = new Date();

  return this.save();
};

// Static methods
materialProgressSchema.statics.findLearnerProgress = function (learnerId, courseId) {
  return this.find({ learner_id: learnerId, course_id: courseId }).populate("material_id", "title type order chapter duration_minutes").sort({ "material_id.chapter": 1, "material_id.order": 1 });
};

materialProgressSchema.statics.calculateCourseProgress = function (learnerId, courseId) {
  return this.aggregate([
    {
      $match: {
        learner_id: new mongoose.Types.ObjectId(learnerId),
        course_id: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: null,
        totalMaterials: { $sum: 1 },
        completedMaterials: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        averageProgress: { $avg: "$progress_percentage" },
        totalTimeSpent: { $sum: "$time_spent_minutes" },
      },
    },
    {
      $project: {
        totalMaterials: 1,
        completedMaterials: 1,
        averageProgress: { $round: ["$averageProgress", 2] },
        totalTimeSpent: 1,
        completionRate: {
          $round: [{ $multiply: [{ $divide: ["$completedMaterials", "$totalMaterials"] }, 100] }, 2],
        },
      },
    },
  ]);
};

materialProgressSchema.statics.getMaterialStats = function (materialId) {
  return this.aggregate([
    { $match: { material_id: new mongoose.Types.ObjectId(materialId) } },
    {
      $group: {
        _id: null,
        totalLearners: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        averageProgress: { $avg: "$progress_percentage" },
        averageTimeSpent: { $avg: "$time_spent_minutes" },
      },
    },
  ]);
};

// Virtual for time spent formatting
materialProgressSchema.virtual("formatted_time_spent").get(function () {
  if (this.time_spent_minutes === 0) return "0m";

  const hours = Math.floor(this.time_spent_minutes / 60);
  const mins = this.time_spent_minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
});

// Virtual for best quiz score
materialProgressSchema.virtual("best_quiz_score").get(function () {
  if (!this.quiz_attempts || this.quiz_attempts.length === 0) return null;
  return Math.max(...this.quiz_attempts.map((attempt) => attempt.score));
});

// Ensure virtual fields are serialized
materialProgressSchema.set("toJSON", { virtuals: true });

const materialProgressModel = mongoose.model("MaterialProgress", materialProgressSchema);

export default materialProgressModel;
