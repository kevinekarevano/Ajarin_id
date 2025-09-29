import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    // References
    learner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Learner ID is required"],
    },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mentor ID is required"],
    },

    // Enrollment Status
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },

    // Progress Tracking
    progress_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completed_materials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material", // Will be created later
      },
    ],

    last_accessed: {
      type: Date,
      default: Date.now,
    },

    // Timestamps
    enrolled_at: {
      type: Date,
      default: Date.now,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    // Certificate
    certificate_issued: {
      type: Boolean,
      default: false,
    },

    certificate_url: {
      type: String,
      default: null,
    },

    // Learning Analytics
    total_time_spent: {
      type: Number, // in minutes
      default: 0,
    },

    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for performance
enrollmentSchema.index({ learner_id: 1 });
enrollmentSchema.index({ course_id: 1 });
enrollmentSchema.index({ mentor_id: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolled_at: -1 });

// Compound indexes
enrollmentSchema.index({ learner_id: 1, course_id: 1 }, { unique: true }); // Prevent duplicate enrollment
enrollmentSchema.index({ course_id: 1, status: 1 });
enrollmentSchema.index({ learner_id: 1, status: 1 });

// Pre-save middleware to update completed_at when status changes to completed
enrollmentSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "completed" && !this.completed_at) {
    this.completed_at = new Date();
  }

  // Auto-complete when progress reaches 100%
  if (this.isModified("progress_percentage") && this.progress_percentage >= 100 && this.status === "active") {
    this.status = "completed";
    this.completed_at = new Date();
  }

  next();
});

// Instance methods
enrollmentSchema.methods.updateProgress = function (percentage) {
  this.progress_percentage = Math.min(100, Math.max(0, percentage));
  this.last_accessed = new Date();
  return this.save();
};

enrollmentSchema.methods.markMaterialCompleted = function (materialId) {
  if (!this.completed_materials.includes(materialId)) {
    this.completed_materials.push(materialId);
    this.last_accessed = new Date();
  }
  return this.save();
};

enrollmentSchema.methods.addLearningTime = function (minutes) {
  this.total_time_spent += minutes;
  this.last_accessed = new Date();
  return this.save();
};

// Static methods
enrollmentSchema.statics.findByLearner = function (learnerId, options = {}) {
  return this.find({ learner_id: learnerId, ...options })
    .populate("course_id", "title slug description category cover_url status rating total_duration_minutes")
    .populate("mentor_id", "fullname username avatar")
    .sort({ enrolled_at: -1 });
};

enrollmentSchema.statics.findByCourse = function (courseId, options = {}) {
  return this.find({ course_id: courseId, ...options })
    .populate("learner_id", "fullname username avatar")
    .sort({ enrolled_at: -1 });
};

enrollmentSchema.statics.getEnrollmentStats = function (courseId) {
  return this.aggregate([
    { $match: { course_id: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgProgress: { $avg: "$progress_percentage" },
      },
    },
  ]);
};

enrollmentSchema.statics.getLearnerStats = function (learnerId) {
  return this.aggregate([
    { $match: { learner_id: new mongoose.Types.ObjectId(learnerId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedCourses: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        totalLearningTime: { $sum: "$total_time_spent" },
        avgProgress: { $avg: "$progress_percentage" },
      },
    },
  ]);
};

// Virtual for enrollment duration
enrollmentSchema.virtual("enrollment_duration_days").get(function () {
  const endDate = this.completed_at || new Date();
  const diffTime = Math.abs(endDate - this.enrolled_at);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for progress status
enrollmentSchema.virtual("progress_status").get(function () {
  if (this.status === "completed") return "Completed";
  if (this.progress_percentage === 0) return "Not Started";
  if (this.progress_percentage < 30) return "Just Started";
  if (this.progress_percentage < 70) return "In Progress";
  if (this.progress_percentage < 100) return "Almost Done";
  return "Ready to Complete";
});

// Ensure virtual fields are serialized
enrollmentSchema.set("toJSON", { virtuals: true });

const enrollmentModel = mongoose.model("Enrollment", enrollmentSchema);

export default enrollmentModel;
