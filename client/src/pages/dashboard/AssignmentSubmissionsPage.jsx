import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users2, CheckCircle, Clock, FileText, Eye, Star, Download, AlertCircle } from "lucide-react";

import useAssignmentStore from "@/store/assignmentStore";
import useCourseStore from "@/store/courseStore";
import { AssignmentGradingDialog } from "@/components/assignment/AssignmentGradingDialog";
import toast from "react-hot-toast";

export default function AssignmentSubmissionsPage() {
  const { courseId, assignmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingDialog, setShowGradingDialog] = useState(false);

  const { selectedAssignment, submissions, fetchAssignmentById, fetchAssignmentSubmissions } = useAssignmentStore();
  const { selectedCourse, fetchCourseById } = useCourseStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch assignment details
        await fetchAssignmentById(assignmentId);

        // Fetch course details
        await fetchCourseById(courseId);

        // Fetch submissions for this assignment
        await fetchAssignmentSubmissions(assignmentId);
      } catch (error) {
        console.error("Failed to load assignment submissions:", error);
        toast.error("Gagal memuat data submissions");
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
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "graded":
        return <CheckCircle className="w-4 h-4" />;
      case "under_review":
        return <Eye className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowGradingDialog(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Memuat submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedAssignment || !selectedCourse) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Assignment Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Assignment yang Anda cari tidak tersedia</p>
          <Button asChild>
            <Link to={`/dashboard/courses/${courseId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Course
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
        <Button variant="ghost" asChild>
          <Link to={`/dashboard/courses/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
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
            <span className="text-white">Submissions</span>
          </nav>
          <h1 className="text-2xl font-bold text-white">{selectedAssignment.title}</h1>
          <p className="text-slate-400">{selectedAssignment.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users2 className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total Submissions</p>
                <p className="text-2xl font-bold text-white">{submissions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Sudah Dinilai</p>
                <p className="text-2xl font-bold text-white">{submissions?.filter((s) => s.status === "graded").length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Menunggu Review</p>
                <p className="text-2xl font-bold text-white">{submissions?.filter((s) => s.status === "submitted").length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-white">
                  {submissions?.length > 0 ? Math.round(submissions.filter((s) => s.grading?.score != null).reduce((sum, s) => sum + s.grading.score, 0) / submissions.filter((s) => s.grading?.score != null).length || 0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Submissions dari Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions && submissions.length > 0 ? (
              submissions.map((submission) => (
                <Card key={submission._id} className="bg-slate-900 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{submission.student_id?.fullname?.charAt(0) || "U"}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{submission.student_id?.fullname || "Unknown Student"}</h3>
                            <Badge className={getStatusColor(submission.status)}>
                              {getStatusIcon(submission.status)}
                              <span className="ml-2 capitalize">{submission.status}</span>
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-400 mb-3">Submitted: {new Date(submission.submitted_at).toLocaleString("id-ID")}</p>

                          {/* Text Content */}
                          {submission.content?.text_content && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-slate-300 mb-2">Text Submission:</p>
                              <div className="bg-slate-800 p-3 rounded-lg">
                                <p className="text-sm text-slate-300">{submission.content.text_content}</p>
                              </div>
                            </div>
                          )}

                          {/* Files */}
                          {submission.content?.files_info && submission.content.files_info.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-slate-300 mb-2">Files ({submission.content.files_info.length}):</p>
                              <div className="space-y-2">
                                {submission.content.files_info.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-400" />
                                      <span className="text-sm text-slate-300">{file.file_name}</span>
                                      <span className="text-xs text-slate-500">({formatFileSize(file.file_size)})</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => window.open(file.url, "_blank")}>
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Grade Display */}
                          {submission.grading?.score != null && (
                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-green-400">Nilai</p>
                                <Badge className="bg-green-600 text-white">
                                  {submission.grading.score}/{selectedAssignment.max_points || 100}
                                </Badge>
                              </div>
                              {submission.grading.feedback && <p className="text-sm text-slate-300">{submission.grading.feedback}</p>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => handleGradeSubmission(submission)} className="bg-blue-600 hover:bg-blue-700">
                          <Star className="w-4 h-4 mr-2" />
                          {submission.grading?.score != null ? "Edit Nilai" : "Beri Nilai"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Users2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Submissions</h3>
                <p className="text-slate-400">Tidak ada student yang mengumpulkan tugas ini</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      {selectedSubmission && <AssignmentGradingDialog open={showGradingDialog} onOpenChange={setShowGradingDialog} submission={selectedSubmission} assignment={selectedAssignment} />}
    </div>
  );
}
