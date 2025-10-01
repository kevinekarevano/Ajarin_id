import Discussion from "../models/discussion.model.js";
import Reply from "../models/reply.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Material from "../models/material.model.js";

// Get all discussions for a course
export const getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type = "all", search, sortBy = "last_reply", page = 1, limit = 20 } = req.query;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to view discussions",
      });
    }

    // Get discussions with pagination
    const discussions = await Discussion.getCourseDiscussions(courseId, {
      type,
      search,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Get total count for pagination
    const filter = { course_id: courseId };
    if (type && type !== "all") {
      filter.type = type;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const totalDiscussions = await Discussion.countDocuments(filter);
    const totalPages = Math.ceil(totalDiscussions / limit);

    // Get course info
    const course = await Course.findById(courseId).select("title");

    res.status(200).json({
      success: true,
      message: "Discussions retrieved successfully",
      data: {
        discussions,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_discussions: totalDiscussions,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
        course,
        filters: {
          type,
          search,
          sortBy,
        },
      },
    });
  } catch (error) {
    console.error("Get course discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions",
      error: error.message,
    });
  }
};

// Get single discussion with replies
export const getDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { page = 1, limit = 50, sortBy = "oldest" } = req.query;

    // Get discussion with author info
    const discussion = await Discussion.findById(discussionId)
      .populate("author_id", "fullname username avatar role")
      .populate("course_id", "title mentor_id")
      .populate("material_id", "title type")
      .populate("last_reply_by", "fullname username avatar");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: discussion.course_id._id,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to view this discussion",
      });
    }

    // Increment view count (but not for the author)
    if (discussion.author_id._id.toString() !== req.user.id) {
      await discussion.incrementView();
    }

    // Get replies with nested replies
    const replies = await Reply.getDiscussionReplies(discussionId, {
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
      includeBestAnswer: discussion.type === "question",
    });

    // Get nested replies for each reply
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await Reply.getNestedReplies(reply._id, 10);
        return {
          ...reply.toJSON(),
          nested_replies: nestedReplies,
        };
      })
    );

    // Get total reply count for pagination
    const totalReplies = await Reply.countDocuments({
      discussion_id: discussionId,
      parent_reply_id: null,
      is_deleted: false,
    });
    const totalPages = Math.ceil(totalReplies / limit);

    // Check if user liked the discussion
    const isLiked = discussion.isLikedBy(req.user.id);

    res.status(200).json({
      success: true,
      message: "Discussion retrieved successfully",
      data: {
        discussion: {
          ...discussion.toJSON(),
          is_liked: isLiked,
        },
        replies: repliesWithNested,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_replies: totalReplies,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
        user_permissions: {
          can_reply: !discussion.is_locked,
          can_edit: discussion.author_id._id.toString() === req.user.id,
          can_delete: discussion.author_id._id.toString() === req.user.id || discussion.course_id.mentor_id.toString() === req.user.id,
          can_moderate: discussion.course_id.mentor_id.toString() === req.user.id,
        },
      },
    });
  } catch (error) {
    console.error("Get discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussion",
      error: error.message,
    });
  }
};

// Create new discussion
export const createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, type = "general", material_id, tags = [] } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to create discussions",
      });
    }

    // Validate material if provided
    let materialExists = true;
    if (material_id) {
      const material = await Material.findOne({
        _id: material_id,
        course_id: courseId,
      });
      if (!material) {
        materialExists = false;
      }
    }

    // Create discussion
    const discussion = new Discussion({
      course_id: courseId,
      author_id: req.user.id,
      material_id: materialExists ? material_id : null,
      title: title.trim(),
      content: content.trim(),
      type,
      tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()) : [],
    });

    await discussion.save();

    // Populate author info
    await discussion.populate("author_id", "fullname username avatar role");
    if (material_id && materialExists) {
      await discussion.populate("material_id", "title type");
    }

    res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion,
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: error.message,
    });
  }
};

