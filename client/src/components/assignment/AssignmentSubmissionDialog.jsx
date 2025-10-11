import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle, X, Download, Eye, RotateCcw } from "lucide-react";

import useAssignmentStore from "@/store/assignmentStore";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

export function AssignmentSubmissionDialog({ open, onOpenChange, assignment, userSubmission = null }) {
  const { submitAssignmentWork, loading } = useAssignmentStore();
  const [submissionData, setSubmissionData] = useState({
    text_submission: userSubmission?.text_submission || "",
    files: [],
  });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const fileInputRef = useRef();

  const canSubmit = !userSubmission || userSubmission.status === "draft" || userSubmission.status === "returned_for_revision";
  const hasExistingSubmission = userSubmission && userSubmission.status !== "not_submitted";

  // File upload handling with react-dropzone
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      rejectedFiles.forEach((file) => {
        if (file.errors.some((e) => e.code === "file-too-large")) {
          toast.error(`File ${file.file.name} terlalu besar. Maksimal ${Math.round(assignment.max_file_size / (1024 * 1024))} MB`);
        } else if (file.errors.some((e) => e.code === "file-invalid-type")) {
          toast.error(`Tipe file ${file.file.name} tidak diizinkan. Hanya: ${assignment.allowed_file_types.join(", ")}`);
        }
      });

      // Handle accepted files
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      setSubmissionData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
      }));
    },
    [assignment]
  );

  const getAcceptedFileTypes = () => {
    // Temporarily disable file type restrictions to avoid MIME type issues
    // TODO: Implement proper file validation
    return undefined; // Accept all files for now
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxSize: 50 * 1024 * 1024, // 50MB default
    disabled: false, // Always allow file upload for simplified system
  });

  const removeFile = (fileId) => {
    setSubmissionData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  const handleTextChange = (value) => {
    setSubmissionData((prev) => ({
      ...prev,
      text_submission: value,
    }));
  };

  const validateSubmission = () => {
    // Untuk sistem yang sudah disederhanakan, selalu izinkan text dan file submission
    const hasText = submissionData.text_submission?.trim();
    const hasFiles = submissionData.files.length > 0;

    if (!hasText && !hasFiles) {
      toast.error("Silakan isi text submission atau upload file (atau keduanya)");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;

    try {
      // Prepare submission data object for the store
      const submissionDataForStore = {
        textContent: submissionData.text_submission?.trim() || "",
        files: submissionData.files.map((f) => f.file), // Extract File objects
      };

      console.log("Submitting assignment:", {
        assignmentId: assignment._id,
        hasText: !!submissionDataForStore.textContent,
        fileCount: submissionDataForStore.files.length,
      });

      const result = await submitAssignmentWork(assignment._id, submissionDataForStore);

      // Only close dialog if submission was successful
      if (result.success) {
        toast.success("Assignment berhasil disubmit!");
        onOpenChange(false);
        // Optionally refresh the page or assignment data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      // Toast notifications are handled by the store
    } catch (error) {
      // Error handling and toast are handled by the store
      console.error("Submission error:", error);
      toast.error("Gagal submit assignment. Silakan coba lagi.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSubmissionStatusBadge = () => {
    if (!userSubmission) return null;

    const statusConfig = {
      submitted: { label: "Submitted", color: "bg-blue-500" },
      graded: { label: "Graded", color: "bg-green-500" },
      returned: { label: "Returned", color: "bg-yellow-500" },
    };

    const config = statusConfig[userSubmission.status] || { label: userSubmission.status, color: "bg-gray-500" };

    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  if (!assignment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              {assignment.title}
            </DialogTitle>
            <DialogDescription className="text-slate-300">{assignment.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Assignment Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  Informasi Assignment
                  {getSubmissionStatusBadge()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-slate-400">Nilai Maksimal</p>
                      <p className="text-white font-medium">{assignment.max_points || 100} poin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-slate-400">Tipe Submission</p>
                      <p className="text-white font-medium">Text & File</p>
                    </div>
                  </div>
                </div>

                {!canSubmit && (
                  <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-500/50 rounded-lg">
                    <X className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-200">Submission sudah final atau tidak dapat diubah lagi</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            {assignment.instructions && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-300">Instruksi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{assignment.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Existing Submission */}
            {hasExistingSubmission && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
                    Submission Terakhir
                    <Badge className="bg-slate-700 text-slate-300">Attempt {userSubmission.attempt_count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userSubmission.text_submission && (
                    <div>
                      <Label className="text-slate-400 text-xs">Text Submission</Label>
                      <div className="mt-1 p-3 bg-slate-900 rounded-lg">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{userSubmission.text_submission}</p>
                      </div>
                    </div>
                  )}

                  {userSubmission.files && userSubmission.files.length > 0 && (
                    <div>
                      <Label className="text-slate-400 text-xs">Files</Label>
                      <div className="mt-1 space-y-2">
                        {userSubmission.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-slate-300">{file.original_name}</span>
                              <span className="text-xs text-slate-400">({formatFileSize(file.size)})</span>
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

                  {userSubmission.grade !== null && (
                    <div className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-blue-300 text-sm font-medium">Nilai</Label>
                        <Badge className="bg-blue-600 text-white">
                          {userSubmission.grade}/{assignment.max_points}
                        </Badge>
                      </div>
                      {userSubmission.feedback && <p className="text-sm text-slate-300">{userSubmission.feedback}</p>}
                    </div>
                  )}

                  <div className="text-xs text-slate-400">Submitted: {new Date(userSubmission.submitted_at).toLocaleDateString()}</div>
                </CardContent>
              </Card>
            )}

            {/* New Submission Form */}
            {canSubmit && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    {hasExistingSubmission ? <RotateCcw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                    {hasExistingSubmission ? "Submit Ulang" : "Submit Assignment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Text Submission */}
                  <div>
                    <Label htmlFor="text_submission" className="text-slate-300 flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Text Submission
                      <Badge variant="outline" className="text-xs">
                        Opsional
                      </Badge>
                    </Label>
                    <Textarea
                      id="text_submission"
                      value={submissionData.text_submission}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Tulis jawaban, penjelasan, atau komentar Anda di sini..."
                      className="bg-slate-900 border-slate-600 text-white min-h-[120px] focus:border-blue-500 transition-colors"
                      rows={5}
                    />
                    <p className="text-xs text-slate-500 mt-1">Anda dapat menjelaskan jawaban atau memberikan komentar tentang submission Anda</p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="text-slate-300 flex items-center gap-2 mb-3">
                      <Upload className="w-4 h-4 text-green-400" />
                      File Upload
                      <Badge variant="outline" className="text-xs">
                        Opsional
                      </Badge>
                    </Label>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-slate-600 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900"
                      }`}
                    >
                      <input {...getInputProps()} ref={fileInputRef} />
                      <div className="space-y-3">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragActive ? "bg-blue-500/20" : "bg-slate-800"}`}>
                          <Upload className={`w-8 h-8 transition-colors ${isDragActive ? "text-blue-400" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="text-base font-medium text-slate-300 mb-1">{isDragActive ? "Drop files di sini..." : "Drag & drop files atau klik untuk pilih"}</p>
                          <p className="text-sm text-slate-400">Maksimal 50 MB per file • Semua tipe file diperbolehkan</p>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {submissionData.files.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <Label className="text-slate-300 text-sm font-medium">Files yang akan disubmit ({submissionData.files.length})</Label>
                        <div className="space-y-2">
                          {submissionData.files.map((fileData) => (
                            <div key={fileData.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                  <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-200">{fileData.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">{formatFileSize(fileData.size)}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {fileData.type.split("/")[1]?.toUpperCase() || "FILE"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => removeFile(fileData.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Tutup
            </Button>
            {canSubmit && (
              <Button onClick={() => setConfirmDialog(true)} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Mengirim..." : hasExistingSubmission ? "Submit Ulang" : "Submit Assignment"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Konfirmasi Submit Assignment
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {hasExistingSubmission ? "Anda akan mengganti submission sebelumnya. Tindakan ini tidak dapat dibatalkan." : "Pastikan semua data sudah benar sebelum submit. Anda masih memiliki kesempatan untuk submit ulang."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Mengirim..." : "Ya, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
