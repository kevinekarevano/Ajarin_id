import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, FileText, Upload, CheckCircle, AlertCircle, Download, Eye, Award, Users, BookOpen, Target, Timer, Loader2, MessageSquare } from "lucide-react";

import useAssignmentStore from "@/store/assignmentStore";
import useCourseStore from "@/store/courseStore";
import useAuthStore from "@/store/authStore";
import { AssignmentSubmissionDialog } from "@/components/assignment/AssignmentSubmissionDialog";
import toast from "react-hot-toast";

export default function AssignmentViewPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [userTriggeredDialog, setUserTriggeredDialog] = useState(false);

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const { selectedAssignment, fetchAssignmentById } = useAssignmentStore();
  const { selectedCourse, fetchCourseById } = useCourseStore();

  // Data dari API response
  const [assignmentData, setAssignmentData] = useState(null);
  const [userSubmission, setUserSubmission] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch assignment details dari API baru
        const result = await fetchAssignmentById(assignmentId);
        if (result.success) {
          setAssignmentData(result.assignment);
          setUserSubmission(result.userSubmission);
          setCanSubmit(result.canSubmit);

          // Debug: Log submission data to check feedback structure
          if (result.userSubmission) {
            console.log("=== SUBMISSION DEBUG ===");
            console.log("User submission data:", result.userSubmission);
            console.log("Submission keys:", Object.keys(result.userSubmission));
            console.log("Grading data:", result.userSubmission.grading);
            if (result.userSubmission.grading) {
              console.log("Grading keys:", Object.keys(result.userSubmission.grading));
              console.log("Grading feedback:", JSON.stringify(result.userSubmission.grading.feedback));
              console.log("Feedback length:", result.userSubmission.grading.feedback ? result.userSubmission.grading.feedback.length : "null/undefined");
              console.log("Feedback type:", typeof result.userSubmission.grading.feedback);
            }
            if (result.userSubmission.score !== undefined) {
              console.log("Direct score:", result.userSubmission.score);
            }
            if (result.userSubmission.feedback) {
              console.log("Direct feedback:", JSON.stringify(result.userSubmission.feedback));
            }
            console.log("=== END DEBUG ===");
          }
        }

        // Fetch course details
        await fetchCourseById(courseId);
      } catch (error) {
        console.error("Failed to load assignment data:", error);
        toast.error("Gagal memuat data tugas");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && assignmentId) {
      loadData();
    }
  }, [courseId, assignmentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "graded":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "under_review":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "returned_for_revision":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "draft":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <Upload className="w-4 h-4" />;
      case "graded":
        return <CheckCircle className="w-4 h-4" />;
      case "under_review":
        return <Eye className="w-4 h-4" />;
      case "returned_for_revision":
        return <AlertCircle className="w-4 h-4" />;
      case "draft":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "submitted":
        return "Telah Dikumpulkan";
      case "graded":
        return "Sudah Dinilai";
      case "under_review":
        return "Sedang Direview";
      case "returned_for_revision":
        return "Perlu Revisi";
      case "draft":
        return "Draft";
      default:
        return "Belum Dikumpulkan";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to check if file is downloadable
  const isDownloadableFile = (fileType) => {
    return fileType && (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("image"));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Memuat data tugas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignmentData || !selectedCourse) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Tugas Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Tugas yang Anda cari tidak tersedia atau telah dihapus</p>
          <Button asChild>
            <Link to={`/dashboard/course-learn/${courseId}?tab=assignments`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Kursus
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/dashboard/course-learn/${courseId}?tab=assignments`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <nav className="text-sm text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <span className="mx-2">›</span>
            <Link to={`/dashboard/courses/${courseId}`} className="hover:text-white">
              {selectedCourse.title}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-white">Tugas</span>
          </nav>
          <h1 className="text-2xl font-bold text-white">{assignmentData.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-2">{assignmentData.title}</CardTitle>
                  {assignmentData.description && <CardDescription className="text-slate-300 text-base leading-relaxed">{assignmentData.description}</CardDescription>}
                </div>
                <Badge className={getStatusColor(userSubmission?.status || "not_submitted")}>
                  {getStatusIcon(userSubmission?.status || "not_submitted")}
                  <span className="ml-2">{getStatusText(userSubmission?.status || "not_submitted")}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              {assignmentData.instructions && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Instruksi Pengerjaan
                  </h3>
                  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{assignmentData.instructions}</p>
                  </div>
                </div>
              )}

              {/* Question File */}
              {assignmentData.question_file?.url && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    File Soal dari Mentor
                  </h3>
                  <Card className="bg-slate-900/50 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/10 rounded-lg">
                            <FileText className="w-8 h-8 text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg">{assignmentData.question_file.file_name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-slate-400">{formatFileSize(assignmentData.question_file.file_size)}</p>
                              {assignmentData.question_file.file_type && (
                                <Badge variant="outline" className="text-xs">
                                  {assignmentData.question_file.file_type.split("/")[1]?.toUpperCase() || "FILE"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(assignmentData.question_file.url, "_blank")}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = assignmentData.question_file.url;
                              link.download = assignmentData.question_file.file_name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Submission Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-400" />
                    Pengumpulan Tugas
                  </h3>
                  {canSubmit && (
                    <Button
                      onClick={() => {
                        setUserTriggeredDialog(true);
                        setShowSubmissionDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {userSubmission?.status === "draft" ? "Lanjutkan" : userSubmission ? "Submit Ulang" : "Kumpulkan"}
                    </Button>
                  )}
                </div>

                {/* Current Submission Status */}
                {userSubmission && (
                  <div className="space-y-4">
                    {/* Submission Info Card */}
                    <Card className="bg-slate-900/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(userSubmission.status)}
                              <span className="font-medium text-white">{getStatusText(userSubmission.status)}</span>
                            </div>
                            {userSubmission.submitted_at && <p className="text-sm text-slate-400">Dikumpulkan: {new Date(userSubmission.submitted_at).toLocaleString("id-ID")}</p>}
                          </div>
                          {userSubmission.grading?.score !== null && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">
                                {userSubmission.grading.score}/{assignmentData.max_points || 100}
                              </div>
                              <p className="text-sm text-slate-400">Nilai</p>
                              <div className="mt-1">
                                <Badge className="bg-green-600 text-white">{Math.round((userSubmission.grading.score / (assignmentData.max_points || 100)) * 100)}%</Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Show submitted content preview */}
                        {userSubmission.content?.text_content && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              Your Submission
                            </h4>
                            <div className="bg-slate-800/50 p-3 rounded-lg">
                              <p className="text-slate-300 text-sm">{userSubmission.content.text_content.length > 200 ? userSubmission.content.text_content.substring(0, 200) + "..." : userSubmission.content.text_content}</p>
                            </div>
                          </div>
                        )}

                        {/* Show files if any */}
                        {userSubmission.content?.files_info && userSubmission.content.files_info.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Upload className="w-4 h-4 text-blue-400" />
                              Files Submitted ({userSubmission.content.files_info.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {userSubmission.content.files_info.slice(0, 3).map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded text-sm">
                                  <FileText className="w-4 h-4 text-blue-400" />
                                  <span className="text-slate-300">{file.file_name}</span>
                                  <span className="text-slate-500 text-xs">({formatFileSize(file.file_size)})</span>
                                </div>
                              ))}
                              {userSubmission.content.files_info.length > 3 && <p className="text-slate-400 text-xs">+{userSubmission.content.files_info.length - 3} file lainnya</p>}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Grading & Feedback Card - Separate and prominent */}
                    {(userSubmission.grading || userSubmission.score !== null || userSubmission.feedback) &&
                      (userSubmission.grading?.score !== null || userSubmission.score !== null || userSubmission.grading?.feedback || userSubmission.feedback) && (
                        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Award className="w-5 h-5 text-yellow-400" />
                              Penilaian dari Mentor
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Score Display */}
                            {(userSubmission.grading?.score !== null || userSubmission.score !== null) && (
                              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                <div>
                                  <h4 className="font-semibold text-green-400 mb-1">Nilai Anda</h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-white">{userSubmission.grading?.score || userSubmission.score}</span>
                                    <span className="text-xl text-slate-400">/ {assignmentData.max_points || 100}</span>
                                    <Badge className="bg-green-600 text-white text-sm">{Math.round(((userSubmission.grading?.score || userSubmission.score) / (assignmentData.max_points || 100)) * 100)}%</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                                  <p className="text-sm text-green-400 font-medium">Dinilai</p>
                                </div>
                              </div>
                            )}

                            {/* Feedback Section */}
                            {((userSubmission.grading?.feedback && userSubmission.grading.feedback.trim()) || (userSubmission.feedback && userSubmission.feedback.trim())) && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                  <MessageSquare className="w-5 h-5 text-blue-400" />
                                  Komentar & Feedback Mentor
                                </h4>
                                <div className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{userSubmission.grading?.feedback || userSubmission.feedback || "Tidak ada feedback"}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    Dinilai pada:{" "}
                                    {userSubmission.grading?.graded_at
                                      ? new Date(userSubmission.grading.graded_at).toLocaleString("id-ID")
                                      : userSubmission.graded_at
                                      ? new Date(userSubmission.graded_at).toLocaleString("id-ID")
                                      : new Date(userSubmission.submitted_at).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* If graded but no feedback */}
                            {(userSubmission.grading?.score !== null || userSubmission.score !== null) &&
                              !((userSubmission.grading?.feedback && userSubmission.grading.feedback.trim()) || (userSubmission.feedback && userSubmission.feedback.trim())) && (
                                <div className="text-center py-4">
                                  <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                  <p className="text-slate-400 text-sm">Mentor belum memberikan komentar untuk submission ini</p>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      )}
                  </div>
                )}

                {/* No submission yet */}
                {!userSubmission && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-lg bg-slate-900/30">
                    <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">Belum ada pengumpulan tugas</h4>
                    <p className="text-slate-400 mb-6">Klik tombol di bawah untuk mulai mengerjakan tugas ini</p>
                    <Button
                      onClick={() => {
                        setUserTriggeredDialog(true);
                        setShowSubmissionDialog(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Mulai Kerjakan
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Detail Tugas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-slate-400">Poin Maksimal</p>
                  <p className="font-medium text-white">{assignmentData.max_points || 100} poin</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Status Publikasi</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={assignmentData.is_published ? "default" : "secondary"} className="text-xs">
                      {assignmentData.is_published ? "Dipublikasikan" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>

              {assignmentData.publish_date && (
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Tanggal Publikasi</p>
                    <p className="font-medium text-white text-sm">
                      {new Date(assignmentData.publish_date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <Separator className="bg-slate-700" />
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Info Kursus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Kursus</p>
                  <p className="font-medium text-white">{selectedCourse.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Mentor</p>
                  <p className="font-medium text-white">{assignmentData.mentor_id?.fullname || selectedCourse.mentor_name || "Unknown"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Dialog */}
      {userTriggeredDialog && assignmentData && (
        <AssignmentSubmissionDialog
          open={showSubmissionDialog}
          onOpenChange={(open) => {
            setShowSubmissionDialog(open);
            if (!open) {
              setUserTriggeredDialog(false);
            }
          }}
          assignment={assignmentData}
          userSubmission={userSubmission}
        />
      )}
    </div>
  );
}
