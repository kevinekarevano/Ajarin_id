import dotenv from "dotenv";
import express from "express";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// DB Connection
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

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
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
