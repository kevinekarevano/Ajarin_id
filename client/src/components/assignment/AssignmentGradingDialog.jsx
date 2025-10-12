import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, FileText, Download } from "lucide-react";
import useAssignmentStore from "@/store/assignmentStore";
import toast from "react-hot-toast";

export function AssignmentGradingDialog({ open, onOpenChange, submission, assignment }) {
  const { gradeSubmission, loading } = useAssignmentStore();

  const [gradeData, setGradeData] = useState({
    score: submission?.grading?.score || "",
    feedback: submission?.grading?.feedback || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gradeData.score || gradeData.score < 0 || gradeData.score > (assignment.max_points || 100)) {
      toast.error(`Nilai harus antara 0 - ${assignment.max_points || 100}`);
      return;
    }

    try {
      const result = await gradeSubmission(submission._id, {
        score: parseInt(gradeData.score),
        comments: gradeData.feedback.trim() || "",
      });

      if (result.success) {
        toast.success("Nilai berhasil disimpan!");
        onOpenChange(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Gagal menyimpan nilai");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!submission || !assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Penilaian Submission
          </DialogTitle>
          <DialogDescription className="text-slate-300">Berikan nilai dan feedback untuk submission dari {submission.student_id?.fullname}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{submission.student_id?.fullname?.charAt(0) || "U"}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{submission.student_id?.fullname}</h3>
                <p className="text-sm text-slate-400">Submitted: {new Date(submission.submitted_at).toLocaleString("id-ID")}</p>
              </div>
              <Badge className="ml-auto bg-blue-500/10 text-blue-400 border-blue-500/20">{submission.status}</Badge>
            </div>
          </div>

          {/* Submission Content */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Submission Content</h4>

            {/* Text Content */}
            {submission.content?.text_content && (
              <div>
                <Label className="text-slate-300 text-sm">Text Submission</Label>
                <div className="mt-2 bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-slate-300 whitespace-pre-wrap">{submission.content.text_content}</p>
                </div>
              </div>
            )}

            {/* Files */}
            {submission.content?.files_info && submission.content.files_info.length > 0 && (
              <div>
                <Label className="text-slate-300 text-sm">Files ({submission.content.files_info.length})</Label>
                <div className="mt-2 space-y-2">
                  {submission.content.files_info.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">{file.file_name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.file_size)}</p>
                        </div>
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
          </div>

          {/* Grading Form */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Penilaian
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="score" className="text-slate-300">
                  Nilai (0 - {assignment.max_points || 100})
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max={assignment.max_points || 100}
                  value={gradeData.score}
                  onChange={(e) => setGradeData((prev) => ({ ...prev, score: e.target.value }))}
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  placeholder="Masukkan nilai"
                  required
                />
              </div>
              <div className="flex items-end">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-600 w-full">
                  <p className="text-sm text-slate-400">Persentase</p>
                  <p className="text-lg font-semibold text-white">{gradeData.score ? Math.round((gradeData.score / (assignment.max_points || 100)) * 100) : 0}%</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="feedback" className="text-slate-300">
                Feedback untuk Student (Opsional)
              </Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData((prev) => ({ ...prev, feedback: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white mt-1"
                placeholder="Berikan feedback, saran, atau komentar untuk membantu student..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-slate-700">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !gradeData.score} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
