import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DashboardHomePage from "@/pages/dashboard/DashboardHomePage";
import DashboardProfilePage from "@/pages/dashboard/DashboardProfilePage";
import MyCoursesPage from "@/pages/dashboard/MyCoursesPage";
import DashboardBrowseCoursesPage from "@/pages/dashboard/DashboardBrowseCoursesPage";
import MyCourseManagementPage from "@/pages/dashboard/MyCourseManagementPage";
import CreateCoursePage from "@/pages/dashboard/CreateCoursePage";
import CourseMaterialsPage from "@/pages/dashboard/CourseMaterialsPage";
import MaterialViewPage from "@/pages/dashboard/MaterialViewPage";
import AssignmentDashboardPage from "@/pages/dashboard/AssignmentDashboardPage";
import CourseLearnPage from "@/pages/dashboard/CourseLearnPage";
import StudentAssignmentSubmissionPage from "@/pages/dashboard/StudentAssignmentSubmissionPage";
import AssignmentViewPage from "@/pages/dashboard/AssignmentViewPage";
import AssignmentSubmissionsPage from "@/pages/dashboard/AssignmentSubmissionsPage";
import CourseDetailDashboardPage from "@/pages/dashboard/CourseDetailDashboardPage";
import CourseDiscussionsPage from "@/pages/dashboard/CourseDiscussionsPage";
import MyCertificatesPage from "@/pages/dashboard/MyCertificatesPage";
import PublicCertificatePage from "@/pages/PublicCertificatePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthRoute from "@/components/AuthRoute";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Public Certificate Route */}
        <Route path="/certificate/:certificateId" element={<PublicCertificatePage />} />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="profile" element={<DashboardProfilePage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="browse-courses" element={<DashboardBrowseCoursesPage />} />
          <Route path="course/:id" element={<CourseDetailDashboardPage />} />
          <Route path="manage-courses" element={<MyCourseManagementPage />} />
          <Route path="course-learn/:courseId" element={<CourseLearnPage />} />
          <Route path="courses/:courseId/materials" element={<CourseMaterialsPage />} />
          <Route path="courses/:courseId/materials/:materialId" element={<MaterialViewPage />} />
          <Route path="courses/:courseId/assignments" element={<AssignmentDashboardPage />} />
          <Route path="courses/:courseId/assignments/:assignmentId" element={<AssignmentViewPage />} />
          <Route path="courses/:courseId/assignments/:assignmentId/submissions" element={<AssignmentSubmissionsPage />} />
          <Route path="courses/:courseId/discussions" element={<CourseDiscussionsPage />} />
          <Route path="courses/:courseId/assignments/:assignmentId/submit" element={<StudentAssignmentSubmissionPage />} />
          <Route path="certificates" element={<MyCertificatesPage />} />
          <Route path="assignments" element={<div className="text-white p-6">Assignments Page - Coming Soon</div>} />
          <Route path="progress" element={<div className="text-white p-6">Progress Page - Coming Soon</div>} />
          <Route path="my-teaching" element={<div className="text-white p-6">My Teaching Page - Coming Soon</div>} />
          <Route path="create-course" element={<CreateCoursePage />} />
          <Route path="students" element={<div className="text-white p-6">Students Page - Coming Soon</div>} />
          <Route path="discussions" element={<div className="text-white p-6">Discussions Page - Coming Soon</div>} />
          <Route path="events" element={<div className="text-white p-6">Events Page - Coming Soon</div>} />
          <Route path="achievements" element={<div className="text-white p-6">Achievements Page - Coming Soon</div>} />
          <Route path="analytics" element={<div className="text-white p-6">Analytics Page - Coming Soon</div>} />
          <Route path="settings" element={<div className="text-white p-6">Settings Page - Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
