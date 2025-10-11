import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

// Removed ASSIGNMENT_TYPES and FILE_TYPES constants
// New simplified system: students can submit text or files or both automatically

export function AssignmentFormDialog({ open, onOpenChange, onSubmit, loading, mode = "create", initialData = null, courseId }) {
  const [formData, setFormData] = useState({
    course_id: courseId || "",
    title: "",
    description: "",
    instructions: "",
    max_points: 100,
    // Removed assignment_type, max_file_size, allowed_file_types, max_attempts, grading_rubric
    // System now automatically accepts text/files without restrictions
  });

  const [questionFile, setQuestionFile] = useState(null);
  const [existingQuestionFile, setExistingQuestionFile] = useState(null);

  // Removed rubricItem state - not needed in simplified system

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          course_id: initialData.course_id || courseId || "",
          title: initialData.title || "",
          description: initialData.description || "",
          instructions: initialData.instructions || "",
          max_points: initialData.max_points || 100,
        });
        setExistingQuestionFile(initialData.question_file || null);
        setQuestionFile(null);
      } else {
        setFormData({
          course_id: courseId || "",
          title: "",
          description: "",
          instructions: "",
          max_points: 100,
        });
        setExistingQuestionFile(null);
        setQuestionFile(null);
      }
      // Removed rubricItem reset
    }
  }, [open, mode, initialData, courseId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Removed functions: handleFileTypeToggle, addRubricItem, removeRubricItem
  // These are no longer needed in the simplified assignment system

  const handleQuestionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }

      setQuestionFile(file);
    }
  };

  const removeQuestionFile = () => {
    setQuestionFile(null);
    setExistingQuestionFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Judul assignment harus diisi");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Deskripsi assignment harus diisi");
      return;
    }

    // Ensure courseId is always included
    const finalFormData = {
      ...formData,
      course_id: courseId, // Make sure courseId is included
    };

    console.log("Submitting assignment data:", finalFormData);

    // Prepare submission data - use FormData if there's a question file to upload
    if (questionFile) {
      const submissionData = new FormData();

      // Add all form fields
      Object.keys(finalFormData).forEach((key) => {
        const value = finalFormData[key];
        if (value !== null && value !== undefined && value !== "") {
          submissionData.append(key, value);
        }
      });

      // Add question file
      submissionData.append("question_file", questionFile);

      console.log("Submitting FormData with course_id:", submissionData.get("course_id"));
      onSubmit(submissionData);
    } else {
      // No file upload, send regular JSON data
      console.log("Final form data:", finalFormData);
      onSubmit(finalFormData);
    }
  };

  // Removed selectedAssignmentType - not needed in simplified system

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {mode === "create" ? "Buat Assignment Baru" : "Edit Assignment"}
          </DialogTitle>
          <DialogDescription className="text-slate-300">{mode === "create" ? "Buat tugas pembelajaran untuk siswa Anda" : "Perbarui informasi assignment"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">
                Judul Assignment *
              </Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Contoh: Tugas Membuat Website Portfolio" className="bg-slate-800 border-slate-600 text-white" required />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">
                Deskripsi *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Deskripsi singkat tentang assignment ini..."
                className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions" className="text-slate-300">
                Instruksi Detail
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Instruksi lengkap untuk mengerjakan assignment..."
                className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Question File Upload */}
            <div>
              <Label className="text-slate-300 mb-2 block">File Soal (Optional)</Label>
              <div className="space-y-3">
                {!questionFile && !existingQuestionFile && (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleQuestionFileChange} className="hidden" id="question-file-upload" />
                    <label htmlFor="question-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-400" />
                      <p className="text-slate-300 font-medium">Upload File Soal</p>
                      <p className="text-slate-500 text-sm">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                    </label>
                  </div>
                )}

                {(questionFile || existingQuestionFile) && (
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{questionFile ? questionFile.name : existingQuestionFile?.file_name || "Question File"}</p>
                        <p className="text-slate-400 text-sm">
                          {questionFile ? `${(questionFile.size / (1024 * 1024)).toFixed(2)} MB` : existingQuestionFile?.file_size ? `${(existingQuestionFile.file_size / (1024 * 1024)).toFixed(2)} MB` : "Unknown size"}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeQuestionFile} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {existingQuestionFile && !questionFile && (
                  <div className="flex gap-2">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleQuestionFileChange} className="hidden" id="question-file-replace" />
                    <label htmlFor="question-file-replace" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Replace File
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_points" className="text-slate-300">
                  Nilai Maksimal
                </Label>
                <Input id="max_points" type="number" min="1" value={formData.max_points} onChange={(e) => handleInputChange("max_points", parseInt(e.target.value))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-white">Submission Guidelines</h4>
            </div>
            <p className="text-slate-300 text-sm">Students can submit their work in any of the following ways:</p>
            <ul className="text-slate-400 text-sm mt-2 space-y-1">
              <li>• Upload files (PDF, images, documents) up to 50MB</li>
              <li>• Write text responses directly</li>
              <li>• Combine both text and files</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Menyimpan..." : mode === "create" ? "Buat Assignment" : "Perbarui Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
