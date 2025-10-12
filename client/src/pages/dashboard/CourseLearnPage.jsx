import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import { BookOpen, Clock, ChevronLeft, Play, CheckCircle, FileText, Users, Star, Award, BarChart3, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEnrollmentStore from "@/store/enrollmentStore";
import useCourseStore from "@/store/courseStore";
import useAuthStore from "@/store/authStore";
import useMaterialStore from "@/store/materialStore";
import useAssignmentStore from "@/store/assignmentStore";
import useCertificateStore from "@/store/certificateStore";
import { MaterialList } from "@/components/material/MaterialList";
import { AssignmentList } from "@/components/assignment/AssignmentList";
import { DiscussionForum } from "@/components/course/DiscussionForum";
import toast from "react-hot-toast";

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState(null);
  const [certificateEligibility, setCertificateEligibility] = useState(null);

  const { getEnrollmentDetails, updateProgress } = useEnrollmentStore();
  const { getCourseById } = useCourseStore();
  const { materials, loading: materialLoading, fetchCourseMaterials, getCourseProgress } = useMaterialStore();
  const { assignments, loading: assignmentLoading, fetchCourseAssignments } = useAssignmentStore();
  const { checkCertificateEligibility, generateCertificate, loading: certificateLoading } = useCertificateStore();

  // Refresh course progress function
  const refreshCourseProgress = async () => {
    if (courseId && materials) {
      console.log("🔄 Refreshing course progress for courseId:", courseId);
      const progressResult = await getCourseProgress(courseId);
      if (progressResult.success) {
        console.log("✅ Raw progress result:", progressResult);

        const oldProgress = courseProgress;
        setCourseProgress(progressResult.progress);

        const completedCount = progressResult.progress?.material_progress?.filter((p) => p?.is_completed).length || 0;
        const totalCount = materials?.length || 0;

        console.log("📊 Progress comparison:", {
          oldCompleted: oldProgress?.material_progress?.filter((p) => p?.is_completed).length || 0,
          newCompleted: completedCount,
          totalMaterials: totalCount,
          materialProgressData:
            progressResult.progress?.material_progress?.map((p) => ({
              material_id: p?.material_id,
              material_id_type: typeof p?.material_id,
              material_id_extracted: typeof p?.material_id === "object" && p?.material_id?._id ? p.material_id._id : p?.material_id,
              is_completed: p?.is_completed,
              title: p?.material_id?.title || "Unknown",
            })) || [],
          materialsData:
            materials?.map((m) => ({
              id: m?._id,
              title: m?.title,
              order: m?.order,
            })) || [],
        });

        // Show toast notification for debugging (remove in production)
        // toast.success(`🎯 Progress refreshed: ${completedCount}/${totalCount} materi selesai`);
      } else {
        console.error("❌ Failed to refresh course progress:", progressResult.error);
      }
    }
  };

  // Load course and enrollment data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get course details first
        const courseData = await getCourseById(courseId);
        setCourse(courseData.course);

        // Check if user is the instructor of this course
        const isInstructor = courseData.course && user && courseData.course.mentor_id === user._id;

        if (isInstructor) {
          // If user is instructor, set a mock enrollment
          setEnrollment({
            role: "instructor",
            mentor_id: user,
            course_id: courseData.course,
            status: "instructor",
          });
        } else {
          // For students, use normal enrollment flow
          try {
            const enrollmentData = await getEnrollmentDetails(courseId);
            setEnrollment(enrollmentData.enrollment);
          } catch (enrollmentError) {
            console.error("Enrollment error:", enrollmentError);
            toast.error("Anda tidak memiliki akses ke kursus ini");
            navigate("/dashboard/my-courses");
            return;
          }
        }

        // Fetch course materials
        await fetchCourseMaterials(courseId);

        // Fetch course assignments
        await fetchCourseAssignments(courseId);

        // Fetch course progress (only for students)
        if (!isInstructor) {
          await refreshCourseProgress();
          // Check certificate eligibility after progress is loaded
          setTimeout(() => checkCertificate(), 500);
        }
      } catch (error) {
        console.error("Failed to load course data:", error);
        toast.error("Gagal memuat data kursus");
        navigate("/dashboard/my-courses");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, getEnrollmentDetails, getCourseById, fetchCourseMaterials, fetchCourseAssignments, navigate, user]);

  // Handle tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "materials", "assignments", "discussion"].includes(tabParam)) {
      setActiveTab(tabParam);

      // Refresh progress when switching to materials tab
      if (tabParam === "materials" && courseProgress) {
        refreshCourseProgress();
      }
    }
  }, [searchParams]);

  // Add event listeners for progress updates
  useEffect(() => {
    let refreshTimer = null;

    // Debounced refresh to prevent multiple calls
    const debouncedRefresh = (immediate = false) => {
      if (refreshTimer) clearTimeout(refreshTimer);
      if (immediate) {
        refreshCourseProgress();
      } else {
        refreshTimer = setTimeout(() => {
          refreshCourseProgress();
        }, 500);
      }
    };

    // Listen for custom events from MaterialViewPage
    const handleMaterialCompleted = (event) => {
      console.log("🎉 Material completed event received:", event.detail);
      if (event.detail.courseId === courseId && event.detail.completed === true) {
        console.log("🔄 Triggering course progress refresh from event...");
        debouncedRefresh();
      }
    };

    window.addEventListener("materialCompleted", handleMaterialCompleted);

    return () => {
      window.removeEventListener("materialCompleted", handleMaterialCompleted);
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [courseId]);

  // Refresh progress when switching to materials tab
  useEffect(() => {
    if (activeTab === "materials" && courseId && courseProgress) {
      console.log("📑 Switched to materials tab, refreshing progress...");
      refreshCourseProgress();
    }
  }, [activeTab]);

  // Check certificate eligibility when progress changes
  useEffect(() => {
    if (courseProgress && enrollment?.role !== "instructor") {
      console.log("🎓 Progress changed, checking certificate eligibility");
      checkCertificate();
    }
  }, [courseProgress]);

  // Also check when materials are loaded for the first time
  useEffect(() => {
    if (materials && materials.length > 0 && courseProgress && enrollment?.role !== "instructor" && !certificateEligibility) {
      console.log("🎓 Materials and progress loaded, checking certificate eligibility");
      checkCertificate();
    }
  }, [materials, courseProgress, enrollment]);

  // Update progress handler
  const handleUpdateProgress = async (newProgress) => {
    try {
      await updateProgress(courseId, { progress_percentage: newProgress });
      setEnrollment((prev) => ({ ...prev, progress_percentage: newProgress }));
      toast.success("Progress berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui progress");
    }
  };

  // Handle view material
  const handleViewMaterial = (material) => {
    // Check if material is unlocked for sequential learning
    if (!isMaterialUnlocked(material)) {
      toast.warning("Selesaikan materi sebelumnya terlebih dahulu!");
      return;
    }
    navigate(`/dashboard/courses/${courseId}/materials/${material._id}`);
  };

  // Check if material is unlocked based on sequential learning
  const isMaterialUnlocked = (material) => {
    if (!courseProgress?.material_progress || !materials) return true; // First material or no progress data

    const materialIndex = materials.findIndex((m) => m?._id === material?._id);
    if (materialIndex === 0) return true; // First material is always unlocked

    // Check if previous material is completed
    const previousMaterial = materials[materialIndex - 1];
    if (!previousMaterial) return true;

    const previousProgress = courseProgress.material_progress.find((p) => {
      const progressMaterialId = typeof p?.material_id === "object" && p?.material_id?._id ? p.material_id._id : p?.material_id;
      return progressMaterialId === previousMaterial._id;
    });

    return previousProgress?.is_completed || false;
  };

  // Get material completion status
  const getMaterialCompletionStatus = (material) => {
    if (!courseProgress?.material_progress) return false;

    const progress = courseProgress.material_progress.find((p) => {
      const progressMaterialId = typeof p?.material_id === "object" && p?.material_id?._id ? p.material_id._id : p?.material_id;
      return progressMaterialId === material?._id;
    });

    return progress?.is_completed || false;
  };

  // Calculate real-time progress percentage
  const calculateProgressPercentage = () => {
    if (!materials?.length || !courseProgress?.material_progress) return 0;

    const completedCount = courseProgress.material_progress.filter((p) => p.is_completed).length;
    return Math.round((completedCount / materials.length) * 100);
  };

  // Get completed materials count
  const getCompletedMaterialsCount = () => {
    if (!courseProgress?.material_progress) return 0;
    return courseProgress.material_progress.filter((p) => p.is_completed).length;
  };

  // Check certificate eligibility
  const checkCertificate = async () => {
    if (!courseId || enrollment?.role === "instructor") return;

    console.log("🎓 Checking certificate eligibility for courseId:", courseId);
    try {
      const result = await checkCertificateEligibility(courseId);
      console.log("🎓 Certificate eligibility result:", result);
      if (result.success) {
        setCertificateEligibility(result.data);
        console.log("✅ Certificate eligibility set:", result.data);
      } else {
        console.error("❌ Certificate eligibility check failed:", result.error);
        setCertificateEligibility(null);
      }
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      setCertificateEligibility(null);
    }
  };

  // Handle claim certificate
  const handleClaimCertificate = async () => {
    try {
      const result = await generateCertificate(courseId);
      if (result.success) {
        toast.success("🎉 Sertifikat berhasil digenerate!");
        // Refresh eligibility to show claimed status
        await checkCertificate();
      }
    } catch (error) {
      console.error("Error claiming certificate:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-4" />
          <div className="h-64 bg-slate-700 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-slate-700 rounded" />
            </div>
            <div className="h-96 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment || !course) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Kursus tidak ditemukan</h3>
            <p className="text-slate-400 mb-6">Anda tidak terdaftar dalam kursus ini atau kursus tidak tersedia</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/dashboard/my-courses">Kembali ke Kursus Saya</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/my-courses")} className="text-slate-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* Course Hero */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-slate-700">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-600 text-white">{course.category}</Badge>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  {enrollment.role === "instructor" ? "Mentor" : enrollment.status === "completed" ? "Selesai" : "Sedang Dipelajari"}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-blue-100 text-lg mb-4">{course.description}</p>

              <div className="flex items-center gap-6 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{course.total_enrollments} siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor((course.total_duration_minutes || 0) / 60)}h {(course.total_duration_minutes || 0) % 60}m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{course.rating > 0 ? course.rating.toFixed(1) : "Belum ada rating"}</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-blue-200 mb-2">{enrollment.role === "instructor" ? "Anda adalah Mentor" : "Mentor"}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{enrollment.role === "instructor" ? user?.fullname?.charAt(0) : enrollment.mentor_id?.fullname?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{enrollment.role === "instructor" ? user?.fullname : enrollment.mentor_id?.fullname}</p>
                    <p className="text-sm text-blue-200">{enrollment.role === "instructor" ? user?.headline || "Mentor" : enrollment.mentor_id?.headline || "Mentor"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card - Only show for students */}
            {enrollment.role !== "instructor" && (
              <Card className="bg-black/30 border-slate-600 min-w-[300px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Progress Belajar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Kemajuan</span>
                      <span className="text-white font-medium">{calculateProgressPercentage()}%</span>
                    </div>
                    <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          calculateProgressPercentage() === 100 ? "bg-green-500" : calculateProgressPercentage() >= 70 ? "bg-blue-500" : calculateProgressPercentage() >= 30 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${calculateProgressPercentage()}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Materi Selesai</p>
                      <p className="text-white font-semibold">
                        {getCompletedMaterialsCount()}/{materials.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Terakhir Akses</p>
                      <p className="text-white font-semibold">
                        {enrollment.last_accessed
                          ? new Date(enrollment.last_accessed).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Belum pernah"}
                      </p>
                    </div>
                  </div>

                  {enrollment.status !== "completed" && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("materials")}>
                      <Play className="w-4 h-4 mr-2" />
                      {enrollment.progress_percentage === 0 ? "Mulai Belajar" : "Lanjutkan Belajar"}
                    </Button>
                  )}

                  {enrollment.status === "completed" && (
                    <div className="text-center p-4 bg-green-900/30 border border-green-700 rounded-lg">
                      <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium">Selamat! Kursus selesai</p>
                      <p className="text-sm text-green-300">Diselesaikan pada {new Date(enrollment.completed_at).toLocaleDateString("id-ID")}</p>
                    </div>
                  )}

                  {/* Certificate Section */}
                  {calculateProgressPercentage() === 100 && (
                    <div className="pt-4 border-t border-slate-600">
                      {certificateEligibility === null ? (
                        // Loading state while checking eligibility
                        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Checking certificate eligibility...</p>
                        </div>
                      ) : certificateEligibility?.eligible && certificateEligibility?.reason === "eligible" ? (
                        <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold" onClick={handleClaimCertificate} disabled={certificateLoading}>
                          {certificateLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              🎉 Klaim Sertifikat
                            </>
                          )}
                        </Button>
                      ) : certificateEligibility?.reason === "already_claimed" ? (
                        <div className="text-center p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                          <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <p className="text-yellow-400 font-medium text-sm">Sertifikat sudah diklaim</p>
                          <Button variant="ghost" size="sm" className="mt-2 text-yellow-300 hover:text-yellow-100" onClick={() => navigate("/dashboard/certificates")}>
                            Lihat Sertifikat
                          </Button>
                        </div>
                      ) : certificateEligibility && !certificateEligibility.eligible && certificateEligibility.reason === "incomplete" ? (
                        <div className="text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                          <Award className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-400 font-medium text-sm">Selesaikan semua materi untuk klaim sertifikat</p>
                          <p className="text-xs text-slate-500 mt-1">Progress: {certificateEligibility.completionPercentage}%</p>
                        </div>
                      ) : (
                        // Fallback: Manual check button
                        <div className="space-y-2">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold" onClick={checkCertificate} disabled={certificateLoading}>
                            <Award className="w-4 h-4 mr-2" />
                            Check Certificate Eligibility
                          </Button>
                          <div className="text-xs text-slate-500 text-center">
                            Debug: Progress {calculateProgressPercentage()}% | Eligibility: {certificateEligibility ? JSON.stringify(certificateEligibility) : "null"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructor Stats Card - Only show for instructors */}
            {enrollment.role === "instructor" && (
              <Card className="bg-black/30 border-slate-600 min-w-[300px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Statistik Kursus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Total Siswa</p>
                      <p className="text-white font-semibold text-2xl">{course.total_enrollments || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Materi</p>
                      <p className="text-white font-semibold text-2xl">{materials.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Tugas</p>
                      <p className="text-white font-semibold text-2xl">{assignments.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Rating</p>
                      <p className="text-white font-semibold text-2xl">{course.rating > 0 ? course.rating.toFixed(1) : "N/A"}</p>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab("discussion")}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Kelola Diskusi
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="materials" className="data-[state=active]:bg-blue-600">
            Materi
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-600">
            Tugas
          </TabsTrigger>
          <TabsTrigger value="discussion" className="data-[state=active]:bg-blue-600">
            Diskusi
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistik Kursus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Siswa</span>
                  <span className="text-white font-semibold">{course.total_enrollments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rating</span>
                  <span className="text-white font-semibold">{course.rating > 0 ? course.rating.toFixed(1) : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Durasi</span>
                  <span className="text-white font-semibold">
                    {Math.floor((course.total_duration_minutes || 0) / 60)}h {(course.total_duration_minutes || 0) % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kategori</span>
                  <span className="text-white font-semibold">{course.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Progress Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress Materi</span>
                    <span className="text-white">{calculateProgressPercentage()}%</span>
                  </div>
                  <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        calculateProgressPercentage() === 100 ? "bg-green-500" : calculateProgressPercentage() >= 70 ? "bg-blue-500" : calculateProgressPercentage() >= 30 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${calculateProgressPercentage()}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Materi Diselesaikan</span>
                    <span className="text-white">
                      {getCompletedMaterialsCount()}/{materials.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <Badge className={enrollment.status === "completed" ? "bg-green-600" : "bg-blue-600"}>{enrollment.status === "completed" ? "Selesai" : "Aktif"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanggal Daftar</span>
                    <span className="text-white text-sm">{new Date(enrollment.enrolled_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("materials")}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lihat Materi
                </Button>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("assignments")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Kerjakan Tugas
                </Button>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("discussion")}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Forum Diskusi
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <Download className="w-4 h-4 mr-2" />
                  Download Materi
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* How to Use Guide */}
          <Card className="bg-blue-900/20 border-blue-700/50">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cara Menggunakan Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-100/80 space-y-2">
              <p>
                • <strong>Klik tab "Materi"</strong> untuk melihat daftar semua materi pembelajaran
              </p>
              <p>
                • <strong>Klik judul materi</strong> untuk membuka dan membaca detail materi
              </p>
              <p>
                • <strong>Klik tab "Tugas"</strong> untuk melihat assignment dan klik "Kerjakan" untuk submit jawaban
              </p>
              <p>
                • <strong>Download file</strong> jika tersedia untuk belajar offline
              </p>
              <p>
                • <strong>Gunakan tab "Diskusi"</strong> untuk bertanya atau berdiskusi dengan mentor dan siswa lain
              </p>
            </CardContent>
          </Card>

          {/* Course Description */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deskripsi Kursus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{course.description || "Tidak ada deskripsi tersedia untuk kursus ini."}</p>

              {course.tags && course.tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-slate-400 mb-3">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Materi Kursus</CardTitle>
              <CardDescription className="text-slate-400">Daftar materi pembelajaran yang tersedia untuk kursus ini</CardDescription>
            </CardHeader>
            <CardContent>
              {materialLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-400">Memuat materi...</div>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                  <p className="text-slate-400">Belum ada materi yang tersedia</p>
                  <p className="text-slate-500 text-sm mt-2">Mentor belum menambahkan materi untuk kursus ini</p>
                </div>
              ) : (
                <MaterialList
                  key={`materials-${courseProgress?.material_progress?.length}-${courseProgress?.updated_at || Date.now()}`}
                  materials={materials}
                  loading={materialLoading}
                  showActions={false}
                  groupByChapter={true}
                  isDraggable={false}
                  onView={handleViewMaterial}
                  materialProgress={courseProgress?.material_progress || []}
                  sequentialLearning={true}
                />
              )}
              {materials.length > 0 && course && user && course.mentor_id === user._id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link to={`/dashboard/courses/${courseId}/materials`}>Kelola Semua Materi</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tugas Kursus</CardTitle>
              <CardDescription className="text-slate-400">Daftar tugas dan assignment yang tersedia untuk kursus ini</CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-400">Memuat tugas...</div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                  <p className="text-slate-400">Belum ada tugas yang tersedia</p>
                  <p className="text-slate-500 text-sm mt-2">Mentor belum menambahkan tugas untuk kursus ini</p>
                </div>
              ) : (
                <AssignmentList courseId={courseId} userRole="student" />
              )}
              {assignments.length > 0 && course && user && course.mentor_id === user._id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link to={`/dashboard/courses/${courseId}/assignments`}>Kelola Semua Tugas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussion Tab */}
        <TabsContent value="discussion">
          <DiscussionForum courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
