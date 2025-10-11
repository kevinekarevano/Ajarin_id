import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Clock, Star, Download, Send, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import useAssignmentStore from "@/store/assignmentStore";
import toast from "react-hot-toast";

export function AssignmentGradingDialog({ open, onOpenChange, assignment }) {
  const { submissions, loading, fetchAssignmentSubmissions, gradeSubmission } = useAssignmentStore();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    grade: "",
    feedback: "",
  });
  const [gradingDialog, setGradingDialog] = useState(false);

  useEffect(() => {
    if (open && assignment?._id) {
      fetchAssignmentSubmissions(assignment._id);
    }
  }, [open, assignment, fetchAssignmentSubmissions]);

  useEffect(() => {
    if (selectedSubmission) {
      setGradeData({
        grade: selectedSubmission.grade || "",
        feedback: selectedSubmission.feedback || "",
      });
    }
  }, [selectedSubmission]);

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !gradeData.grade) {
      toast.error("Grade harus diisi");
      return;
    }

    const grade = parseInt(gradeData.grade);
    if (isNaN(grade) || grade < 0 || grade > assignment.max_points) {
      toast.error(`Grade harus antara 0-${assignment.max_points}`);
      return;
    }

    try {
      await gradeSubmission(selectedSubmission._id, {
        grade,
        feedback: gradeData.feedback,
      });
      toast.success("Submission berhasil dinilai");
      setGradingDialog(false);
      setSelectedSubmission(null);
    } catch (error) {
      toast.error("Gagal memberikan nilai");
    }
  };

  const getSubmissionStatusConfig = (submission) => {
    if (submission.grade !== null) {
      const percentage = (submission.grade / assignment.max_points) * 100;
      if (percentage >= 80) return { label: "Excellent", color: "bg-green-500", icon: CheckCircle };
      if (percentage >= 60) return { label: "Good", color: "bg-blue-500", icon: CheckCircle };
      if (percentage >= 40) return { label: "Fair", color: "bg-yellow-500", icon: AlertTriangle };
      return { label: "Poor", color: "bg-red-500", icon: XCircle };
    }

    if (submission.status === "submitted") {
      return { label: "Pending Review", color: "bg-orange-500", icon: Clock };
    }

    return { label: submission.status, color: "bg-gray-500", icon: Clock };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSubmissionStats = () => {
    if (!submissions || submissions.length === 0) return null;

    const total = submissions.length;
    const graded = submissions.filter((s) => s.grade !== null).length;
    const pending = total - graded;
    const avgGrade = graded > 0 ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / graded : 0;

    return { total, graded, pending, avgGrade };
  };

  const stats = getSubmissionStats();

  if (!assignment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Submissions - {assignment.title}
            </DialogTitle>
            <DialogDescription className="text-slate-300">Review dan berikan nilai untuk submission siswa</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Assignment Info & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-300">Assignment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Max Points:</span>
                    <span className="text-white">{assignment.max_points}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">{assignment.assignment_type === "both" ? "File & Text" : assignment.assignment_type === "file_upload" ? "File Upload" : "Text Submission"}</span>
                  </div>
                </CardContent>
              </Card>

              {stats && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-300">Submission Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                        <p className="text-xs text-slate-400">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.graded}</p>
                        <p className="text-xs text-slate-400">Graded</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                        <p className="text-xs text-slate-400">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{stats.avgGrade.toFixed(1)}</p>
                        <p className="text-xs text-slate-400">Avg Grade</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Submissions List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Student Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((submission) => {
                      const statusConfig = getSubmissionStatusConfig(submission);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <Card
                          key={submission._id}
                          className={`bg-slate-900 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors ${selectedSubmission?._id === submission._id ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-white">{submission.student_id?.name || submission.student_id?.email || "Unknown Student"}</h4>
                                  <Badge className={`${statusConfig.color} text-white text-xs`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span>Attempt {submission.attempt_count}</span>
                                  <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                                  {submission.grade !== null && (
                                    <span className="text-blue-400 font-medium">
                                      {submission.grade}/{assignment.max_points}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {submission.grade === null && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubmission(submission);
                                      setGradingDialog(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    Grade
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubmission(submission);
                                  }}
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Belum Ada Submission</h3>
                    <p className="text-slate-400">Belum ada siswa yang submit assignment ini</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Submission Detail */}
            {selectedSubmission && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white flex items-center justify-between">
                    Submission Detail
                    <Button onClick={() => setGradingDialog(true)} disabled={selectedSubmission.grade !== null} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Star className="w-4 h-4 mr-1" />
                      {selectedSubmission.grade !== null ? "Graded" : "Grade This"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                      <TabsTrigger value="content" className="data-[state=active]:bg-slate-600">
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="grade" className="data-[state=active]:bg-slate-600">
                        Grade & Feedback
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4 mt-4">
                      {/* Text Submission */}
                      {selectedSubmission.text_submission && (
                        <div>
                          <Label className="text-slate-300 font-medium">Text Submission</Label>
                          <div className="mt-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
                            <p className="text-slate-300 whitespace-pre-wrap">{selectedSubmission.text_submission}</p>
                          </div>
                        </div>
                      )}

                      {/* Files */}
                      {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                        <div>
                          <Label className="text-slate-300 font-medium">Uploaded Files</Label>
                          <div className="mt-2 space-y-2">
                            {selectedSubmission.files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-400" />
                                  <div>
                                    <p className="text-sm text-slate-300">{file.original_name}</p>
                                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="grade" className="space-y-4 mt-4">
                      {selectedSubmission.grade !== null ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <Label className="text-slate-300 font-medium">Grade</Label>
                              <div className="mt-1">
                                <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                                  {selectedSubmission.grade}/{assignment.max_points}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <Label className="text-slate-300 font-medium">Percentage</Label>
                              <p className="text-xl font-bold text-white">{((selectedSubmission.grade / assignment.max_points) * 100).toFixed(1)}%</p>
                            </div>
                          </div>

                          {selectedSubmission.feedback && (
                            <div>
                              <Label className="text-slate-300 font-medium">Feedback</Label>
                              <div className="mt-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <p className="text-slate-300 whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                              </div>
                            </div>
                          )}

                          <div className="text-sm text-slate-400">Graded at: {new Date(selectedSubmission.graded_at).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-400">Submission belum dinilai</p>
                          <Button onClick={() => setGradingDialog(true)} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                            Berikan Nilai
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Dialog */}
      <Dialog open={gradingDialog} onOpenChange={setGradingDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Berikan Nilai
            </DialogTitle>
            <DialogDescription className="text-slate-300">Berikan nilai dan feedback untuk submission {selectedSubmission?.student_id?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade" className="text-slate-300">
                  Nilai * (0-{assignment.max_points})
                </Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max={assignment.max_points}
                  value={gradeData.grade}
                  onChange={(e) => setGradeData((prev) => ({ ...prev, grade: e.target.value }))}
                  placeholder="0"
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="flex items-end">
                <div className="text-center">
                  <Label className="text-slate-300 text-sm">Persentase</Label>
                  <p className="text-2xl font-bold text-blue-400">{gradeData.grade ? ((parseInt(gradeData.grade) / assignment.max_points) * 100).toFixed(1) : "0"}%</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-slate-300">
                Feedback (Opsional)
              </Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData((prev) => ({ ...prev, feedback: e.target.value }))}
                placeholder="Berikan feedback untuk membantu siswa memahami penilaian..."
                className="bg-slate-800 border-slate-600 text-white min-h-[100px] mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGradingDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Batal
            </Button>
            <Button onClick={handleGradeSubmission} disabled={loading || !gradeData.grade} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Simpan Nilai
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
