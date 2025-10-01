import materialModel from "../models/material.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import multer from "multer";
import fetch from "node-fetch";

// Helper function to validate video links
const isValidVideoLink = (url) => {
  const videoPatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https?:\/\/(www\.)?dailymotion\.com\/video\/[\w-]+/,
    /^https?:\/\/(www\.)?drive\.google\.com\/file\/d\/[\w-]+/,
    /^https?:\/\/(www\.)?dropbox\.com\/.+/,
  ];

  return videoPatterns.some((pattern) => pattern.test(url));
};

// Create new material
export const createMaterial = async (req, res) => {
  try {
    const { course_id, title, description, type, content_url, chapter, duration_minutes, quiz_data, assignment_data } = req.body;

    const mentorId = req.user.userId;
    const file = req.file;

    console.log("Creating material:", { type, content_url, hasFile: !!file });

    // Validate required fields
    if (!course_id || !title || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide course_id, title, and type",
      });
    }

    // Validate type-specific requirements
    if (type === "video" || type === "link") {
      if (!content_url) {
        return res.status(400).json({
          success: false,
          message: `${type === "video" ? "Video" : "Link"} URL is required`,
        });
      }

      if (type === "video" && !isValidVideoLink(content_url)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid video link (YouTube, Vimeo, Google Drive, etc.)",
        });
      }
    }

    if ((type === "document" || type === "image") && !file) {
      return res.status(400).json({
        success: false,
        message: `File upload is required for ${type} materials`,
      });
    }

    // Verify course ownership
    const course = await courseModel.findOne({
      _id: course_id,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to add materials",
      });
    }

    // Handle file upload for documents/images
    let fileInfo = {
      public_id: null,
      url: null,
      file_size: 0,
      file_type: null,
    };

    if (file) {
      try {
        // Determine folder based on actual file type
        let folderPath = "ajarin/course-documents";
        let actualType = type;

        // Auto-detect type from file if not specified correctly
        if (file.mimetype.startsWith("image/")) {
          folderPath = "ajarin/course-images";
          actualType = "image";
        } else if (file.mimetype === "application/pdf" || file.mimetype.includes("document") || file.mimetype.includes("msword")) {
          folderPath = "ajarin/course-documents";
          actualType = "document";
        }

        // Update type if auto-detected
        if (actualType !== type) {
          console.log(`Auto-corrected type from '${type}' to '${actualType}' based on file type`);
        }

        // Get file extension from original filename
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const baseFileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension

        // Generate unique filename with original extension
        const uniqueFileName = `${baseFileName}-${Date.now()}.${fileExtension}`;

        // Determine resource type based on file type
        let resourceType = "raw"; // Default for documents
        if (actualType === "image" || file.mimetype.startsWith("image/")) {
          resourceType = "image";
        }

        // Special handling for PDF files to ensure proper browser viewing
        let uploadOptions = {
          folder: folderPath,
          resource_type: resourceType,
          public_id: `${folderPath}/${uniqueFileName}`,
          use_filename: true,
          unique_filename: false, // Use our custom filename
        };

        // For PDF files, ensure proper format handling
        if (fileExtension === "pdf") {
          uploadOptions.format = "pdf";
          uploadOptions.resource_type = "raw"; // Keep as raw for PDF
        } else {
          uploadOptions.format = fileExtension;
        }

        const cloudinaryResult = await uploadToCloudinary(file.buffer, uploadOptions);

        fileInfo = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
          file_size: file.size,
          file_type: file.mimetype,
          file_name: file.originalname, // Store original filename
          file_extension: fileExtension,
        };
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload file. Please try again.",
        });
      }
    }

    // Get next order number
    const nextOrder = await materialModel.getNextOrder(course_id, chapter || "General");

    // Parse complex data
    let parsedQuizData = null;
    let parsedAssignmentData = null;

    if (type === "quiz" && quiz_data) {
      parsedQuizData = typeof quiz_data === "string" ? JSON.parse(quiz_data) : quiz_data;
    }

    if (type === "assignment" && assignment_data) {
      parsedAssignmentData = typeof assignment_data === "string" ? JSON.parse(assignment_data) : assignment_data;
    }

    // Create material
    const material = new materialModel({
      course_id,
      mentor_id: mentorId,
      title: title.trim(),
      description: description?.trim() || "",
      type: file ? (file.mimetype.startsWith("image/") ? "image" : "document") : type,
      content_url: file ? fileInfo.url : content_url,
      file_info: file ? fileInfo : undefined,
      order: nextOrder,
      chapter: chapter?.trim() || "General",
      duration_minutes: parseInt(duration_minutes) || 0,
      quiz_data: parsedQuizData,
      assignment_data: parsedAssignmentData,
    });

    await material.save();

    // Update course statistics
    await courseModel.findByIdAndUpdate(course_id, {
      $inc: { total_materials: 1 },
    });

    // Populate for response
    await material.populate("mentor_id", "fullname username avatar");

    res.status(201).json({
      success: true,
      message: "Material created successfully",
      data: {
        material,
      },
    });
  } catch (error) {
    console.error("Create material error:", error);

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
      message: "Server error during material creation",
    });
  }
};

