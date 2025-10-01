import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    // References
    discussion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: [true, "Discussion ID is required"],
    },

    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },

    // Reply to another reply (for nested replies)
    parent_reply_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
    },

    // Reply Content
    content: {
      type: String,
      required: [true, "Reply content is required"],
      trim: true,
      maxlength: [3000, "Reply content cannot exceed 3000 characters"],
    },

    // Reply Status
    is_deleted: {
      type: Boolean,
      default: false,
    },

    is_edited: {
      type: Boolean,
      default: false,
    },

    edited_at: {
      type: Date,
      default: null,
    },

    // Interaction Stats
    like_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    reply_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Who liked this reply
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

    // Mentions in the reply
    mentions: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username: String,
      },
    ],

    // Best Answer (for questions)
    is_best_answer: {
      type: Boolean,
      default: false,
    },

    marked_best_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    marked_best_at: {
      type: Date,
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
replySchema.index({ discussion_id: 1 });
replySchema.index({ author_id: 1 });
replySchema.index({ parent_reply_id: 1 });
replySchema.index({ created_at: 1 });
replySchema.index({ is_deleted: 1 });
replySchema.index({ is_best_answer: 1 });

// Compound indexes
replySchema.index({
  discussion_id: 1,
  parent_reply_id: 1,
  created_at: 1,
});

replySchema.index({
  discussion_id: 1,
  is_deleted: 1,
  created_at: 1,
});

// Text search for reply content
replySchema.index({
  content: "text",
});

// Pre-save middleware
replySchema.pre("save", function (next) {
  this.updated_at = new Date();

  // Set is_edited flag if content was modified
  if (this.isModified("content") && !this.isNew) {
    this.is_edited = true;
    this.edited_at = new Date();
  }

  next();
});

// Instance methods
replySchema.methods.toggleLike = function (userId) {
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

replySchema.methods.markAsBestAnswer = function (markedBy) {
  this.is_best_answer = true;
  this.marked_best_by = markedBy;
  this.marked_best_at = new Date();
  return this.save();
};

replySchema.methods.unmarkAsBestAnswer = function () {
  this.is_best_answer = false;
  this.marked_best_by = null;
  this.marked_best_at = null;
  return this.save();
};

replySchema.methods.softDelete = function () {
  this.is_deleted = true;
  this.content = "[This reply has been deleted]";
  return this.save();
};

replySchema.methods.addNestedReply = function () {
  this.reply_count += 1;
  return this.save();
};

replySchema.methods.removeNestedReply = function () {
  this.reply_count = Math.max(0, this.reply_count - 1);
  return this.save();
};

// Static methods
replySchema.statics.getDiscussionReplies = function (discussionId, options = {}) {
  const { parentId = null, sortBy = "oldest", page = 1, limit = 50, includeBestAnswer = true } = options;

  const filter = {
    discussion_id: discussionId,
    parent_reply_id: parentId,
    is_deleted: false,
  };

  let sortOptions = {};
  switch (sortBy) {
    case "newest":
      sortOptions = { created_at: -1 };
      break;
    case "most_liked":
      sortOptions = { like_count: -1, created_at: 1 };
      break;
    case "oldest":
    default:
      // Best answer first for questions
      if (includeBestAnswer && parentId === null) {
        sortOptions = { is_best_answer: -1, created_at: 1 };
      } else {
        sortOptions = { created_at: 1 };
      }
      break;
  }

  const skip = (page - 1) * limit;

  return this.find(filter).populate("author_id", "fullname username avatar role").populate("marked_best_by", "fullname username").populate("mentions.user_id", "fullname username").sort(sortOptions).limit(limit).skip(skip);
};

replySchema.statics.getNestedReplies = function (parentReplyId, limit = 10) {
  return this.find({
    parent_reply_id: parentReplyId,
    is_deleted: false,
  })
    .populate("author_id", "fullname username avatar role")
    .sort({ created_at: 1 })
    .limit(limit);
};

replySchema.statics.getUserReplies = function (userId, limit = 20) {
  return this.find({
    author_id: userId,
    is_deleted: false,
  })
    .populate("discussion_id", "title course_id")
    .populate({
      path: "discussion_id",
      populate: {
        path: "course_id",
        select: "title",
      },
    })
    .sort({ created_at: -1 })
    .limit(limit);
};

replySchema.statics.searchReplies = function (discussionId, searchTerm) {
  return this.find({
    discussion_id: discussionId,
    is_deleted: false,
    $text: { $search: searchTerm },
  })
    .populate("author_id", "fullname username avatar")
    .sort({ score: { $meta: "textScore" } })
    .limit(10);
};

replySchema.statics.getBestAnswers = function (discussionId) {
  return this.find({
    discussion_id: discussionId,
    is_best_answer: true,
    is_deleted: false,
  })
    .populate("author_id", "fullname username avatar role")
    .populate("marked_best_by", "fullname username")
    .sort({ marked_best_at: 1 });
};

replySchema.statics.getReplyStats = function (discussionId) {
  return this.aggregate([
    {
      $match: {
        discussion_id: mongoose.Types.ObjectId(discussionId),
        is_deleted: false,
      },
    },
    {
      $group: {
        _id: null,
        total_replies: { $sum: 1 },
        total_likes: { $sum: "$like_count" },
        unique_authors: { $addToSet: "$author_id" },
        best_answers: {
          $sum: {
            $cond: ["$is_best_answer", 1, 0],
          },
        },
        latest_reply: { $max: "$created_at" },
      },
    },
    {
      $project: {
        _id: 0,
        total_replies: 1,
        total_likes: 1,
        unique_authors_count: { $size: "$unique_authors" },
        best_answers: 1,
        latest_reply: 1,
      },
    },
  ]);
};

// Virtual for checking if user liked
replySchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user_id.toString() === userId.toString());
};

// Virtual for formatted date
replySchema.virtual("formatted_date").get(function () {
  return this.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for reply depth (for nested replies)
replySchema.virtual("depth").get(function () {
  return this.parent_reply_id ? 1 : 0; // Simple 2-level nesting
});

// Virtual for content preview
replySchema.virtual("content_preview").get(function () {
  if (this.is_deleted) return "[Deleted]";
  return this.content.length > 100 ? this.content.substring(0, 100) + "..." : this.content;
});

// Ensure virtual fields are serialized
replySchema.set("toJSON", { virtuals: true });

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
