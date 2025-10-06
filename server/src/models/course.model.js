import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    // Mentor yang membuat course (sesuai ERD: mentor_id)
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mentor ID is required"],
    },

    // Basic Course Information
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Course Categorization
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Programming",
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Design",
        "UI/UX",
        "Digital Marketing",
        "Business",
        "Language",
        "Mathematics",
        "Science",
        "Art & Creative",
        "Music",
        "Photography",
        "Writing",
        "Personal Development",
        "Other",
      ],
    },

    // Course Media
    cover_url: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },

    // Course Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Course Statistics
    total_duration_minutes: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },

    total_materials: {
      type: Number,
      default: 0,
    },

    total_tasks: {
      type: Number,
      default: 0,
    },

    // Enrollment Statistics
    total_enrollments: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Rating System
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Course Settings
    is_featured: {
      type: Boolean,
      default: false,
    },

    // SEO & Tags
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Timestamps (sesuai ERD: created_at)
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
    timestamps: false, // Pakai manual timestamps
  }
);

// Indexes untuk performance
courseSchema.index({ mentor_id: 1 });
// slug index already created by unique: true
courseSchema.index({ category: 1 });
// status index already created by index: true below

courseSchema.index({ is_featured: -1 });
courseSchema.index({ created_at: -1 });
courseSchema.index({ "rating.average": -1 });
courseSchema.index({ total_enrollments: -1 });
courseSchema.index({ tags: 1 });

// Text index untuk search functionality
courseSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

// Update updated_at sebelum save
courseSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

// Generate slug dari title sebelum save
courseSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    // Generate slug dari title
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    // Add timestamp untuk uniqueness
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

// Virtual untuk populate mentor info
courseSchema.virtual("mentor", {
  ref: "User",
  localField: "mentor_id",
  foreignField: "_id",
  justOne: true,
});

// Virtual untuk total duration in hours
courseSchema.virtual("total_duration_hours").get(function () {
  return Math.round((this.total_duration_minutes / 60) * 10) / 10;
});

// Method untuk update statistics
courseSchema.methods.updateStatistics = async function () {
  // Update total materials, tasks, dll dari related collections
  // Akan diimplementasi setelah model materials dan tasks dibuat
  return this.save();
};

// Method untuk update rating
courseSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = Math.round((totalRating / this.rating.count) * 10) / 10;
  return this.save();
};

// Static method untuk find published courses
courseSchema.statics.findPublished = function (filter = {}) {
  return this.find({ ...filter, status: "published" });
};

// Static method untuk search courses
courseSchema.statics.searchCourses = function (query, options = {}) {
  const searchFilter = {
    status: "published",
    $text: { $search: query },
  };

  if (options.category) {
    searchFilter.category = options.category;
  }

  return this.find(searchFilter)
    .populate("mentor", "fullname username avatar")
    .sort({ score: { $meta: "textScore" } });
};

// Ensure virtual fields are serialized
courseSchema.set("toJSON", { virtuals: true });

const courseModel = mongoose.model("Course", courseSchema);

export default courseModel;
