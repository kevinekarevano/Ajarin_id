import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router";
import { AssignmentManagement } from "@/components/assignment/AssignmentManagement";
import useCourseStore from "@/store/courseStore";
import useAuthStore from "@/store/authStore";
import { Loader2 } from "lucide-react";

export function AssignmentDashboardPage() {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const { courses, loading, fetchMyCourses } = useCourseStore();
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (user && !courses.length) {
      fetchMyCourses();
    }
  }, [user, courses.length, fetchMyCourses]);

  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find((c) => c._id === courseId || c.id === courseId);
      setSelectedCourse(course || null);
    }
  }, [courseId, courses]);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to this course (mentor or enrolled student)
  // If course is in user's fetchMyCourses result, they are the mentor
  const isInMyCourses = courses.some((c) => c._id === courseId || c.id === courseId);
  const hasAccess = selectedCourse && (selectedCourse.mentor?._id === user._id || selectedCourse.enrolled_students?.some((student) => student._id === user._id) || isInMyCourses); // If course is in my courses, user is the mentor

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-400">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (courseId && !selectedCourse && !loading && courses.length > 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
        <p className="text-slate-400 mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
        <p className="text-sm text-slate-500">Course ID: {courseId}</p>
        <p className="text-sm text-slate-500 mt-2">Available courses: {courses.map((c) => c.title).join(", ")}</p>
      </div>
    );
  }

  // If we have courseId but no courses loaded yet, show loading
  if (courseId && courses.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Loading Course...</h1>
        <p className="text-slate-400">Fetching course information...</p>
      </div>
    );
  }

  if (selectedCourse && !hasAccess) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-slate-400">You don't have permission to access assignments for this course.</p>
      </div>
    );
  }

  // Determine user role
  const userRole = selectedCourse?.mentor_id?._id === user._id || selectedCourse?.mentor_id === user._id ? "mentor" : "student";

  // Create a fallback course object if needed
  const courseToUse = selectedCourse || {
    _id: courseId,
    title: `Course ${courseId}`,
    description: "Course loaded for assignment management",
  };

  return (
    <div className="space-y-6">
      <AssignmentManagement course={courseToUse} userRole={userRole} />
    </div>
  );
}

export default AssignmentDashboardPage;
