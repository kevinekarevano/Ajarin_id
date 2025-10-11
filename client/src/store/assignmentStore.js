import { create } from "zustand";
import api from "@/lib/api";
import toast from "react-hot-toast";

const useAssignmentStore = create((set, get) => ({
  // State
  assignments: [],
  selectedAssignment: null,
  submissions: [],
  selectedSubmission: null,
  loading: false,
  submissionLoading: false,
  error: null,

  // Assignment Management Actions (Mentor)

  // Create new assignment
  createAssignment: async (assignmentData) => {
    try {
      set({ loading: true, error: null });

      console.log("Creating assignment:", assignmentData);

      // Extract courseId from the data
      let courseId;
      if (assignmentData instanceof FormData) {
        courseId = assignmentData.get("course_id");
      } else {
        courseId = assignmentData.course_id;
      }

      if (!courseId) {
        throw new Error("Course ID is required to create assignment");
      }

      // Check if assignmentData is FormData (file upload)
      const config = {};
      if (assignmentData instanceof FormData) {
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await api.post(`/assignments/course/${courseId}/create`, assignmentData, config);

      if (response.data.success) {
        // Add new assignment to the list
        set((state) => ({
          assignments: [...state.assignments, response.data.data.assignment],
          loading: false,
        }));

        toast.success("Assignment berhasil dibuat!");
        return { success: true, assignment: response.data.data.assignment };
      }
    } catch (error) {
      console.error("Error creating assignment:", error);

      let errorMessage = "Gagal membuat assignment";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get assignments for a course
  fetchCourseAssignments: async (courseId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/assignments/course/${courseId}`);

      if (response.data.success) {
        const assignments = response.data.data.assignments || [];
        set({
          assignments: assignments.filter(Boolean), // Filter out null/undefined
          loading: false,
        });

        return { success: true, assignments };
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);

      const errorMessage = error.response?.data?.message || "Gagal mengambil assignments";
      set({
        error: errorMessage,
        loading: false,
        assignments: [],
      });

      return { success: false, error: errorMessage };
    }
  },

  // Get single assignment
  fetchAssignment: async (assignmentId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/assignments/${assignmentId}/details`);

      if (response.data.success) {
        set({
          selectedAssignment: response.data.data.assignment,
          selectedSubmission: response.data.data.submission,
          loading: false,
        });

        return {
          success: true,
          assignment: response.data.data.assignment,
          submission: response.data.data.submission,
          userInfo: response.data.data.user_info,
        };
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);

      const errorMessage = error.response?.data?.message || "Gagal mengambil assignment";
      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Update assignment
  updateAssignment: async (assignmentId, updateData) => {
    try {
      set({ loading: true, error: null });

      // Check if updateData is FormData (file upload)
      const config = {};
      if (updateData instanceof FormData) {
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await api.put(`/assignments/${assignmentId}/update`, updateData, config);

      if (response.data.success) {
        // Update assignment in list
        set((state) => ({
          assignments: (state.assignments || []).map((assignment) => (assignment && assignment._id === assignmentId ? response.data.data.assignment : assignment)).filter(Boolean),
          selectedAssignment: response.data.data.assignment,
          loading: false,
        }));

        // Don't show toast here, let the calling component handle it
        return { success: true, assignment: response.data.data.assignment };
      }
    } catch (error) {
      console.error("Error updating assignment:", error);

      const errorMessage = error.response?.data?.message || "Gagal memperbarui assignment";
      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete assignment
  deleteAssignment: async (assignmentId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.delete(`/assignments/${assignmentId}/delete`);

      if (response.data.success) {
        // Remove assignment from list
        set((state) => ({
          assignments: state.assignments.filter((assignment) => assignment._id !== assignmentId),
          selectedAssignment: null,
          loading: false,
        }));

        return { success: true };
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);

      const errorMessage = error.response?.data?.message || "Gagal menghapus assignment";
      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Reorder assignments
  reorderAssignments: async (courseId, assignmentOrders) => {
    try {
      set({ loading: true, error: null });

      const response = await api.patch(`/assignments/course/${courseId}/reorder`, {
        assignmentOrders,
      });

      if (response.data.success) {
        // Refresh assignments list
        await get().fetchCourseAssignments(courseId);

        toast.success("Urutan assignment berhasil diubah!");
        return { success: true };
      }
    } catch (error) {
      console.error("Error reordering assignments:", error);

      const errorMessage = error.response?.data?.message || "Gagal mengubah urutan assignment";
      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Student Submission Actions

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      set({ submissionLoading: true, error: null });

      // Prepare FormData for file uploads
      const formData = new FormData();

      // Add submission data
      Object.keys(submissionData).forEach((key) => {
        if (key === "file" && submissionData[key]) {
          formData.append("file", submissionData[key]);
        } else if (submissionData[key] !== null && submissionData[key] !== undefined) {
          formData.append(key, submissionData[key]);
        }
      });

      const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for large files
      });

      if (response.data.success) {
        set({
          selectedSubmission: response.data.data.submission,
          submissionLoading: false,
        });

        toast.success("Assignment berhasil disubmit!");
        return { success: true, submission: response.data.data.submission };
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);

      let errorMessage = "Gagal submit assignment";
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Upload timeout - File terlalu besar atau koneksi lambat";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({
        error: errorMessage,
        submissionLoading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get assignment submissions (Mentor)
  fetchAssignmentSubmissions: async (assignmentId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/assignments/${assignmentId}/submissions`);

      if (response.data.success) {
        set({
          submissions: response.data.data.submissions,
          loading: false,
        });

        return { success: true, submissions: response.data.data.submissions };
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);

      const errorMessage = error.response?.data?.message || "Gagal mengambil submissions";
      set({
        error: errorMessage,
        loading: false,
        submissions: [],
      });

      return { success: false, error: errorMessage };
    }
  },

  // Grade submission (Mentor)
  gradeSubmission: async (submissionId, gradeData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post(`/assignments/submissions/${submissionId}/grade`, gradeData);

      if (response.data.success) {
        // Update submission in list
        set((state) => ({
          submissions: state.submissions.map((submission) => (submission._id === submissionId ? response.data.data.submission : submission)),
          loading: false,
        }));

        toast.success("Submission berhasil dinilai!");
        return { success: true, submission: response.data.data.submission };
      }
    } catch (error) {
      console.error("Error grading submission:", error);

      const errorMessage = error.response?.data?.message || "Gagal menilai submission";
      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Student Functions

  // Get assignment by ID for student view
  fetchAssignmentById: async (assignmentId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/assignments/${assignmentId}/details`);

      if (response.data.success) {
        const { assignment, userSubmission, canSubmit } = response.data.data;

        set({
          selectedAssignment: assignment,
          loading: false,
        });

        return {
          success: true,
          assignment: assignment,
          userSubmission: userSubmission,
          canSubmit: canSubmit,
        };
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      const errorMessage = error.response?.data?.message || "Gagal mengambil assignment";
      set({
        error: errorMessage,
        loading: false,
        selectedAssignment: null,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Get user's submission status for an assignment
  getSubmissionStatus: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}/submission`);

      if (response.data.success) {
        const submission = response.data.data.submission;
        set((state) => ({
          selectedSubmission: submission,
          submissions: state.submissions.filter((s) => s.assignment_id !== assignmentId).concat(submission ? [submission] : []),
        }));

        return { success: true, submission };
      }
    } catch (error) {
      console.error("Error fetching submission status:", error);
      // 404 is expected when no submission exists yet
      if (error.response?.status === 404) {
        return { success: true, submission: null };
      }

      const errorMessage = error.response?.data?.message || "Gagal mengambil status pengumpulan";
      return { success: false, error: errorMessage };
    }
  },

  // Submit assignment (create or update submission)
  submitAssignmentWork: async (assignmentId, submissionData) => {
    try {
      set({ submissionLoading: true, error: null });

      const formData = new FormData();

      // Add text content if provided
      if (submissionData.textContent && submissionData.textContent.trim()) {
        formData.append("textContent", submissionData.textContent.trim());
      }

      // Add files if provided
      if (submissionData.files && submissionData.files.length > 0) {
        submissionData.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      console.log("FormData being sent:", {
        hasText: formData.has("textContent"),
        fileCount: formData.getAll("files").length,
      });

      const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const submission = response.data.data.submission;

        set((state) => ({
          selectedSubmission: submission,
          submissions: state.submissions.filter((s) => s.assignment_id !== assignmentId).concat([submission]),
          submissionLoading: false,
        }));

        return { success: true, submission };
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      const errorMessage = error.response?.data?.message || "Gagal mengumpulkan tugas";
      set({
        error: errorMessage,
        submissionLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Clear data
  clearAssignments: () => {
    set({
      assignments: [],
      selectedAssignment: null,
      submissions: [],
      selectedSubmission: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export { useAssignmentStore };
export default useAssignmentStore;
