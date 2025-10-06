import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    // References
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },

    // Optional: Link to specific material
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null,
    },

    // Discussion Content
    title: {
      type: String,
      required: [true, "Discussion title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Discussion content is required"],
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },

    // Discussion Type
    type: {
      type: String,
      enum: ["general", "question", "announcement", "material_discussion"],
      default: "general",
      index: true,
    },

    // Discussion Status
    is_pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    is_locked: {
      type: Boolean,
      default: false,
    },

    is_resolved: {
      type: Boolean,
      default: false, // For questions
    },

    // Tags (optional)
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],

    // Interaction Stats
    reply_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    view_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    like_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Who liked this discussion
    likes: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        liked_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Last Activity
    last_reply_at: {
      type: Date,
      default: null,
    },

    last_reply_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
discussionSchema.index({ course_id: 1 });
discussionSchema.index({ author_id: 1 });
discussionSchema.index({ material_id: 1 });
// type index already created by index: true in schema
// is_pinned index already created by index: true in schema
discussionSchema.index({ created_at: -1 });
discussionSchema.index({ last_reply_at: -1 });

// Compound indexes
discussionSchema.index({
  course_id: 1,
  is_pinned: -1,
  last_reply_at: -1,
});

discussionSchema.index({
  course_id: 1,
  type: 1,
  created_at: -1,
});

// Text search index
discussionSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

// Pre-save middleware
discussionSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

// Instance methods
discussionSchema.methods.incrementView = function () {
  this.view_count += 1;
  return this.save();
};

discussionSchema.methods.toggleLike = function (userId) {
  const existingLike = this.likes.find((like) => like.user_id.toString() === userId.toString());

  if (existingLike) {
    // Remove like
    this.likes = this.likes.filter((like) => like.user_id.toString() !== userId.toString());
    this.like_count = Math.max(0, this.like_count - 1);
  } else {
    // Add like
    this.likes.push({
      user_id: userId,
      liked_at: new Date(),
    });
    this.like_count += 1;
  }

  return this.save();
};

discussionSchema.methods.addReply = function (replyBy) {
  this.reply_count += 1;
  this.last_reply_at = new Date();
  this.last_reply_by = replyBy;
  return this.save();
};

discussionSchema.methods.removeReply = function () {
  this.reply_count = Math.max(0, this.reply_count - 1);
  return this.save();
};

discussionSchema.methods.markAsResolved = function () {
  this.is_resolved = true;
  return this.save();
};

discussionSchema.methods.pin = function () {
  this.is_pinned = true;
  return this.save();
};

discussionSchema.methods.unpin = function () {
  this.is_pinned = false;
  return this.save();
};

discussionSchema.methods.lock = function () {
  this.is_locked = true;
  return this.save();
};

discussionSchema.methods.unlock = function () {
  this.is_locked = false;
  return this.save();
};

// Static methods
discussionSchema.statics.getCourseDiscussions = function (courseId, options = {}) {
  const { type, search, sortBy = "last_reply", page = 1, limit = 20 } = options;

  const filter = { course_id: courseId };

  if (type && type !== "all") {
    filter.type = type;
  }

  let query = this.find(filter);

  // Text search
  if (search) {
    query = query.find({
      $text: { $search: search },
    });
  }

  // Sorting
  let sortOptions = {};
  switch (sortBy) {
    case "newest":
      sortOptions = { created_at: -1 };
      break;
    case "oldest":
      sortOptions = { created_at: 1 };
      break;
    case "most_replies":
      sortOptions = { reply_count: -1, created_at: -1 };
      break;
    case "most_liked":
      sortOptions = { like_count: -1, created_at: -1 };
      break;
    case "last_reply":
    default:
      sortOptions = { is_pinned: -1, last_reply_at: -1, created_at: -1 };
      break;
  }

  const skip = (page - 1) * limit;

  return query.populate("author_id", "fullname username avatar").populate("last_reply_by", "fullname username avatar").populate("material_id", "title type").sort(sortOptions).limit(limit).skip(skip);
};

discussionSchema.statics.searchDiscussions = function (courseId, searchTerm) {
  return this.find({
    course_id: courseId,
    $text: { $search: searchTerm },
  })
    .populate("author_id", "fullname username avatar")
    .populate("material_id", "title type")
    .sort({ score: { $meta: "textScore" } })
    .limit(20);
};

discussionSchema.statics.getPopularDiscussions = function (courseId, limit = 10) {
  return this.find({ course_id: courseId })
    .populate("author_id", "fullname username avatar")
    .sort({
      like_count: -1,
      reply_count: -1,
      view_count: -1,
    })
    .limit(limit);
};

discussionSchema.statics.getUserDiscussions = function (userId, limit = 10) {
  return this.find({ author_id: userId }).populate("course_id", "title").populate("material_id", "title type").sort({ created_at: -1 }).limit(limit);
};

// Virtual for checking if user liked
discussionSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user_id.toString() === userId.toString());
};

// Virtual for discussion type badge
discussionSchema.virtual("type_badge").get(function () {
  const badges = {
    general: "💬 General",
    question: "❓ Question",
    announcement: "📢 Announcement",
    material_discussion: "📚 Material",
  };
  return badges[this.type] || this.type;
});

// Virtual for status badge
discussionSchema.virtual("status_badge").get(function () {
  if (this.is_pinned) return "📌 Pinned";
  if (this.is_locked) return "🔒 Locked";
  if (this.is_resolved) return "✅ Resolved";
  return "";
});

// Virtual for formatted date
discussionSchema.virtual("formatted_date").get(function () {
  return this.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Ensure virtual fields are serialized
discussionSchema.set("toJSON", { virtuals: true });

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion;
