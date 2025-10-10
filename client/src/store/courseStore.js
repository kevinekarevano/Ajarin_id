import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import toast from "react-hot-toast";
import { tokenManager } from "@/lib/cookieAuth";
import { debugFormData } from "@/utils/debugCourse";

const useCourseStore = create(
  persist(
    (set, get) => ({
      // State
      courses: [],
      selectedCourse: null,
      loading: false,
      error: null,

      // Filters
      filters: {
        search: "",
        category: "all",
        status: "all",
        sortBy: "created_at",
        sortOrder: "desc",
        page: 1,
        limit: 10,
      },

      // Pagination
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCourses: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      // Fetch mentor's courses
      fetchMyCourses: async () => {
        try {
          set({ loading: true, error: null });

          // Check if user is authenticated using cookies
          const token = tokenManager.getToken();
          const user = tokenManager.getUserData();

          if (!token || !user) {
            throw new Error("User not authenticated");
          }

          console.log("CourseStore: Authentication check", {
            hasUser: !!user,
            userRole: user?.role,
            tokenValid: token && token !== "undefined" && token !== "null",
            token: token ? token.substring(0, 20) + "..." : null,
          });

          const { filters } = get();
          const params = new URLSearchParams();

          // Add filters to params
          Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") {
              params.append(key, value);
            }
          });

          console.log("Making request to:", `/courses/mentor/my-courses?${params.toString()}`);

          const response = await api.get(`/courses/mentor/my-courses?${params.toString()}`);

          console.log("Response received:", response.data);

          if (response.data.success) {
            set({
              courses: response.data.data.courses,
              pagination: response.data.data.pagination,
              loading: false,
            });
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
          console.error("Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: error.config,
          });

          set({
            error: error.response?.data?.message || error.message || "Gagal memuat kursus",
            loading: false,
          });

          // Don't show toast if it's an auth error (will be handled by interceptor)
          if (error.response?.status !== 401) {
            toast.error("Gagal memuat kursus");
          }
        }
      },

      // Create new course
      createCourse: async (courseData) => {
        try {
          set({ loading: true, error: null });

          // Prepare form data for file upload
          const formData = new FormData();
          formData.append("title", courseData.title);
          formData.append("description", courseData.description);
          formData.append("category", courseData.category);

          // Handle tags
          if (courseData.tags && Array.isArray(courseData.tags)) {
            courseData.tags.forEach((tag) => {
              if (tag && tag.trim()) formData.append("tags", tag.trim());
            });
          }

          // Handle cover image
          if (courseData.coverImage && courseData.coverImage instanceof File) {
            formData.append("cover", courseData.coverImage);
            console.log("=== CourseStore: Cover image added to FormData ===");
            console.log("File name:", courseData.coverImage.name);
            console.log("File size:", courseData.coverImage.size);
            console.log("File type:", courseData.coverImage.type);
          } else {
            console.log("=== CourseStore: No cover image provided ===");
            console.log("coverImage value:", courseData.coverImage);
            console.log("Is File instance:", courseData.coverImage instanceof File);
          }

          // Debug FormData before sending
          console.log("Sending FormData to backend:");
          debugFormData(formData);

          // Additional debug: check FormData size and entries
          console.log("FormData has entries:", formData.has("cover"));
          console.log("FormData entries count:", Array.from(formData.entries()).length);

          const response = await api.post("/courses", formData, {
            headers: {
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
          });

          if (response.data.success) {
            // Add new course to the beginning of the list
            set((state) => ({
              courses: [response.data.data.course, ...state.courses],
              loading: false,
            }));

            toast.success("Kursus berhasil dibuat!");
            return { success: true, course: response.data.data.course };
          }
        } catch (error) {
          console.error("Error creating course:", error);
          console.error("Error response:", error.response);
          console.error("Error request:", error.request);
          console.error("Error message:", error.message);

          const errorMessage = error.response?.data?.message || "Gagal membuat kursus";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Update course
      updateCourse: async (courseId, courseData) => {
        try {
          set({ loading: true, error: null });

          // Prepare form data for file upload
          const formData = new FormData();
          formData.append("title", courseData.title);
          formData.append("description", courseData.description);
          formData.append("category", courseData.category);

          // Handle tags
          if (courseData.tags && Array.isArray(courseData.tags)) {
            courseData.tags.forEach((tag) => {
              if (tag && tag.trim()) formData.append("tags", tag.trim());
            });
          }

          // Handle cover image (only if new file is provided)
          if (courseData.coverImage instanceof File) {
            formData.append("cover", courseData.coverImage);
            console.log("=== CourseStore: Updating course with new cover image ===");
            console.log("File name:", courseData.coverImage.name);
            console.log("File size:", courseData.coverImage.size);
            console.log("File type:", courseData.coverImage.type);
          } else {
            console.log("=== CourseStore: Updating course without new cover image ===");
          }

          // Debug FormData before sending
          console.log("Updating course FormData:");
          debugFormData(formData);

          const response = await api.put(`/courses/${courseId}`, formData, {
            headers: {
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
          });

          if (response.data.success) {
            // Update the course in the list
            set((state) => ({
              courses: state.courses.map((course) => (course._id === courseId ? response.data.data.course : course)),
              loading: false,
            }));

            toast.success("Kursus berhasil diperbarui!");
            return { success: true, course: response.data.data.course };
          }
        } catch (error) {
          console.error("Error updating course:", error);
          console.error("Error response:", error.response);
          console.error("Error request:", error.request);
          console.error("Error message:", error.message);

          const errorMessage = error.response?.data?.message || "Gagal memperbarui kursus";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Delete course
      deleteCourse: async (courseId) => {
        try {
          set({ loading: true, error: null });

          console.log("=== CourseStore: Deleting course ===");
          console.log("Course ID:", courseId);

          const response = await api.delete(`/courses/${courseId}`);

          if (response.data.success) {
            // Remove course from the list
            set((state) => ({
              courses: state.courses.filter((course) => course._id !== courseId),
              loading: false,
            }));

            toast.success("Kursus berhasil dihapus!");
            return { success: true };
          }
        } catch (error) {
          console.error("Error deleting course:", error);
          const errorMessage = error.response?.data?.message || "Gagal menghapus kursus";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Get single course details
      fetchCourseById: async (courseId) => {
        try {
          set({ loading: true, error: null });

          const response = await api.get(`/courses/${courseId}`);

          if (response.data.success) {
            set({
              selectedCourse: response.data.data.course,
              loading: false,
            });
            return { success: true, course: response.data.data.course };
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          const errorMessage = error.response?.data?.message || "Gagal memuat detail kursus";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Update course status (publish/unpublish/archive)
      updateCourseStatus: async (courseId, status) => {
        try {
          set({ loading: true, error: null });

          console.log("=== CourseStore: Updating course status ===");
          console.log("Course ID:", courseId);
          console.log("New status:", status);

          const response = await api.patch(`/courses/${courseId}/status`, { status });

          if (response.data.success) {
            // Update the course status in the list
            set((state) => ({
              courses: state.courses.map((course) => (course._id === courseId ? { ...course, status } : course)),
              loading: false,
            }));

            const statusLabels = {
              published: "dipublikasi",
              draft: "dijadikan draft",
              archived: "diarsipkan",
            };

            toast.success(`Kursus berhasil ${statusLabels[status]}!`);
            return { success: true };
          }
        } catch (error) {
          console.error("Error updating course status:", error);
          const errorMessage = error.response?.data?.message || "Gagal memperbarui status kursus";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Get course statistics
      fetchCourseStats: async () => {
        try {
          const response = await api.get("/courses/mentor/stats");

          if (response.data.success) {
            return { success: true, stats: response.data.data.stats };
          }
        } catch (error) {
          console.error("Error fetching course stats:", error);
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Clear selected course
      clearSelectedCourse: () => set({ selectedCourse: null }),

      // Reset filters
      resetFilters: () =>
        set({
          filters: {
            search: "",
            category: "all",
            status: "all",
            sortBy: "created_at",
            sortOrder: "desc",
            page: 1,
            limit: 10,
          },
        }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "course-store",
      partialize: (state) => ({
        // Only persist filters, not the actual data
        filters: state.filters,
      }),
    }
  )
);

export default useCourseStore;
