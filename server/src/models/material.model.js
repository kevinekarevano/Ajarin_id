import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    // References
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

    // Material Information
    title: {
      type: String,
      required: [true, "Material title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // Material Type & Content
    type: {
      type: String,
      required: [true, "Material type is required"],
      enum: ["video", "document", "image", "link", "quiz", "assignment"],
      index: true,
    },

    content_url: {
      type: String,
      required: function () {
        return this.type !== "quiz" && this.type !== "assignment";
      },
    },

    // For file uploads (documents, videos)
    file_info: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
      file_size: {
        type: Number, // in bytes
        default: 0,
      },
      file_type: {
        type: String,
        default: null,
      },
      file_name: {
        type: String, // Original filename
        default: null,
      },
      file_extension: {
        type: String, // File extension (pdf, mp4, etc)
        default: null,
      },
    }, // Material Ordering & Organization
    order: {
      type: Number,
      required: [true, "Material order is required"],
      min: 1,
    },

    chapter: {
      type: String,
      default: "General",
      trim: true,
      maxlength: [100, "Chapter name cannot exceed 100 characters"],
    },

    // Duration & Time
    duration_minutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimated_reading_time: {
      type: Number, // in minutes
      default: 0,
      min: 0,
    },

    // Access Control
    is_published: {
      type: Boolean,
      default: true,
    },

    // Quiz/Assignment Specific Fields
    quiz_data: {
      questions: [
        {
          question: {
            type: String,
            required: function () {
              return this.parent().type === "quiz";
            },
          },
          options: [
            {
              text: String,
              is_correct: Boolean,
            },
          ],
          explanation: String,
          points: {
            type: Number,
            default: 1,
          },
        },
      ],
      passing_score: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      time_limit: {
        type: Number, // in minutes
        default: 30,
      },
    },

    assignment_data: {
      instructions: String,
      submission_type: {
        type: String,
        enum: ["file", "text", "url"],
        default: "text",
      },
      max_file_size: {
        type: Number, // in MB
        default: 10,
      },
      allowed_extensions: [String],
      due_date: Date,
      max_points: {
        type: Number,
        default: 100,
      },
    },

    // Analytics
    view_count: {
      type: Number,
      default: 0,
    },

    completion_count: {
      type: Number,
      default: 0,
    },

    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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
materialSchema.index({ course_id: 1 });
materialSchema.index({ mentor_id: 1 });
// type index already created by index: true in schema
materialSchema.index({ is_published: 1 });

materialSchema.index({ course_id: 1, order: 1 }); // For ordered retrieval
materialSchema.index({ course_id: 1, chapter: 1, order: 1 }); // For chapter organization

// Compound index for course materials listing
materialSchema.index({
  course_id: 1,
  is_published: 1,
  order: 1,
});

// Text index for search
materialSchema.index({
  title: "text",
  description: "text",
});

// Pre-save middleware
materialSchema.pre("save", function (next) {
  this.updated_at = new Date();

  // Auto-calculate estimated reading time for text content
  if (this.type === "document" && this.description) {
    const wordCount = this.description.split(" ").length;
    this.estimated_reading_time = Math.ceil(wordCount / 200); // 200 words per minute
  }

  next();
});

// Instance methods
materialSchema.methods.incrementView = function () {
  this.view_count += 1;
  return this.save();
};

materialSchema.methods.incrementCompletion = function () {
  this.completion_count += 1;
  return this.save();
};

materialSchema.methods.updateRating = function (newRating) {
  // Simple rating update - can be enhanced with proper average calculation
  this.average_rating = newRating;
  return this.save();
};

// Static methods
materialSchema.statics.findByCourse = function (courseId, options = {}) {
  const filter = { course_id: courseId, is_published: true };

  if (options.chapter) {
    filter.chapter = options.chapter;
  }

  if (options.type) {
    filter.type = options.type;
  }

  return this.find(filter).sort({ chapter: 1, order: 1 }).populate("mentor_id", "fullname username avatar");
};

materialSchema.statics.findByChapter = function (courseId, chapter) {
  return this.find({
    course_id: courseId,
    chapter: chapter,
    is_published: true,
  }).sort({ order: 1 });
};

materialSchema.statics.getNextOrder = async function (courseId, chapter = "General") {
  const lastMaterial = await this.findOne({
    course_id: courseId,
    chapter: chapter,
  }).sort({ order: -1 });

  return lastMaterial ? lastMaterial.order + 1 : 1;
};

materialSchema.statics.getCourseStructure = function (courseId) {
  return this.aggregate([
    { $match: { course_id: new mongoose.Types.ObjectId(courseId), is_published: true } },
    {
      $group: {
        _id: "$chapter",
        materials: {
          $push: {
            _id: "$_id",
            title: "$title",
            type: "$type",
            order: "$order",
            duration_minutes: "$duration_minutes",
          },
        },
        total_duration: { $sum: "$duration_minutes" },
        material_count: { $sum: 1 },
      },
    },
    {
      $project: {
        chapter: "$_id",
        materials: {
          $sortArray: {
            input: "$materials",
            sortBy: { order: 1 },
          },
        },
        total_duration: 1,
        material_count: 1,
      },
    },
    { $sort: { chapter: 1 } },
  ]);
};

// Virtual for formatted duration
materialSchema.virtual("formatted_duration").get(function () {
  if (this.duration_minutes === 0) return "No duration";

  const hours = Math.floor(this.duration_minutes / 60);
  const mins = this.duration_minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
});

// Virtual for file size formatting
materialSchema.virtual("formatted_file_size").get(function () {
  if (!this.file_info.file_size) return "Unknown size";

  const size = this.file_info.file_size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

// Ensure virtual fields are serialized
materialSchema.set("toJSON", { virtuals: true });

const materialModel = mongoose.model("Material", materialSchema);

export default materialModel;
