import Reply from "../models/reply.model.js";
import Discussion from "../models/discussion.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";

// Helper function to check if user has access to course (either enrolled or is the instructor)
const checkCourseAccess = async (userId, courseId) => {
  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    learner_id: userId,
    course_id: courseId,
    status: "active",
  });

  if (enrollment) {
    return { hasAccess: true, role: "student" };
  }

  // Check if user is the instructor of the course
  const course = await Course.findOne({
    _id: courseId,
    mentor_id: userId,
  });

  if (course) {
    return { hasAccess: true, role: "instructor" };
  }

  return { hasAccess: false, role: null };
};

// Create reply to discussion
export const createReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, parent_reply_id = null } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    // Get discussion
    const discussion = await Discussion.findById(discussionId).populate("course_id", "_id");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if discussion is locked
    if (discussion.is_locked) {
      return res.status(403).json({
        success: false,
        message: "Cannot reply to locked discussion",
      });
    }

    // Check if user has access to the course
    const { hasAccess, role } = await checkCourseAccess(req.user.userId, discussion.course_id._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course or be the instructor to reply",
      });
    }

    // If replying to another reply, validate parent reply exists
    let parentReply = null;
    if (parent_reply_id) {
      parentReply = await Reply.findById(parent_reply_id);
      if (!parentReply || parentReply.discussion_id.toString() !== discussionId) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent reply",
        });
      }
    }

    // Extract mentions from content (simple @username detection)
    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        username: match[1],
        // We'll resolve user_id later if needed
      });
    }

    // Create reply
    const reply = new Reply({
      discussion_id: discussionId,
      author_id: req.user.userId,
      parent_reply_id,
      content: content.trim(),
      mentions,
    });

    await reply.save();

    // Update discussion stats
    await discussion.addReply(req.user.userId);

    // If this is a nested reply, update parent reply stats
    if (parentReply) {
      await parentReply.addNestedReply();
    }

    // Populate author info
    await reply.populate("author_id", "fullname username avatar role");

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reply",
      error: error.message,
    });
  }
};

// Update reply
export const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    const reply = await Reply.findById(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Check if user owns the reply
    if (reply.author_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own replies",
      });
    }

    // Update content
    reply.content = content.trim();

    // Update mentions
    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        username: match[1],
      });
    }
    reply.mentions = mentions;

    await reply.save();

    // Populate author info
    await reply.populate("author_id", "fullname username avatar role");

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Update reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reply",
      error: error.message,
    });
  }
};

// Delete reply
export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId).populate({
      path: "discussion_id",
      populate: {
        path: "course_id",
        select: "mentor_id",
      },
    });

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Check if user can delete (author or mentor)
    const canDelete = reply.author_id.toString() === req.user.userId || reply.discussion_id.course_id.mentor_id.toString() === req.user.userId;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this reply",
      });
    }

    // Soft delete instead of hard delete to preserve thread structure
    await reply.softDelete();

    // Update discussion reply count
    const discussion = await Discussion.findById(reply.discussion_id);
    await discussion.removeReply();

    // If this was a nested reply, update parent stats
    if (reply.parent_reply_id) {
      const parentReply = await Reply.findById(reply.parent_reply_id);
      if (parentReply) {
        await parentReply.removeNestedReply();
      }
    }

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reply",
      error: error.message,
    });
  }
};

// Toggle like reply
export const toggleLikeReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId).populate("discussion_id", "course_id");

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Check if user has access to the course
    const { hasAccess, role } = await checkCourseAccess(req.user.userId, reply.discussion_id.course_id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course or be the instructor to like replies",
      });
    }

    // Toggle like
    await reply.toggleLike(req.user.userId);

    // Check if now liked
    const isLiked = reply.isLikedBy(req.user.userId);

    res.status(200).json({
      success: true,
      message: isLiked ? "Reply liked" : "Reply unliked",
      data: {
        is_liked: isLiked,
        like_count: reply.like_count,
      },
    });
  } catch (error) {
    console.error("Toggle like reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

// Mark reply as best answer
export const markAsBestAnswer = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId).populate("discussion_id", "author_id type course_id");

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    const discussion = reply.discussion_id;

    // Check if discussion is a question
    if (discussion.type !== "question") {
      return res.status(400).json({
        success: false,
        message: "Best answers can only be marked for questions",
      });
    }

    // Check if user owns the discussion
    if (discussion.author_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the question author can mark best answers",
      });
    }

    // Remove current best answer if exists
    await Reply.updateMany(
      {
        discussion_id: discussion._id,
        is_best_answer: true,
      },
      {
        $set: {
          is_best_answer: false,
          marked_best_by: null,
          marked_best_at: null,
        },
      }
    );

    // Mark this reply as best answer
    await reply.markAsBestAnswer(req.user.id);

    // Populate author info
    await reply.populate("author_id", "fullname username avatar role");
    await reply.populate("marked_best_by", "fullname username");

    res.status(200).json({
      success: true,
      message: "Reply marked as best answer",
      data: reply,
    });
  } catch (error) {
    console.error("Mark as best answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as best answer",
      error: error.message,
    });
  }
};

// Unmark reply as best answer
export const unmarkAsBestAnswer = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId).populate("discussion_id", "author_id type");

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    const discussion = reply.discussion_id;

    // Check if user owns the discussion
    if (discussion.author_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the question author can unmark best answers",
      });
    }

    // Check if it's currently marked as best answer
    if (!reply.is_best_answer) {
      return res.status(400).json({
        success: false,
        message: "This reply is not marked as best answer",
      });
    }

    // Unmark as best answer
    await reply.unmarkAsBestAnswer();

    res.status(200).json({
      success: true,
      message: "Reply unmarked as best answer",
      data: reply,
    });
  } catch (error) {
    console.error("Unmark as best answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unmark as best answer",
      error: error.message,
    });
  }
};

// Get nested replies
export const getNestedReplies = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { limit = 10 } = req.query;

    // Check if parent reply exists
    const parentReply = await Reply.findById(replyId).populate("discussion_id", "course_id");

    if (!parentReply) {
      return res.status(404).json({
        success: false,
        message: "Parent reply not found",
      });
    }

    // Check if user has access to the course
    const { hasAccess, role } = await checkCourseAccess(req.user.userId, parentReply.discussion_id.course_id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course or be the instructor to view replies",
      });
    }

    // Get nested replies
    const nestedReplies = await Reply.getNestedReplies(replyId, parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Nested replies retrieved successfully",
      data: nestedReplies,
    });
  } catch (error) {
    console.error("Get nested replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nested replies",
      error: error.message,
    });
  }
};

// Get user's replies
export const getUserReplies = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const replies = await Reply.getUserReplies(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      message: "User replies retrieved successfully",
      data: replies,
    });
  } catch (error) {
    console.error("Get user replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user replies",
      error: error.message,
    });
  }
};

// Search replies in discussion
export const searchReplies = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    // Check if discussion exists and user has access
    const discussion = await Discussion.findById(discussionId).populate("course_id", "_id");

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Check if user has access to the course
    const { hasAccess, role } = await checkCourseAccess(req.user.userId, discussion.course_id._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course or be the instructor to search replies",
      });
    }

    const replies = await Reply.searchReplies(discussionId, searchTerm);

    res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      data: {
        replies,
        search_term: searchTerm,
        total_results: replies.length,
      },
    });
  } catch (error) {
    console.error("Search replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search replies",
      error: error.message,
    });
  }
};