// Get course materials (for students and public)
export const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId; // Optional auth
    const { chapter, type, free_only } = req.query;

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check enrollment for non-free content
    let isEnrolled = false;
    let isMentor = false;

    if (userId) {
      // Check if user is the mentor
      isMentor = course.mentor_id.toString() === userId.toString();

      // Check if user is enrolled
      if (!isMentor) {
        const enrollment = await enrollmentModel.findOne({
          learner_id: userId,
          course_id: courseId,
        });
        isEnrolled = !!enrollment;
      }
    }

    // Build filter options
    const options = {};
    if (chapter) options.chapter = chapter;
    if (type) options.type = type;

    // If not enrolled and not mentor, show only free previews
    if (!isEnrolled && !isMentor && free_only !== "false") {
      options.freeOnly = true;
    }

    // Get materials
    const materials = await materialModel.findByCourse(courseId, options);

    // Get course structure for navigation
    const courseStructure = await materialModel.getCourseStructure(courseId);

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          total_materials: course.total_materials,
        },
        materials,
        course_structure: courseStructure,
        access_info: {
          is_enrolled: isEnrolled,
          is_mentor: isMentor,
          can_access_all: isEnrolled || isMentor,
        },
      },
    });
  } catch (error) {
    console.error("Get course materials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching materials",
    });
  }
};

// Get single material
export const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user?.userId;

    const material = await materialModel.findById(materialId).populate("course_id", "title mentor_id").populate("mentor_id", "fullname username avatar");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check access permissions
    const isMentor = material.mentor_id._id.toString() === userId;

    let isEnrolled = false;
    if (!isMentor && userId) {
      const enrollment = await enrollmentModel.findOne({
        learner_id: userId,
        course_id: material.course_id._id,
      });
      isEnrolled = !!enrollment;
    }

    // Check if user can access this material (must be enrolled or mentor)
    if (!isEnrolled && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to access this material",
      });
    }

    // Increment view count (only for enrolled students)
    if (isEnrolled && userId) {
      await material.incrementView();
    }

    res.status(200).json({
      success: true,
      data: {
        material,
        access_info: {
          is_enrolled: isEnrolled,
          is_mentor: isMentor,
          can_access: isEnrolled || isMentor,
        },
      },
    });
  } catch (error) {
    console.error("Get material error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching material",
    });
  }
};

