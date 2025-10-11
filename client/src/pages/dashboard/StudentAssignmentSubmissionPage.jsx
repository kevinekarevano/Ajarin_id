import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FileText, Upload, Download, Clock, CheckCircle, AlertCircle, Star, ChevronLeft, Eye, X, Send, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useAuthStore from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentAssignmentSubmissionPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Submission form state
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);

  // Load assignment and submissions
  useEffect(() => {
    loadAssignmentData();
  }, [courseId, assignmentId]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);

      // Get assignment details
      const assignmentResponse = await api.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentResponse.data.data.assignment);

      // Get student submissions for this assignment
      const submissionsResponse = await api.get(`/assignments/${assignmentId}/submissions/my`);
      setSubmissions(submissionsResponse.data.data.submissions || []);
    } catch (error) {
      console.error("Failed to load assignment:", error);
      toast.error("Gagal memuat data tugas");
      navigate(`/dashboard/courses/${courseId}/assignments`);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file tidak boleh lebih dari 10MB");
        return;
      }

      // Check file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, TXT, atau gambar");
        return;
      }

      setSubmissionFile(file);
    }
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (!submissionText.trim() && !submissionFile) {
      toast.error("Harap isi jawaban atau upload file");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("submission_text", submissionText);
      if (submissionFile) {
        formData.append("submission_file", submissionFile);
      }

      await api.post(`/assignments/${assignmentId}/submissions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Tugas berhasil dikumpulkan!");
      setIsSubmissionDialogOpen(false);
      setSubmissionText("");
      setSubmissionFile(null);

      // Reload submissions
      loadAssignmentData();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Gagal mengumpulkan tugas");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "graded":
        return "bg-green-600 text-white";
      case "submitted":
        return "bg-blue-600 text-white";
      case "late":
        return "bg-yellow-600 text-white";
      case "pending_review":
        return "bg-purple-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "graded":
        return "Sudah Dinilai";
      case "submitted":
        return "Dikumpulkan";
      case "late":
        return "Terlambat";
      case "pending_review":
        return "Menunggu Review";
      default:
        return "Draft";
    }
  };

  // Check if can submit
  const canSubmit = () => {
    if (!assignment) return false;
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const hasSubmission = submissions.some((s) => s.status !== "draft");

    return now <= dueDate && !hasSubmission;
  };

  // Check if assignment is overdue
  const isOverdue = () => {
    if (!assignment) return false;
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    return now > dueDate;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-4" />
          <div className="h-64 bg-slate-700 rounded mb-6" />
          <div className="h-32 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tugas tidak ditemukan</h3>
            <p className="text-slate-400 mb-6">Tugas yang Anda cari tidak tersedia</p>
            <Button onClick={() => navigate(`/dashboard/courses/${courseId}/assignments`)} className="bg-blue-600 hover:bg-blue-700">
              Kembali ke Daftar Tugas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestSubmission = submissions[0]; // Assuming submissions are sorted by date

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/courses/${courseId}/assignments`)} className="text-slate-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Tugas
        </Button>
      </div>

      {/* Assignment Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white mb-2">{assignment.title}</CardTitle>
              <p className="text-slate-300">{assignment.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Due:{" "}
                  {new Date(assignment.due_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Star className="w-4 h-4" />
                <span>Poin: {assignment.points}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alert */}
          {isOverdue() && !latestSubmission && (
            <Alert className="border-red-600 bg-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300">Tugas ini sudah melewati batas waktu pengumpulan</AlertDescription>
            </Alert>
          )}

          {latestSubmission && (
            <Alert className="border-green-600 bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300">Tugas telah dikumpulkan pada {new Date(latestSubmission.submitted_at).toLocaleDateString("id-ID")}</AlertDescription>
            </Alert>
          )}

          {/* Assignment Question File */}
          {assignment.question_file && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">File Soal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{assignment.question_file.file_name}</p>
                      <p className="text-sm text-slate-400">{(assignment.question_file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <a href={assignment.question_file.url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Section */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Pengumpulan Tugas</CardTitle>
                {canSubmit() && (
                  <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Kumpulkan Tugas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Kumpulkan Tugas: {assignment.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Text Submission */}
                        <div>
                          <Label htmlFor="submission-text" className="text-slate-300">
                            Jawaban (Teks)
                          </Label>
                          <Textarea
                            id="submission-text"
                            placeholder="Tulis jawaban Anda di sini..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            className="mt-2 min-h-[200px] bg-slate-900 border-slate-600 text-white"
                          />
                        </div>

                        {/* File Upload */}
                        <div>
                          <Label htmlFor="submission-file" className="text-slate-300">
                            Upload File (Opsional)
                          </Label>
                          <div className="mt-2">
                            <Input id="submission-file" type="file" onChange={handleFileChange} className="bg-slate-900 border-slate-600 text-white" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                            <p className="text-xs text-slate-400 mt-1">Max 10MB. Format: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                          </div>

                          {submissionFile && (
                            <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-600">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm text-white">{submissionFile.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSubmissionFile(null)} className="text-slate-400 hover:text-white">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsSubmissionDialogOpen(false)} className="border-slate-600 text-slate-300">
                            Batal
                          </Button>
                          <Button onClick={handleSubmit} disabled={submitting || (!submissionText.trim() && !submissionFile)} className="bg-green-600 hover:bg-green-700">
                            {submitting ? "Mengumpulkan..." : "Kumpulkan Tugas"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {latestSubmission ? (
                <div className="space-y-4">
                  {/* Submission Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(latestSubmission.status)}>{getStatusText(latestSubmission.status)}</Badge>
                      <span className="text-sm text-slate-400">
                        Dikumpulkan:{" "}
                        {new Date(latestSubmission.submitted_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {latestSubmission.score !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {latestSubmission.score}/{assignment.points}
                        </div>
                        <div className="text-sm text-slate-400">Skor</div>
                      </div>
                    )}
                  </div>

                  {/* Submission Content */}
                  {latestSubmission.submission_text && (
                    <div className="p-4 bg-slate-900 rounded border border-slate-600">
                      <h4 className="font-medium text-white mb-2">Jawaban Anda:</h4>
                      <p className="text-slate-300 whitespace-pre-wrap">{latestSubmission.submission_text}</p>
                    </div>
                  )}

                  {/* Submitted File */}
                  {latestSubmission.submission_file && (
                    <div className="p-4 bg-slate-900 rounded border border-slate-600">
                      <h4 className="font-medium text-white mb-3">File yang dikumpulkan:</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">{latestSubmission.submission_file.file_name}</p>
                            <p className="text-sm text-slate-400">{(latestSubmission.submission_file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-slate-600">
                          <a href={latestSubmission.submission_file.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {latestSubmission.feedback && (
                    <div className="p-4 bg-blue-900/20 rounded border border-blue-700">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-blue-400" />
                        <h4 className="font-medium text-blue-300">Feedback dari Mentor:</h4>
                      </div>
                      <p className="text-blue-100 whitespace-pre-wrap">{latestSubmission.feedback}</p>
                      {latestSubmission.graded_at && (
                        <p className="text-xs text-blue-400 mt-2">
                          Dinilai pada:{" "}
                          {new Date(latestSubmission.graded_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    {canSubmit() ? "Belum ada pengumpulan. Klik tombol 'Kumpulkan Tugas' untuk mengumpulkan." : isOverdue() ? "Batas waktu pengumpulan telah berakhir." : "Tugas sudah tidak dapat dikumpulkan lagi."}
                  </p>
                  {canSubmit() && (
                    <Button onClick={() => setIsSubmissionDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />
                      Kumpulkan Tugas
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
