import dotenv from "dotenv";
import express from "express";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import materialRoutes from "./routes/material.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import replyRoutes from "./routes/reply.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize server
const startServer = async () => {
  try {
    // DB Connection
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Don't exit in serverless, just log error
  }
};

// Start server initialization
startServer();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/forum", discussionRoutes);
app.use("/api/forum", replyRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to Ajarin ID API!",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile",
      },
      courses: {
        getAllCourses: "GET /api/courses",
        searchCourses: "GET /api/courses/search?q=query",
        getCourse: "GET /api/courses/:id",
        createCourse: "POST /api/courses",
        myCourses: "GET /api/courses/mentor/my-courses",
        updateCourse: "PUT /api/courses/:id",
        deleteCourse: "DELETE /api/courses/:id",
        changeStatus: "PATCH /api/courses/:id/status",
      },
      enrollments: {
        enrollToCourse: "POST /api/enrollments/enroll/:courseId",
        unenrollFromCourse: "DELETE /api/enrollments/unenroll/:courseId",
        myEnrolledCourses: "GET /api/enrollments/my-courses",
        enrollmentDetails: "GET /api/enrollments/course/:courseId",
        updateProgress: "PATCH /api/enrollments/course/:courseId/progress",
        learningStats: "GET /api/enrollments/stats",
        checkEnrollment: "GET /api/enrollments/check/:courseId",
        courseStudents: "GET /api/enrollments/course/:courseId/students",
        mentorOverview: "GET /api/enrollments/mentor/overview",
      },
      materials: {
        getCourseMaterials: "GET /api/materials/course/:courseId",
        getMaterial: "GET /api/materials/:materialId",
        viewMaterial: "GET /api/materials/:materialId/view",
        servePDF: "GET /api/materials/:materialId/pdf",
        createMaterial: "POST /api/materials",
        myMaterials: "GET /api/materials/mentor/my-materials",
        updateMaterial: "PUT /api/materials/:materialId",
        deleteMaterial: "DELETE /api/materials/:materialId",
        reorderMaterials: "PATCH /api/materials/course/:courseId/reorder",
      },
      progress: {
        getMaterialProgress: "GET /api/progress/material/:materialId",
        updateProgress: "PUT /api/progress/material/:materialId",
        addNote: "POST /api/progress/material/:materialId/note",
        rateMaterial: "POST /api/progress/material/:materialId/rate",
        getCourseProgress: "GET /api/progress/course/:courseId",
        getLeaderboard: "GET /api/progress/course/:courseId/leaderboard",
        getUserAnalytics: "GET /api/progress/analytics",
      },
      assignments: {
        submitAssignment: "POST /api/assignments/:assignmentId/submit",
        getMySubmissions: "GET /api/assignments/my-submissions",
        getSubmission: "GET /api/assignments/submission/:submissionId",
        gradeAssignment: "POST /api/assignments/submission/:submissionId/grade",
        returnForRevision: "POST /api/assignments/submission/:submissionId/return",
        getSubmissionsForGrading: "GET /api/assignments/grading",
        getAssignmentStats: "GET /api/assignments/:assignmentId/stats",
      },
      forum: {
        // Discussions
        getCourseDiscussions: "GET /api/forum/course/:courseId/discussions",
        createDiscussion: "POST /api/forum/course/:courseId/discussions",
        getDiscussion: "GET /api/forum/discussions/:discussionId",
        updateDiscussion: "PUT /api/forum/discussions/:discussionId",
        deleteDiscussion: "DELETE /api/forum/discussions/:discussionId",
        likeDiscussion: "POST /api/forum/discussions/:discussionId/like",
        pinDiscussion: "POST /api/forum/discussions/:discussionId/pin",
        lockDiscussion: "POST /api/forum/discussions/:discussionId/lock",
        markResolved: "POST /api/forum/discussions/:discussionId/resolve",
        searchDiscussions: "GET /api/forum/course/:courseId/discussions/search",
        // Replies
        createReply: "POST /api/forum/discussions/:discussionId/replies",
        updateReply: "PUT /api/forum/replies/:replyId",
        deleteReply: "DELETE /api/forum/replies/:replyId",
        likeReply: "POST /api/forum/replies/:replyId/like",
        markBestAnswer: "POST /api/forum/replies/:replyId/best-answer",
        getNestedReplies: "GET /api/forum/replies/:replyId/nested",
        searchReplies: "GET /api/forum/discussions/:discussionId/replies/search",
      },
    },
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