// Update material
export const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const mentorId = req.user.userId;
    const file = req.file;

    // Find material and verify ownership
    const material = await materialModel.findOne({
      _id: materialId,
      mentor_id: mentorId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found or you don't have permission to update it",
      });
    }

    const { title, description, content_url, chapter, duration_minutes, is_published, quiz_data, assignment_data } = req.body;

    // Handle file update
    if (file) {
      try {
        // Delete old file if exists
        if (material.file_info.public_id) {
          await deleteFromCloudinary(material.file_info.public_id);
        }

        // Upload new file
        const folderPath = material.type === "video" ? "ajarin/course-videos" : "ajarin/course-documents";

        // Get file extension from original filename
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const baseFileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension

        // Generate unique filename with original extension
        const uniqueFileName = `${baseFileName}-${Date.now()}.${fileExtension}`;

        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          folder: folderPath,
          resource_type: material.type === "video" ? "video" : "raw",
          public_id: `${folderPath}/${uniqueFileName}`,
          use_filename: true,
          unique_filename: false,
          format: fileExtension,
        });

        material.file_info = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
          file_size: file.size,
          file_type: file.mimetype,
          file_name: file.originalname,
          file_extension: fileExtension,
        };

        material.content_url = cloudinaryResult.url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload file. Please try again.",
        });
      }
    }

    // Update fields
    if (title) material.title = title.trim();
    if (description !== undefined) material.description = description.trim();
    if (content_url && !file) material.content_url = content_url;
    if (chapter) material.chapter = chapter.trim();
    if (duration_minutes !== undefined) material.duration_minutes = parseInt(duration_minutes);
    if (is_published !== undefined) material.is_published = is_published === "true" || is_published === true;

    // Update complex data
    if (quiz_data && material.type === "quiz") {
      material.quiz_data = typeof quiz_data === "string" ? JSON.parse(quiz_data) : quiz_data;
    }

    if (assignment_data && material.type === "assignment") {
      material.assignment_data = typeof assignment_data === "string" ? JSON.parse(assignment_data) : assignment_data;
    }

    await material.save();

    // Populate for response
    await material.populate("mentor_id", "fullname username avatar");

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: {
        material,
      },
    });
  } catch (error) {
    console.error("Update material error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during material update",
    });
  }
};

// Delete material
export const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const mentorId = req.user.userId;

    // Find material and verify ownership
    const material = await materialModel.findOne({
      _id: materialId,
      mentor_id: mentorId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found or you don't have permission to delete it",
      });
    }

    // Delete file from Cloudinary if exists
    if (material.file_info.public_id) {
      try {
        await deleteFromCloudinary(material.file_info.public_id);
      } catch (cloudinaryError) {
        console.error("Failed to delete file from Cloudinary:", cloudinaryError);
        // Continue with material deletion even if file deletion fails
      }
    }

    // Update course statistics
    await courseModel.findByIdAndUpdate(material.course_id, {
      $inc: { total_materials: -1 },
    });

    // Delete material
    await materialModel.findByIdAndDelete(materialId);

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during material deletion",
    });
  }
};

// Reorder materials
export const reorderMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { materials } = req.body; // Array of { id, order, chapter }
    const mentorId = req.user.userId;

    // Verify course ownership
    const course = await courseModel.findOne({
      _id: courseId,
      mentor_id: mentorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission",
      });
    }

    // Update materials order
    const updatePromises = materials.map(({ id, order, chapter }) => {
      return materialModel.findOneAndUpdate({ _id: id, course_id: courseId, mentor_id: mentorId }, { order: parseInt(order), chapter: chapter || "General" });
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Materials reordered successfully",
    });
  } catch (error) {
    console.error("Reorder materials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during materials reordering",
    });
  }
};

// Get my materials (mentor)
export const getMyMaterials = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { course_id, type, chapter, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { mentor_id: mentorId };
    if (course_id) filter.course_id = course_id;
    if (type) filter.type = type;
    if (chapter) filter.chapter = chapter;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get materials
    const materials = await materialModel.find(filter).populate("course_id", "title").skip(skip).limit(parseInt(limit)).sort({ course_id: 1, chapter: 1, order: 1 });

    const totalMaterials = await materialModel.countDocuments(filter);
    const totalPages = Math.ceil(totalMaterials / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        materials,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMaterials,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my materials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching materials",
    });
  }
};

