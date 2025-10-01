import courseModel from "../models/course.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import multer from "multer";

// Create new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    const mentorId = req.user.userId; // From auth middleware
    const file = req.file; // Cover image

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, and category",
      });
    }

    // Handle cover image upload
    let coverData = {
      public_id: null,
      url: null,
    };

    if (file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          folder: "ajarin/course-covers",
          transformation: [{ width: 800, height: 450, crop: "fill" }, { quality: "auto" }, { format: "auto" }],
        });

        coverData = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
        };
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload cover image. Please try again.",
        });
      }
    }

    // Parse tags if they come as strings
    const parsedTags = Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : tags ? tags.split(",").map((t) => t.trim().toLowerCase()) : [];

    // Create course
    const newCourse = new courseModel({
      mentor_id: mentorId,
      title: title.trim(),
      description: description.trim(),
      category,
      cover_url: coverData,
      tags: parsedTags,
      status: "draft", // Default to draft
    });

    await newCourse.save();

    // Populate mentor info for response
    await newCourse.populate("mentor_id", "fullname username avatar");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    console.error("Create course error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum 5MB allowed",
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during course creation",
    });
  }
};

// Get all courses (with filters and pagination)
export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, mentor_id, is_featured, sort = "-created_at", search } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (mentor_id) filter.mentor_id = mentor_id;
    if (is_featured !== undefined) filter.is_featured = is_featured === "true";

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = courseModel.find(filter).populate("mentor_id", "fullname username avatar").skip(skip).limit(parseInt(limit));

    // Sorting
    if (search) {
      query = query.sort({ score: { $meta: "textScore" } });
    } else {
      query = query.sort(sort);
    }

    const courses = await query;
    const totalCourses = await courseModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

// Get single course by ID or slug
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ObjectId first, then by slug
    let course;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Valid ObjectId
      course = await courseModel.findById(id).populate("mentor_id", "fullname username avatar headline bio");
    } else {
      // Assume it's a slug
      course = await courseModel.findOne({ slug: id }).populate("mentor_id", "fullname username avatar headline bio");
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course",
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.userId;
    const file = req.file;

    // Find course and check ownership
    const course = await courseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the mentor of this course
    if (course.mentor_id.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own courses",
      });
    }

    const { title, description, category, tags, status } = req.body;

    // Handle cover image update
    if (file) {
      try {
        // Delete old image if exists
        if (course.cover_url.public_id) {
          await deleteFromCloudinary(course.cover_url.public_id);
        }

        // Upload new image
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          folder: "ajarin/course-covers",
          transformation: [{ width: 800, height: 450, crop: "fill" }, { quality: "auto" }, { format: "auto" }],
        });

        course.cover_url = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
        };
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload cover image. Please try again.",
        });
      }
    }

    // Update fields if provided
    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (category) course.category = category;
    if (status) course.status = status;

    // Parse and update tags
    if (tags) {
      course.tags = Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : tags.split(",").map((t) => t.trim().toLowerCase());
    }

    await course.save();

    // Populate mentor info for response
    await course.populate("mentor_id", "fullname username avatar");

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Update course error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during course update",
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.userId;

    // Find course and check ownership
    const course = await courseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the mentor of this course
    if (course.mentor_id.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own courses",
      });
    }

    // Delete cover image from Cloudinary if exists
    if (course.cover_url.public_id) {
      try {
        await deleteFromCloudinary(course.cover_url.public_id);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
        // Continue with course deletion even if image deletion fails
      }
    }

    // Delete course
    await courseModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during course deletion",
    });
  }
};

// Get courses by mentor (my courses)
export const getMyCourses = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { page = 1, limit = 10, status, sort = "-created_at" } = req.query;

    // Build filter
    const filter = { mentor_id: mentorId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get courses
    const courses = await courseModel.find(filter).populate("mentor_id", "fullname username avatar").skip(skip).limit(parseInt(limit)).sort(sort);

    const totalCourses = await courseModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching your courses",
    });
  }
};

// Publish/unpublish course
export const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mentorId = req.user.userId;

    // Validate status
    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'draft', 'published', or 'archived'",
      });
    }

    // Find course and check ownership
    const course = await courseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.mentor_id.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only modify your own courses",
      });
    }

    // Update status
    course.status = status;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course status changed to ${status}`,
      data: {
        course: {
          id: course._id,
          title: course.title,
          status: course.status,
        },
      },
    });
  } catch (error) {
    console.error("Toggle course status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating course status",
    });
  }
};

// Search courses (public endpoint)
export const searchCourses = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Use the static method from model
    const options = {};
    if (category) options.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await courseModel.searchCourses(q, options).skip(skip).limit(parseInt(limit));

    const totalCourses = await courseModel.countDocuments({
      status: "published",
      $text: { $search: q },
      ...(category && { category }),
    });

    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Search courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching courses",
    });
  }
};
