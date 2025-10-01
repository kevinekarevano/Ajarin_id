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

    // Simple Progress Status - Just completed or not
    is_completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Timestamps
    marked_completed_at: {
      type: Date,
      default: null,
    },

    // Optional: Simple rating system
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    feedback: {
      type: String,
      maxlength: [500, "Feedback cannot exceed 500 characters"],
      default: "",
    },

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
materialProgressSchema.index({ user_id: 1 });
materialProgressSchema.index({ material_id: 1 });
materialProgressSchema.index({ course_id: 1 });
materialProgressSchema.index({ user_id: 1, course_id: 1 });
materialProgressSchema.index({ user_id: 1, material_id: 1 }, { unique: true });
materialProgressSchema.index({ is_completed: 1 });

// Compound index for course progress queries
materialProgressSchema.index({
  user_id: 1,
  course_id: 1,
  is_completed: 1,
});

// Pre-save middleware
materialProgressSchema.pre("save", function (next) {
  this.updated_at = new Date();

  // Set completed timestamp when marked as completed
  if (this.is_completed && !this.marked_completed_at) {
    this.marked_completed_at = new Date();
  }

  // Clear completed timestamp if unmarked
  if (!this.is_completed && this.marked_completed_at) {
    this.marked_completed_at = null;
  }

  next();
});

// Instance methods
materialProgressSchema.methods.markAsCompleted = function () {
  this.is_completed = true;
  this.marked_completed_at = new Date();
  return this.save();
};

materialProgressSchema.methods.markAsIncomplete = function () {
  this.is_completed = false;
  this.marked_completed_at = null;
  return this.save();
};

materialProgressSchema.methods.rateMaterial = function (rating, feedback = "") {
  this.rating = rating;
  this.feedback = feedback.trim();
  return this.save();
};

// Static methods
materialProgressSchema.statics.getOrCreate = async function (userId, materialId, courseId) {
  let progress = await this.findOne({
    user_id: userId,
    material_id: materialId,
  });

  if (!progress) {
    progress = new this({
      user_id: userId,
      material_id: materialId,
      course_id: courseId,
    });
    await progress.save();
  }

  return progress;
};

materialProgressSchema.statics.getUserCourseProgress = function (userId, courseId) {
  return this.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        course_id: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: "$course_id",
        total_materials: { $sum: 1 },
        completed_materials: {
          $sum: { $cond: ["$is_completed", 1, 0] },
        },
        completion_percentage: {
          $avg: { $cond: ["$is_completed", 100, 0] },
        },
        average_rating: {
          $avg: {
            $cond: [{ $ne: ["$rating", null] }, "$rating", null],
          },
        },
        latest_activity: { $max: "$updated_at" },
      },
    },
    {
      $project: {
        course_id: "$_id",
        total_materials: 1,
        completed_materials: 1,
        completion_percentage: { $round: ["$completion_percentage", 2] },
        average_rating: { $round: ["$average_rating", 2] },
        latest_activity: 1,
      },
    },
  ]);
};

materialProgressSchema.statics.getCourseLeaderboard = function (courseId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        course_id: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: "$user_id",
        total_materials: { $sum: 1 },
        completed_materials: {
          $sum: { $cond: ["$is_completed", 1, 0] },
        },
        completion_percentage: {
          $avg: { $cond: ["$is_completed", 100, 0] },
        },
        average_rating: {
          $avg: {
            $cond: [{ $ne: ["$rating", null] }, "$rating", null],
          },
        },
        latest_completion: { $max: "$marked_completed_at" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        user_id: "$_id",
        user_name: "$user.fullname",
        user_avatar: "$user.avatar",
        total_materials: 1,
        completed_materials: 1,
        completion_percentage: { $round: ["$completion_percentage", 2] },
        average_rating: { $round: ["$average_rating", 2] },
        latest_completion: 1,
      },
    },
    {
      $sort: {
        completion_percentage: -1,
        completed_materials: -1,
        latest_completion: -1,
      },
    },
    {
      $limit: limit,
    },
  ]);
};

materialProgressSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        total_materials: { $sum: 1 },
        completed_materials: {
          $sum: { $cond: ["$is_completed", 1, 0] },
        },
        courses_enrolled: { $addToSet: "$course_id" },
        average_rating_given: {
          $avg: {
            $cond: [{ $ne: ["$rating", null] }, "$rating", null],
          },
        },
        latest_activity: { $max: "$updated_at" },
      },
    },
    {
      $project: {
        total_materials: 1,
        completed_materials: 1,
        completion_rate: {
          $cond: [
            { $eq: ["$total_materials", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [{ $divide: ["$completed_materials", "$total_materials"] }, 100],
                },
                2,
              ],
            },
          ],
        },
        courses_count: { $size: "$courses_enrolled" },
        average_rating_given: { $round: ["$average_rating_given", 2] },
        latest_activity: 1,
      },
    },
  ]);
};

// Virtual for completion status badge
materialProgressSchema.virtual("status_badge").get(function () {
  return this.is_completed ? "✅ Completed" : "⏳ Not Completed";
});

// Virtual for completion date formatting
materialProgressSchema.virtual("formatted_completion_date").get(function () {
  if (!this.marked_completed_at) return null;

  return this.marked_completed_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Ensure virtual fields are serialized
materialProgressSchema.set("toJSON", { virtuals: true });

const MaterialProgress = mongoose.model("MaterialProgress", materialProgressSchema);

export default MaterialProgress;
