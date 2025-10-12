import { create } from "zustand";
import api from "@/lib/api";
import toast from "react-hot-toast";

const useCertificateStore = create((set, get) => ({
  // State
  certificates: [],
  currentCertificate: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCertificates: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Actions

  // Generate certificate for a course
  generateCertificate: async (courseId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post(`/certificates/generate/${courseId}`);

      if (response.data.success) {
        const newCertificate = response.data.data.certificate;

        // Add to certificates list
        set((state) => ({
          certificates: [newCertificate, ...state.certificates],
          currentCertificate: newCertificate,
          loading: false,
        }));

        toast.success("🎉 Sertifikat berhasil digenerate!");
        return { success: true, certificate: newCertificate };
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      const errorMessage = error.response?.data?.message || "Failed to generate certificate";

      // Handle specific error cases
      if (error.response?.status === 409) {
        // Certificate already exists
        const existingCertificate = error.response.data.data?.certificate;
        if (existingCertificate) {
          set({ currentCertificate: existingCertificate, loading: false });
          toast.error("Sertifikat sudah pernah diklaim untuk kursus ini");
          return { success: false, error: errorMessage, certificate: existingCertificate };
        }
      } else if (error.response?.status === 400) {
        // Course not completed
        const progressData = error.response.data.data;
        toast.error(`Kursus belum selesai. Progress: ${progressData?.completionPercentage || 0}%`);
      } else {
        toast.error(errorMessage);
      }

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Check if user can claim certificate
  checkCertificateEligibility: async (courseId) => {
    try {
      const response = await api.get(`/certificates/eligibility/${courseId}`);

      if (response.data.success) {
        const eligibilityData = response.data.data;
        return { success: true, data: eligibilityData };
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      const errorMessage = error.response?.data?.message || "Failed to check eligibility";
      return { success: false, error: errorMessage };
    }
  },

  // Get user's certificates
  fetchUserCertificates: async (options = {}) => {
    try {
      set({ loading: true, error: null });

      const { page = 1, limit = 10 } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/certificates/my-certificates?${params}`);

      if (response.data.success) {
        set({
          certificates: response.data.data.certificates,
          pagination: response.data.data.pagination,
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch certificates";

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Get public certificate (no auth required)
  fetchPublicCertificate: async (certificateId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/certificates/public/${certificateId}`);

      if (response.data.success) {
        const certificate = response.data.data.certificate;

        set({
          currentCertificate: certificate,
          loading: false,
        });

        return { success: true, certificate };
      }
    } catch (error) {
      console.error("Error fetching public certificate:", error);
      const errorMessage = error.response?.data?.message || "Certificate not found";

      set({
        error: errorMessage,
        loading: false,
        currentCertificate: null,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Get user's certificate by ID
  fetchCertificate: async (certificateId) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/certificates/${certificateId}`);

      if (response.data.success) {
        const certificate = response.data.data.certificate;

        set({
          currentCertificate: certificate,
          loading: false,
        });

        return { success: true, certificate };
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      const errorMessage = error.response?.data?.message || "Certificate not found";

      set({
        error: errorMessage,
        loading: false,
        currentCertificate: null,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(`/certificates/download/${certificateId}`);

      if (response.data.success) {
        const certificate = response.data.data.certificate;
        toast.success("Sertifikat siap diunduh");
        return { success: true, certificate };
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      const errorMessage = error.response?.data?.message || "Failed to download certificate";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Verify certificate
  verifyCertificate: async (certificateNumber) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/certificates/verify/${certificateNumber}`);

      if (response.data.success) {
        const verificationData = response.data.data;

        set({ loading: false });
        return { success: true, data: verificationData };
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      const errorMessage = error.response?.data?.message || "Certificate verification failed";

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Get course certificates (for mentors)
  fetchCourseCertificates: async (courseId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const { page = 1, limit = 10 } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/certificates/course/${courseId}?${params}`);

      if (response.data.success) {
        set({
          certificates: response.data.data.certificates,
          pagination: response.data.data.pagination,
          loading: false,
        });

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Error fetching course certificates:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch course certificates";

      set({
        error: errorMessage,
        loading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // Share certificate
  shareCertificate: async (certificate, platform = "copy") => {
    try {
      const shareData = {
        title: `Sertifikat ${certificate.course_title} - ${certificate.recipient_name}`,
        text: `Saya telah menyelesaikan course "${certificate.course_title}" di Ajarin.id dan mendapatkan sertifikat!`,
        url: certificate.public_url,
      };

      if (platform === "copy") {
        await navigator.clipboard.writeText(certificate.public_url);
        toast.success("Link sertifikat berhasil disalin!");
        return { success: true };
      }

      if (platform === "whatsapp") {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n\nLihat sertifikat saya: ${shareData.url}`)}`;
        window.open(whatsappUrl, "_blank");
        return { success: true };
      }

      if (platform === "linkedin") {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
        window.open(linkedinUrl, "_blank");
        return { success: true };
      }

      if (platform === "twitter") {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(twitterUrl, "_blank");
        return { success: true };
      }

      // Native Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
        return { success: true };
      }

      return { success: false, error: "Sharing not supported" };
    } catch (error) {
      console.error("Error sharing certificate:", error);
      toast.error("Gagal membagikan sertifikat");
      return { success: false, error: error.message };
    }
  },

  // Clear current certificate
  clearCurrentCertificate: () => {
    set({ currentCertificate: null, error: null });
  },

  // Clear certificates list
  clearCertificates: () => {
    set({ certificates: [], pagination: { currentPage: 1, totalPages: 1, totalCertificates: 0, hasNextPage: false, hasPrevPage: false } });
  },

  // Reset store
  resetStore: () => {
    set({
      certificates: [],
      currentCertificate: null,
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCertificates: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  },
}));

export default useCertificateStore;
