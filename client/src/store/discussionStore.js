import { create } from "zustand";
import api from "@/lib/api";
import toast from "react-hot-toast";

const useDiscussionStore = create((set, get) => ({
  // State
  discussions: [],
  currentDiscussion: null,
  replies: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDiscussions: 0,

  // Actions

  // Get discussions for a course
  fetchCourseDiscussions: async (courseId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const { type = "all", search = "", sortBy = "last_reply", page = 1, limit = 20 } = options;

      const params = new URLSearchParams({
        type,
        sortBy,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await api.get(`/discussions/course/${courseId}/discussions?${params}`);

      if (response.data.success) {
        set({
          discussions: response.data.data.discussions,
          currentPage: response.data.data.pagination.currentPage,
          totalPages: response.data.data.pagination.totalPages,
          totalDiscussions: response.data.data.pagination.totalDiscussions,
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch discussions",
      });

      return { success: false, error: error.response?.data?.message || "Failed to fetch discussions" };
    }
  },

  // Get discussions for mentor's course (simplified access)
  fetchMentorCourseDiscussions: async (courseId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const { type = "all", search = "", sortBy = "last_reply", page = 1, limit = 20 } = options;

      const params = new URLSearchParams({
        type,
        sortBy,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await api.get(`/discussions/mentor/course/${courseId}/discussions?${params}`);

      if (response.data.success) {
        set({
          discussions: response.data.data.discussions,
          currentPage: response.data.data.pagination.currentPage,
          totalPages: response.data.data.pagination.totalPages,
          totalDiscussions: response.data.data.pagination.totalDiscussions,
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error fetching mentor discussions:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch mentor discussions",
      });

      return { success: false, error: error.response?.data?.message || "Failed to fetch mentor discussions" };
    }
  },

  // Get single discussion with replies
  fetchDiscussion: async (discussionId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/discussions/${discussionId}`);

      if (response.data.success) {
        set({
          currentDiscussion: response.data.data.discussion,
          replies: response.data.data.replies || [],
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error fetching discussion:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch discussion";

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Create new discussion
  createDiscussion: async (courseId, discussionData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post(`/discussions/course/${courseId}/discussions`, discussionData);

      if (response.data.success) {
        const newDiscussion = response.data.data.discussion;

        set((state) => ({
          discussions: [newDiscussion, ...state.discussions],
          loading: false,
        }));

        toast.success("Discussion created successfully!");
        return { success: true, discussion: newDiscussion };
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
      const errorMessage = error.response?.data?.message || "Failed to create discussion";

      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create reply to discussion
  createReply: async (discussionId, replyData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post(`/replies/discussion/${discussionId}`, replyData);

      if (response.data.success) {
        const newReply = response.data.data.reply;

        set((state) => ({
          replies: [...state.replies, newReply],
          loading: false,
        }));

        // Update discussion reply count
        set((state) => ({
          discussions: state.discussions.map((discussion) => (discussion._id === discussionId ? { ...discussion, replies_count: (discussion.replies_count || 0) + 1 } : discussion)),
        }));

        toast.success("Reply posted successfully!");
        return { success: true, reply: newReply };
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      const errorMessage = error.response?.data?.message || "Failed to post reply";

      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update discussion
  updateDiscussion: async (discussionId, updateData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.put(`/discussions/${discussionId}`, updateData);

      if (response.data.success) {
        const updatedDiscussion = response.data.data.discussion;

        set((state) => ({
          discussions: state.discussions.map((discussion) => (discussion._id === discussionId ? updatedDiscussion : discussion)),
          currentDiscussion: state.currentDiscussion?._id === discussionId ? updatedDiscussion : state.currentDiscussion,
          loading: false,
        }));

        toast.success("Discussion updated successfully!");
        return { success: true, discussion: updatedDiscussion };
      }
    } catch (error) {
      console.error("Error updating discussion:", error);
      const errorMessage = error.response?.data?.message || "Failed to update discussion";

      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete discussion
  deleteDiscussion: async (discussionId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.delete(`/discussions/${discussionId}`);

      if (response.data.success) {
        set((state) => ({
          discussions: state.discussions.filter((discussion) => discussion._id !== discussionId),
          currentDiscussion: state.currentDiscussion?._id === discussionId ? null : state.currentDiscussion,
          loading: false,
        }));

        toast.success("Discussion deleted successfully!");
        return { success: true };
      }
    } catch (error) {
      console.error("Error deleting discussion:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete discussion";

      set({
        error: errorMessage,
        loading: false,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Clear current discussion and replies
  clearCurrentDiscussion: () => {
    set({
      currentDiscussion: null,
      replies: [],
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Search discussions
  searchDiscussions: async (courseId, query) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/discussions/course/${courseId}/discussions/search?q=${encodeURIComponent(query)}`);

      if (response.data.success) {
        set({
          discussions: response.data.data.discussions,
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error searching discussions:", error);
      const errorMessage = error.response?.data?.message || "Failed to search discussions";

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },
}));

export default useDiscussionStore;
