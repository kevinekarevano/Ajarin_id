import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import api from "@/lib/api";

const useEnrollmentStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    enrolledCourses: [],
    enrollmentStatus: {},
    learningStats: null,
    loading: false,
    error: null,

    // Pagination
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalEnrollments: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Check enrollment status for a course
    checkEnrollmentStatus: async (courseId) => {
      try {
        set((state) => ({
          enrollmentStatus: {
            ...state.enrollmentStatus,
            [courseId]: { loading: true },
          },
        }));

        const response = await api.get(`/enrollments/check/${courseId}`);

        set((state) => ({
          enrollmentStatus: {
            ...state.enrollmentStatus,
            [courseId]: {
              loading: false,
              isEnrolled: response.data.data.isEnrolled,
              enrollment: response.data.data.enrollment,
            },
          },
        }));

        return response.data.data;
      } catch (error) {
        console.error("Check enrollment status error:", error);
        set((state) => ({
          enrollmentStatus: {
            ...state.enrollmentStatus,
            [courseId]: { loading: false, error: error.message },
          },
        }));
        throw error;
      }
    },

    // Enroll to a course
    enrollToCourse: async (courseId) => {
      try {
        set({ loading: true, error: null });

        const response = await api.post(`/enrollments/enroll/${courseId}`);

        // Update enrollment status
        set((state) => ({
          loading: false,
          enrollmentStatus: {
            ...state.enrollmentStatus,
            [courseId]: {
              loading: false,
              isEnrolled: true,
              enrollment: response.data.data.enrollment,
            },
          },
        }));

        // Refresh enrolled courses if they exist
        const { enrolledCourses } = get();
        if (enrolledCourses.length > 0) {
          get().fetchMyEnrolledCourses();
        }

        return response.data.data;
      } catch (error) {
        console.error("Enroll to course error:", error);
        set({
          loading: false,
          error: error.response?.data?.message || "Failed to enroll to course",
        });
        throw error;
      }
    },

    // Unenroll from a course
    unenrollFromCourse: async (courseId) => {
      try {
        set({ loading: true, error: null });

        await api.delete(`/enrollments/unenroll/${courseId}`);

        // Update enrollment status
        set((state) => ({
          loading: false,
          enrollmentStatus: {
            ...state.enrollmentStatus,
            [courseId]: {
              loading: false,
              isEnrolled: false,
              enrollment: null,
            },
          },
          // Remove from enrolled courses
          enrolledCourses: state.enrolledCourses.filter((course) => course.course_id._id !== courseId),
        }));

        return true;
      } catch (error) {
        console.error("Unenroll from course error:", error);
        set({
          loading: false,
          error: error.response?.data?.message || "Failed to unenroll from course",
        });
        throw error;
      }
    },

    // Fetch my enrolled courses
    fetchMyEnrolledCourses: async (params = {}) => {
      try {
        set({ loading: true, error: null });

        const queryParams = new URLSearchParams({
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
          ...(params.sort && { sort: params.sort }),
        });

        const response = await api.get(`/enrollments/my-courses?${queryParams}`);
        const { enrollments, pagination } = response.data.data;

        set({
          loading: false,
          enrolledCourses: enrollments,
          pagination,
        });

        return response.data.data;
      } catch (error) {
        console.error("Fetch enrolled courses error:", error);
        set({
          loading: false,
          error: error.response?.data?.message || "Failed to fetch enrolled courses",
        });
        throw error;
      }
    },

    // Update course progress
    updateProgress: async (courseId, progressData) => {
      try {
        const response = await api.patch(`/enrollments/course/${courseId}/progress`, progressData);

        // Update local state
        set((state) => ({
          enrolledCourses: state.enrolledCourses.map((course) =>
            course.course_id._id === courseId
              ? {
                  ...course,
                  progress_percentage: progressData.progress_percentage,
                  last_accessed: new Date().toISOString(),
                }
              : course
          ),
        }));

        return response.data.data;
      } catch (error) {
        console.error("Update progress error:", error);
        set({ error: error.response?.data?.message || "Failed to update progress" });
        throw error;
      }
    },

    // Get enrollment details for a course
    getEnrollmentDetails: async (courseId) => {
      try {
        const response = await api.get(`/enrollments/course/${courseId}`);
        return response.data.data;
      } catch (error) {
        console.error("Get enrollment details error:", error);
        throw error;
      }
    },

    // Get learning statistics
    fetchLearningStats: async () => {
      try {
        const response = await api.get("/enrollments/stats");
        set({ learningStats: response.data.data });
        return response.data.data;
      } catch (error) {
        console.error("Fetch learning stats error:", error);
        set({ error: error.response?.data?.message || "Failed to fetch learning stats" });
        throw error;
      }
    },

    // Utility functions
    getCourseEnrollmentStatus: (courseId) => {
      const { enrollmentStatus } = get();
      return enrollmentStatus[courseId] || { loading: false, isEnrolled: false };
    },

    isEnrolledInCourse: (courseId) => {
      const status = get().getCourseEnrollmentStatus(courseId);
      return status.isEnrolled;
    },

    // Reset store
    reset: () => {
      set({
        enrolledCourses: [],
        enrollmentStatus: {},
        learningStats: null,
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalEnrollments: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    },
  }))
);

export default useEnrollmentStore;
