import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { tokenManager } from "../lib/cookieAuth";
import toast from "react-hot-toast";

const useMaterialStore = create(
  persist(
    (set, get) => ({
      // State
      materials: [],
      selectedMaterial: null,
      loading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Fetch materials for a course
      fetchCourseMaterials: async (courseId) => {
        try {
          set({ loading: true, error: null });

          const token = tokenManager.getToken();
          if (!token) {
            const error = "No authentication token found. Please login again.";
            set({ error, loading: false });
            return { success: false, error };
          }

          const response = await api.get(`/materials/course/${courseId}`);

          if (response.data.success) {
            console.log("Materials fetched successfully:", response.data.data.materials.length);
            set({
              materials: response.data.data.materials,
              loading: false,
            });
            return { success: true, materials: response.data.data.materials };
          }
        } catch (error) {
          console.error("Error fetching course materials:", error);
          console.error("Error status:", error.response?.status);
          console.error("Error data:", error.response?.data);

          const errorMessage = error.response?.data?.message || "Gagal memuat materi";
          set({
            error: errorMessage,
            loading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Create new material
      createMaterial: async (materialData) => {
        try {
          set({ loading: true, error: null });

          console.log("=== Creating Material ===");
          console.log("Material data:", materialData);

          // Prepare form data for file upload
          const formData = new FormData();
          formData.append("course_id", materialData.course_id);
          formData.append("title", materialData.title);
          formData.append("description", materialData.description || "");
          formData.append("type", materialData.type);
          formData.append("chapter", materialData.chapter || "");

          // Handle different material types
          if (materialData.type === "video" || materialData.type === "link") {
            formData.append("content_url", materialData.content_url);
          }

          if (materialData.duration_minutes) {
            formData.append("duration_minutes", materialData.duration_minutes);
          }

          // Handle file upload for document/image types
          if (materialData.file instanceof File) {
            formData.append("file", materialData.file);

            const fileSizeMB = (materialData.file.size / (1024 * 1024)).toFixed(2);
            console.log("File attached:", {
              name: materialData.file.name,
              size: `${fileSizeMB} MB`,
              type: materialData.file.type,
            });

            // Show warning for large files
            if (materialData.file.size > 50 * 1024 * 1024) {
              // 50MB
              console.warn(`Large file detected: ${fileSizeMB} MB - Upload may take longer`);
            }
          }

          // Debug FormData
          console.log("FormData entries:");
          for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(`${key}:`, {
                name: value.name,
                size: value.size,
                type: value.type,
              });
            } else {
              console.log(`${key}:`, value);
            }
          }

          const response = await api.post("/materials", formData, {
            headers: {
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
            timeout: 600000, // 10 minutes timeout for large files
            onUploadProgress: (progressEvent) => {
              if (progressEvent.lengthComputable) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload Progress: ${percentCompleted}%`);
                // You can emit progress here if needed
              }
            },
          });

          if (response.data.success) {
            // Add new material to the list
            set((state) => ({
              materials: [...state.materials, response.data.data.material],
              loading: false,
            }));

            toast.success("Materi berhasil dibuat!");
            return { success: true, material: response.data.data.material };
          }
        } catch (error) {
          console.error("Error creating material:", error);
          console.error("Error response:", error.response);

          let errorMessage = "Gagal membuat materi";

          // Handle specific error types
          if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            errorMessage = "Upload timeout - File terlalu besar atau koneksi lambat. Coba lagi dengan file yang lebih kecil.";
          } else if (error.response?.status === 413) {
            errorMessage = "File terlalu besar. Maksimal 100MB.";
          } else if (error.response?.status === 400 && error.response?.data?.message?.includes("File too large")) {
            errorMessage = "File terlalu besar. Kompres file atau gunakan file yang lebih kecil.";
          } else if (error.response?.data?.message) {
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

      // Update material
      updateMaterial: async (materialId, materialData) => {
        try {
          set({ loading: true, error: null });

          const formData = new FormData();
          formData.append("title", materialData.title);
          formData.append("description", materialData.description || "");
          formData.append("type", materialData.type);
          formData.append("chapter", materialData.chapter || "");

          if (materialData.type === "video" || materialData.type === "link") {
            formData.append("content_url", materialData.content_url);
          }

          if (materialData.duration_minutes) {
            formData.append("duration_minutes", materialData.duration_minutes);
          }

          // Handle file upload (only if new file is provided)
          if (materialData.file instanceof File) {
            formData.append("file", materialData.file);
          }

          const response = await api.put(`/materials/${materialId}`, formData, {
            headers: {
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
          });

          if (response.data.success) {
            // Update material in the list
            set((state) => ({
              materials: state.materials.map((material) => (material._id === materialId ? response.data.data.material : material)),
              loading: false,
            }));

            toast.success("Materi berhasil diperbarui!");
            return { success: true, material: response.data.data.material };
          }
        } catch (error) {
          console.error("Error updating material:", error);
          const errorMessage = error.response?.data?.message || "Gagal memperbarui materi";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Delete material
      deleteMaterial: async (materialId) => {
        try {
          set({ loading: true, error: null });

          const response = await api.delete(`/materials/${materialId}`);

          if (response.data.success) {
            // Remove material from the list
            set((state) => ({
              materials: state.materials.filter((material) => material._id !== materialId),
              loading: false,
            }));

            toast.success("Materi berhasil dihapus!");
            return { success: true };
          }
        } catch (error) {
          console.error("Error deleting material:", error);
          const errorMessage = error.response?.data?.message || "Gagal menghapus materi";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Reorder materials
      reorderMaterials: async (courseId, materialOrders) => {
        try {
          set({ loading: true, error: null });

          const response = await api.patch(`/materials/course/${courseId}/reorder`, {
            materials: materialOrders,
          });

          if (response.data.success) {
            // Update materials order in state
            set((state) => ({
              materials: response.data.data.materials,
              loading: false,
            }));

            toast.success("Urutan materi berhasil diperbarui!");
            return { success: true, materials: response.data.data.materials };
          }
        } catch (error) {
          console.error("Error reordering materials:", error);
          const errorMessage = error.response?.data?.message || "Gagal mengubah urutan materi";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Get single material
      fetchMaterial: async (materialId) => {
        try {
          set({ loading: true, error: null });

          const response = await api.get(`/materials/${materialId}`);

          if (response.data.success) {
            set({
              selectedMaterial: response.data.data.material,
              loading: false,
            });
            return { success: true, material: response.data.data.material };
          }
        } catch (error) {
          console.error("Error fetching material:", error);
          const errorMessage = error.response?.data?.message || "Gagal memuat detail materi";
          set({
            error: errorMessage,
            loading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Clear materials
      clearMaterials: () => set({ materials: [], selectedMaterial: null, error: null }),

      // Clear error
      clearError: () => set({ error: null }),

      // Progress tracking functions
      toggleMaterialCompletion: async (materialId, completed) => {
        try {
          set({ loading: true, error: null });

          const token = tokenManager.getToken();
          if (!token) {
            const error = "No authentication token found. Please login again.";
            set({ error, loading: false });
            return { success: false, error };
          }

          const response = await api.post(`/progress/material/${materialId}/toggle`, {
            completed,
          });

          if (response.data.success) {
            console.log("Material completion toggled:", response.data);
            set({ loading: false });

            // Update selectedMaterial if it's the same material
            const currentSelected = get().selectedMaterial;
            if (currentSelected && currentSelected._id === materialId) {
              set({
                selectedMaterial: {
                  ...currentSelected,
                  isCompleted: completed,
                },
              });
            }

            toast.success(response.data.message);
            return { success: true, progress: response.data.data.progress };
          }
        } catch (error) {
          console.error("Error toggling material completion:", error);
          const errorMessage = error.response?.data?.message || "Gagal mengupdate progress";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getMaterialProgress: async (materialId) => {
        try {
          const token = tokenManager.getToken();
          if (!token) {
            return { success: false, error: "No authentication token found" };
          }

          const response = await api.get(`/progress/material/${materialId}`);

          if (response.data.success) {
            return { success: true, progress: response.data.data.progress };
          }
        } catch (error) {
          console.error("Error fetching material progress:", error);
          const errorMessage = error.response?.data?.message || "Gagal memuat progress";
          return { success: false, error: errorMessage };
        }
      },

      getCourseProgress: async (courseId) => {
        try {
          const token = tokenManager.getToken();
          if (!token) {
            return { success: false, error: "No authentication token found" };
          }

          const response = await api.get(`/progress/course/${courseId}`);

          if (response.data.success) {
            console.log("Course progress API response:", response.data.data);
            return { success: true, progress: response.data.data };
          }
        } catch (error) {
          console.error("Error fetching course progress:", error);
          const errorMessage = error.response?.data?.message || "Gagal memuat course progress";
          return { success: false, error: errorMessage };
        }
      },
    }),
    {
      name: "material-storage",
      partialize: (state) => ({
        // Only persist materials, not loading states
        materials: state.materials,
        selectedMaterial: state.selectedMaterial,
      }),
    }
  )
);

export default useMaterialStore;