// Update discussion
export const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { title, content, tags } = req.body;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user owns the discussion
    if (discussion.author_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own discussions",
      });
    }

    // Update fields
    if (title) discussion.title = title.trim();
    if (content) discussion.content = content.trim();
    if (tags !== undefined) {
      discussion.tags = Array.isArray(tags) ? tags.map((tag) => tag.trim()) : [];
    }

    await discussion.save();

    // Populate author info
    await discussion.populate("author_id", "fullname username avatar role");
    await discussion.populate("material_id", "title type");

    res.status(200).json({
      success: true,
      message: "Discussion updated successfully",
      data: discussion,
    });
  } catch (error) {
    console.error("Update discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message,
    });
  }
};

// Delete discussion
export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId).populate("course_id", "mentor_id");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user can delete (author or mentor)
    const canDelete = discussion.author_id.toString() === req.user.id || discussion.course_id.mentor_id.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this discussion",
      });
    }

    // Delete all replies first
    await Reply.deleteMany({ discussion_id: discussionId });

    // Delete discussion
    await Discussion.findByIdAndDelete(discussionId);

    res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion",
      error: error.message,
    });
  }
};

// Toggle like discussion
export const toggleLikeDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: discussion.course_id,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to like discussions",
      });
    }

    // Toggle like
    await discussion.toggleLike(req.user.id);

    // Check if now liked
    const isLiked = discussion.isLikedBy(req.user.id);

    res.status(200).json({
      success: true,
      message: isLiked ? "Discussion liked" : "Discussion unliked",
      data: {
        is_liked: isLiked,
        like_count: discussion.like_count,
      },
    });
  } catch (error) {
    console.error("Toggle like discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

// Pin/Unpin discussion (mentor only)
export const togglePinDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId).populate("course_id", "mentor_id");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user is mentor
    if (discussion.course_id.mentor_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only mentors can pin discussions",
      });
    }

    // Toggle pin
    if (discussion.is_pinned) {
      await discussion.unpin();
    } else {
      await discussion.pin();
    }

    res.status(200).json({
      success: true,
      message: discussion.is_pinned ? "Discussion pinned" : "Discussion unpinned",
      data: {
        is_pinned: discussion.is_pinned,
      },
    });
  } catch (error) {
    console.error("Toggle pin discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle pin",
      error: error.message,
    });
  }
};

// Lock/Unlock discussion (mentor only)
export const toggleLockDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId).populate("course_id", "mentor_id");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user is mentor
    if (discussion.course_id.mentor_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only mentors can lock discussions",
      });
    }

    // Toggle lock
    if (discussion.is_locked) {
      await discussion.unlock();
    } else {
      await discussion.lock();
    }

    res.status(200).json({
      success: true,
      message: discussion.is_locked ? "Discussion locked" : "Discussion unlocked",
      data: {
        is_locked: discussion.is_locked,
      },
    });
  } catch (error) {
    console.error("Toggle lock discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle lock",
      error: error.message,
    });
  }
};

// Mark discussion as resolved (question type)
export const markAsResolved = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user owns the discussion
    if (discussion.author_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the discussion author can mark it as resolved",
      });
    }

    // Check if it's a question
    if (discussion.type !== "question") {
      return res.status(400).json({
        success: false,
        message: "Only questions can be marked as resolved",
      });
    }

    await discussion.markAsResolved();

    res.status(200).json({
      success: true,
      message: "Discussion marked as resolved",
      data: {
        is_resolved: discussion.is_resolved,
      },
    });
  } catch (error) {
    console.error("Mark as resolved error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as resolved",
      error: error.message,
    });
  }
};

// Search discussions
export const searchDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user_id: req.user.id,
      course_id: courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to search discussions",
      });
    }

    const discussions = await Discussion.searchDiscussions(courseId, searchTerm);

    res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      data: {
        discussions,
        search_term: searchTerm,
        total_results: discussions.length,
      },
    });
  } catch (error) {
    console.error("Search discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search discussions",
      error: error.message,
    });
  }
};

// Get user's discussions
export const getUserDiscussions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const discussions = await Discussion.getUserDiscussions(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      message: "User discussions retrieved successfully",
      data: discussions,
    });
  } catch (error) {
    console.error("Get user discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user discussions",
      error: error.message,
    });
  }
};