// View/access material content
export const viewMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user?.userId;

    const material = await materialModel.findById(materialId).populate("course_id", "title mentor_id").populate("mentor_id", "fullname username");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check access permissions - user must be logged in
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to access this material",
      });
    }

    console.log("Debug download access:");
    console.log("- Material mentor_id:", material.mentor_id._id.toString());
    console.log("- Current user ID:", userId);
    console.log("- Course ID:", material.course_id._id);

    const isMentor = material.mentor_id._id.toString() === userId;
    console.log("- Is mentor:", isMentor);

    let isEnrolled = false;
    if (!isMentor) {
      const enrollment = await enrollmentModel.findOne({
        learner_id: userId,
        course_id: material.course_id._id,
      });
      isEnrolled = !!enrollment;
      console.log("- Is enrolled:", isEnrolled);
    }

    // Check if user can access this material - must be enrolled or mentor
    if (!isEnrolled && !isMentor) {
      console.log("Access denied - not enrolled and not mentor");
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to access this material",
      });
    }

    console.log("Access granted!");

    // Handle different material access types
    if (material.type === "link" || material.type === "video") {
      // For links and videos, return the URL for frontend to handle
      return res.status(200).json({
        success: true,
        data: {
          type: material.type,
          title: material.title,
          content_url: material.content_url,
          action: "redirect", // Frontend should redirect/embed
        },
      });
    }

    // Handle file-based materials
    if (material.file_info && material.file_info.url) {
      const fileExtension = material.file_info.file_extension?.toLowerCase();
      const fileName = material.file_info.file_name || `file.${fileExtension}`;

      // Determine how to serve the file based on type and extension
      const viewableInBrowser = ["pdf", "jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension);

      const forceDownload = ["doc", "docx", "txt", "zip", "rar"].includes(fileExtension);

      if (material.type === "image" || (viewableInBrowser && !forceDownload)) {
        // For images and PDFs - return URL for inline viewing
        console.log("Serving file for inline view:", fileName);

        let viewUrl = material.file_info.url;

        // For PDF files, serve through our proxy endpoint for proper headers
        if (fileExtension === "pdf") {
          // Use our proxy endpoint instead of direct Cloudinary URL
          viewUrl = `${req.protocol}://${req.get("host")}/api/materials/${material._id}/pdf`;
        }

        return res.status(200).json({
          success: true,
          data: {
            type: material.type,
            title: material.title,
            file_url: viewUrl,
            file_name: fileName,
            file_type: material.file_info.file_type,
            action: "view", // Frontend should display inline
          },
        });
      } else {
        // For documents that need download (docx, etc)
        try {
          console.log("Force downloading file:", fileName);

          const response = await fetch(material.file_info.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Set headers for forced download
          res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
          res.setHeader("Content-Type", material.file_info.file_type || "application/octet-stream");
          if (material.file_info.file_size) {
            res.setHeader("Content-Length", material.file_info.file_size);
          }

          // Stream the file
          response.body.pipe(res);
        } catch (error) {
          console.error("Error downloading file:", error);
          return res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("View material error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while viewing material",
    });
  }
};

// Serve PDF files with proper headers for browser viewing
export const servePDF = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user?.userId;

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to access this material",
      });
    }

    const material = await materialModel.findById(materialId).populate("course_id", "title mentor_id").populate("mentor_id", "fullname username");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check access permissions
    const isMentor = material.mentor_id._id.toString() === userId;
    let isEnrolled = false;

    if (!isMentor) {
      const enrollment = await enrollmentModel.findOne({
        learner_id: userId,
        course_id: material.course_id._id,
      });
      isEnrolled = !!enrollment;
    }

    if (!isEnrolled && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to access this material",
      });
    }

    // Ensure it's a PDF file
    if (material.type !== "document" || material.file_info?.file_extension?.toLowerCase() !== "pdf") {
      return res.status(400).json({
        success: false,
        message: "This endpoint is only for PDF files",
      });
    }

    try {
      // Fetch PDF from Cloudinary
      const response = await fetch(material.file_info.url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Set proper headers for PDF viewing in browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline"); // This makes it view instead of download
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

      if (material.file_info.file_size) {
        res.setHeader("Content-Length", material.file_info.file_size);
      }

      // Stream the PDF content
      response.body.pipe(res);
    } catch (error) {
      console.error("Error serving PDF:", error);
      return res.status(500).json({
        success: false,
        message: "Error loading PDF file",
      });
    }
  } catch (error) {
    console.error("Serve PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while serving PDF",
    });
  }
};
