import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, Video, Image as ImageIcon, Link as LinkIcon, Download, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, HardDrive, CheckCircle, Lock, Loader2, Timer } from "lucide-react";
import useMaterialStore from "@/store/materialStore";
import useCourseStore from "@/store/courseStore";
import { tokenManager } from "@/lib/cookieAuth";
import toast from "react-hot-toast";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return null;

  const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!numBytes || numBytes === 0) return null;

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const MATERIAL_TYPE_CONFIG = {
  document: { icon: FileText, label: "Dokumen", color: "bg-blue-500/10 text-blue-400" },
  image: { icon: ImageIcon, label: "Gambar", color: "bg-green-500/10 text-green-400" },
  video: { icon: Video, label: "Video", color: "bg-red-500/10 text-red-400" },
  link: { icon: LinkIcon, label: "Link", color: "bg-purple-500/10 text-purple-400" },
};

export default function MaterialViewPage() {
  const { courseId, materialId } = useParams();
  const navigate = useNavigate();
  const [materialProgress, setMaterialProgress] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const { selectedMaterial, materials, fetchMaterial, fetchCourseMaterials, loading, toggleMaterialCompletion, getMaterialProgress } = useMaterialStore();

  const { selectedCourse, fetchCourseById } = useCourseStore();

  const handleDownload = async () => {
    if (selectedMaterial && selectedMaterial._id) {
      try {
        const token = tokenManager.getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/materials/${selectedMaterial._id}/download`, {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Get filename from Content-Disposition header
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = selectedMaterial.file_info?.file_name || selectedMaterial.title || "download";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "");
            }
          }

          // Create blob and download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          console.error("Download failed:", response.statusText);
        }
      } catch (error) {
        console.error("Download error:", error);
      }
    }
  };

  useEffect(() => {
    if (courseId && materialId) {
      // Clear any existing redirect interval
      if (window.materialRedirectInterval) {
        clearInterval(window.materialRedirectInterval);
        window.materialRedirectInterval = null;
      }

      // Reset redirect state when material changes
      setIsRedirecting(false);
      setRedirectCountdown(0);

      fetchCourseById(courseId);
      fetchCourseMaterials(courseId);
      fetchMaterial(materialId);
      loadMaterialProgress();
    }

    // Cleanup on unmount
    return () => {
      if (window.materialRedirectInterval) {
        clearInterval(window.materialRedirectInterval);
        window.materialRedirectInterval = null;
      }
    };
  }, [courseId, materialId]);

  // Load material progress
  const loadMaterialProgress = async () => {
    if (materialId) {
      const result = await getMaterialProgress(materialId);
      if (result.success) {
        setMaterialProgress(result.progress);
      }
    }
  };

  // Handle mark as complete/incomplete
  const handleMarkComplete = async () => {
    if (!materialId || materialProgress?.is_completed) return; // Prevent if already completed

    setIsCompleting(true);
    const newCompletionStatus = true; // Always mark as complete

    const result = await toggleMaterialCompletion(materialId, newCompletionStatus);

    if (result.success) {
      setMaterialProgress(result.progress);

      // Show success toast
      toast.success("🎉 Materi berhasil diselesaikan!", {
        duration: 2000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #10b981",
        },
      });

      // Dispatch event to notify CourseLearnPage about progress change
      console.log("🚀 Dispatching material completion event...");
      const event = new CustomEvent("materialCompleted", {
        detail: {
          courseId,
          materialId,
          completed: newCompletionStatus,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);

      // Also use localStorage for cross-tab communication
      const storageKey = `material-completed-${courseId}`;
      const storageValue = JSON.stringify({
        materialId,
        completed: newCompletionStatus,
        timestamp: Date.now(),
      });
      localStorage.setItem(storageKey, storageValue);

      console.log("📡 Material completion events dispatched:", {
        event: "materialCompleted",
        localStorage: storageKey,
        courseId,
        materialId,
        completed: newCompletionStatus,
      });

      // If there's a next material, show smooth redirect
      if (nextMaterial) {
        setIsRedirecting(true);
        setRedirectCountdown(3);

        // Countdown timer
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsRedirecting(false); // Reset redirect state before navigation
              setRedirectCountdown(0);
              // Small delay to ensure state is updated before navigation
              setTimeout(() => {
                navigate(`/dashboard/courses/${courseId}/materials/${nextMaterial._id}`);
              }, 100);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Store interval ID for cleanup
        window.materialRedirectInterval = countdownInterval;
      }
    }

    setIsCompleting(false);
  };

  const currentIndex = materials.findIndex((m) => m._id === materialId);
  const prevMaterial = currentIndex > 0 ? materials[currentIndex - 1] : null;
  const nextMaterial = currentIndex < materials.length - 1 ? materials[currentIndex + 1] : null;

  const handlePrevMaterial = () => {
    if (prevMaterial) {
      navigate(`/dashboard/courses/${courseId}/materials/${prevMaterial._id}`);
    }
  };

  const handleCancelRedirect = () => {
    // Clear countdown interval
    if (window.materialRedirectInterval) {
      clearInterval(window.materialRedirectInterval);
      window.materialRedirectInterval = null;
    }

    setIsRedirecting(false);
    setRedirectCountdown(0);
  };

  const handleNextMaterial = () => {
    if (nextMaterial) {
      // Check if current material is completed for sequential learning
      if (!materialProgress?.is_completed) {
        toast.warning("Selesaikan materi ini terlebih dahulu sebelum melanjutkan!");
        return;
      }

      // Reset redirect state before navigation
      setIsRedirecting(false);
      setRedirectCountdown(0);

      navigate(`/dashboard/courses/${courseId}/materials/${nextMaterial._id}`);
    }
  };

  const renderMaterialContent = () => {
    if (!selectedMaterial) return null;

    const { type, content_url, file_info, title, description } = selectedMaterial;

    switch (type) {
      case "video":
        return renderVideoContent(content_url, title);
      case "document":
        return renderDocumentContent(file_info, title);
      case "image":
        return renderImageContent(file_info, title);
      case "link":
        return renderLinkContent(content_url, title, description);
      default:
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Tipe Materi Tidak Didukung</h3>
              <p className="text-slate-400">Materi dengan tipe "{type}" belum didukung untuk preview.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderVideoContent = (url, title) => {
    // Extract YouTube video ID
    const youtubeMatch = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const vimeoMatch = url?.match(/vimeo\.com\/(\d+)/);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe src={`https://player.vimeo.com/video/${videoId}`} title={title} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Fallback for other video links
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Video className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Video External</h3>
            <p className="text-slate-400 mb-4">Klik tombol di bawah untuk membuka video</p>
            <Button onClick={() => window.open(url, "_blank")} className="bg-red-600 hover:bg-red-700">
              <Play className="w-4 h-4 mr-2" />
              Tonton Video
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDocumentContent = (fileInfo, title) => {
    if (!fileInfo?.url) {
      return (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">File Tidak Tersedia</h3>
            <p className="text-slate-400">File dokumen tidak dapat dimuat.</p>
          </CardContent>
        </Card>
      );
    }

    // Check if it's a PDF for inline viewing
    const isPdf = fileInfo.url.toLowerCase().includes(".pdf") || fileInfo.format === "pdf";

    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <div>
                <CardTitle className="text-white">{title}</CardTitle>
                <CardDescription className="text-slate-400 space-x-2">
                  <span>{fileInfo.file_name || "Dokumen"}</span>
                  {(fileInfo.bytes || fileInfo.file_size) && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(fileInfo.bytes || fileInfo.file_size)}
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => handleDownload()} variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isPdf ? (
            <div className="h-96 md:h-[600px]">
              <iframe src={`${fileInfo.url}#view=FitH`} title={title} className="w-full h-full border-t border-slate-700" />
            </div>
          ) : (
            <div className="p-6 text-center border-t border-slate-700">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Preview tidak tersedia untuk tipe file ini. Klik Download untuk membuka file.</p>
              <Button onClick={() => handleDownload()} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderImageContent = (fileInfo, title) => {
    if (!fileInfo?.url) {
      return (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Gambar Tidak Tersedia</h3>
            <p className="text-slate-400">Gambar tidak dapat dimuat.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="text-center">
            <img src={fileInfo.url} alt={title} className="max-w-full h-auto rounded-lg mx-auto" style={{ maxHeight: "70vh" }} />
            <div className="mt-4 flex justify-center">
              <Button onClick={() => window.open(fileInfo.url, "_blank")} variant="outline" className="border-slate-600">
                <Maximize className="w-4 h-4 mr-2" />
                Lihat Ukuran Penuh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLinkContent = (url, title, description) => {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <LinkIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          {description && <p className="text-slate-400 mb-4">{description}</p>}
          <p className="text-sm text-slate-500 mb-6 break-all">{url}</p>
          <Button onClick={() => window.open(url, "_blank")} className="bg-purple-600 hover:bg-purple-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka Link
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading || !selectedMaterial) {
    return (
      <div className="min-h-screen bg-[#0F1624] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = MATERIAL_TYPE_CONFIG[selectedMaterial.type] || MATERIAL_TYPE_CONFIG.document;
  const IconComponent = typeConfig.icon;

  return (
    <div className="min-h-screen bg-[#0F1624] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(`/dashboard/course-learn/${courseId}?tab=materials`)} className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Materi
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <IconComponent className="w-6 h-6 text-blue-400" />
                <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                {selectedMaterial.chapter && <Badge variant="secondary">{selectedMaterial.chapter}</Badge>}
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">{selectedMaterial.title}</h1>

              {selectedMaterial.description && <p className="text-slate-400 text-lg">{selectedMaterial.description}</p>}

              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                {selectedMaterial.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {selectedMaterial.duration_minutes} menit
                  </div>
                )}
                <div>
                  Materi #{currentIndex + 1} dari {materials.length}
                </div>
                {selectedCourse && <div>Course: {selectedCourse.title}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Material Content */}
        <div className="space-y-6">{renderMaterialContent()}</div>

        {/* Progress & Completion */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {materialProgress?.is_completed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Materi Selesai</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-400"></div>
                    <span>Belum Selesai</span>
                  </div>
                )}
                {materialProgress?.marked_completed_at && <span className="text-sm text-slate-500">• Diselesaikan {new Date(materialProgress.marked_completed_at).toLocaleDateString("id-ID")}</span>}
              </div>

              <div className="flex items-center gap-3">
                {!materialProgress?.is_completed && (
                  <Button onClick={handleMarkComplete} disabled={isCompleting || isRedirecting} className={`transition-all duration-300 bg-green-600 hover:bg-green-700 text-white ${isCompleting ? "animate-pulse" : ""}`}>
                    {isCompleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tandai Selesai
                      </>
                    )}
                  </Button>
                )}

                {materialProgress?.is_completed && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Materi Selesai</span>
                  </div>
                )}

                {nextMaterial && materialProgress?.is_completed && !isRedirecting && (
                  <Button onClick={handleNextMaterial} className="bg-blue-600 hover:bg-blue-700">
                    Lanjut ke Materi Berikutnya
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-redirect Notification */}
        {isRedirecting && nextMaterial && (
          <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30 mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="absolute -inset-1 bg-green-400/20 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">🎉 Materi Selesai!</h3>
                    <p className="text-slate-300">
                      Otomatis beralih ke: <span className="font-medium text-blue-400">{nextMaterial.title}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Timer className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-mono text-lg font-bold">{redirectCountdown}</span>
                      <span className="text-slate-400">detik</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleNextMaterial} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Lanjut Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button onClick={handleCancelRedirect} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Tetap Disini
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
          <div>
            {prevMaterial ? (
              <Button onClick={handlePrevMaterial} variant="outline" className="border-slate-600 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {prevMaterial.title}
              </Button>
            ) : (
              <div></div>
            )}
          </div>

          <div className="text-center text-slate-400">
            <p className="text-sm">
              {currentIndex + 1} / {materials.length}
            </p>
          </div>

          <div>
            {nextMaterial ? (
              <Button
                onClick={handleNextMaterial}
                variant="outline"
                className={`border-slate-600 transition-all duration-300 ${materialProgress?.is_completed ? "text-slate-300 hover:bg-slate-700 hover:border-blue-500" : "text-slate-500 cursor-not-allowed opacity-50"}`}
                disabled={!materialProgress?.is_completed || isRedirecting}
                title={materialProgress?.is_completed ? `Lanjut ke: ${nextMaterial.title}` : "Selesaikan materi ini terlebih dahulu"}
              >
                {nextMaterial.title}
                {materialProgress?.is_completed ? <ArrowRight className="w-4 h-4 ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay for Redirect */}
      {isRedirecting && redirectCountdown > 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Materi Selesai! 🎉</h3>
              <p className="text-slate-300 mb-4">Beralih ke materi berikutnya dalam</p>
              <div className="text-3xl font-bold text-blue-400 mb-4">{redirectCountdown}</div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleNextMaterial} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Lanjut Sekarang
                </Button>
                <Button onClick={handleCancelRedirect} size="sm" variant="outline" className="border-slate-600 text-slate-300">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
