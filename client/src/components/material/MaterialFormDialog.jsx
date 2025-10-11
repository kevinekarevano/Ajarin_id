import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Video, Image, Link as LinkIcon, FileVideo, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  // Handle both number and string values
  const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!numBytes || numBytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const MATERIAL_TYPES = [
  { value: "document", label: "Dokumen (PDF, DOC)", icon: FileText, accept: ".pdf,.doc,.docx", description: "Upload file dokumen" },
  { value: "image", label: "Gambar", icon: Image, accept: "image/*", description: "Upload gambar atau infografis" },
  { value: "video", label: "Video (Link)", icon: Video, accept: "", description: "Link YouTube, Vimeo, dll" },
  { value: "link", label: "Link Eksternal", icon: LinkIcon, accept: "", description: "Link ke website atau resource lain" },
];

export function MaterialFormDialog({ open, onOpenChange, onSubmit, loading, mode = "create", initialData = null, courseId }) {
  const [formData, setFormData] = useState({
    course_id: courseId || "",
    title: "",
    description: "",
    type: "",
    content_url: "",
    chapter: "",
    duration_minutes: "",
    file: null,
  });

  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          course_id: initialData.course_id || courseId || "",
          title: initialData.title || "",
          description: initialData.description || "",
          type: initialData.type || "",
          content_url: initialData.content_url || "",
          chapter: initialData.chapter || "",
          duration_minutes: initialData.duration_minutes || "",
          file: null, // Always null for edit mode, unless user uploads new file
        });
      } else {
        setFormData({
          course_id: courseId || "",
          title: "",
          description: "",
          type: "",
          content_url: "",
          chapter: "",
          duration_minutes: "",
          file: null,
        });
      }
      setFilePreview(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, mode, initialData, courseId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      content_url: "", // Reset content_url when type changes
      file: null, // Reset file when type changes
    }));
    setFilePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const selectedType = MATERIAL_TYPES.find((t) => t.value === formData.type);

      // Validate file type
      if (selectedType && selectedType.accept) {
        const acceptedTypes = selectedType.accept.split(",");
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.startsWith(type.replace("/*", ""));
        });

        if (!isValidType) {
          toast.error(`Format file tidak sesuai. Gunakan: ${selectedType.accept}`);
          e.target.value = "";
          return;
        }
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 50MB.");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        file,
      }));

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview({ name: file.name, size: file.size, type: file.type });
      }
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Judul materi harus diisi");
      return;
    }

    if (!formData.type) {
      toast.error("Tipe materi harus dipilih");
      return;
    }

    if (formData.type === "video" || formData.type === "link") {
      if (!formData.content_url.trim()) {
        toast.error("URL harus diisi untuk tipe materi ini");
        return;
      }
    }

    if ((formData.type === "document" || formData.type === "image") && mode === "create" && !formData.file) {
      toast.error("File harus diupload untuk tipe materi ini");
      return;
    }

    // Check file size and show warning for large files
    if (formData.file && formData.file.size > 10 * 1024 * 1024) {
      // 10MB
      const fileSize = formatFileSize(formData.file.size);
      toast.loading(`Mengupload file besar (${fileSize}). Mohon tunggu...`, {
        duration: 5000,
      });
    }

    setIsUploading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedType = MATERIAL_TYPES.find((t) => t.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{mode === "create" ? "Tambah Materi Baru" : "Edit Materi"}</DialogTitle>
          <DialogDescription className="text-slate-300">{mode === "create" ? "Buat materi pembelajaran untuk course Anda" : "Perbarui informasi materi"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">
                Judul Materi *
              </Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Masukkan judul materi" className="bg-slate-800 border-slate-600 text-white" required />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Deskripsi materi (opsional)"
                className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chapter" className="text-slate-300">
                  Chapter/Bab
                </Label>
                <Input id="chapter" value={formData.chapter} onChange={(e) => handleInputChange("chapter", e.target.value)} placeholder="Contoh: Chapter 1" className="bg-slate-800 border-slate-600 text-white" />
              </div>

              <div>
                <Label htmlFor="duration" className="text-slate-300">
                  Durasi (menit)
                </Label>
                <Input id="duration" type="number" min="0" value={formData.duration_minutes} onChange={(e) => handleInputChange("duration_minutes", e.target.value)} placeholder="0" className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>
          </div>

          {/* Material Type Selection */}
          <div>
            <Label className="text-slate-300 mb-3 block">Tipe Materi *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MATERIAL_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = formData.type === type.value;

                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all duration-200 ${isSelected ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50" : "bg-slate-800 border-slate-600 hover:border-slate-500"}`}
                    onClick={() => handleTypeChange(type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${isSelected ? "text-blue-300" : "text-white"}`}>{type.label}</h4>
                          <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Type-specific Content */}
          {formData.type && (
            <div className="space-y-4">
              {(formData.type === "video" || formData.type === "link") && (
                <div>
                  <Label htmlFor="content_url" className="text-slate-300">
                    {formData.type === "video" ? "URL Video *" : "URL Link *"}
                  </Label>
                  <Input
                    id="content_url"
                    type="url"
                    value={formData.content_url}
                    onChange={(e) => handleInputChange("content_url", e.target.value)}
                    placeholder={formData.type === "video" ? "https://www.youtube.com/watch?v=..." : "https://example.com"}
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.type === "video" ? "Didukung: YouTube, Vimeo, Google Drive, Dropbox" : "Masukkan URL lengkap dengan https://"}</p>
                </div>
              )}

              {(formData.type === "document" || formData.type === "image") && (
                <div>
                  <Label className="text-slate-300 mb-2 block">
                    Upload {formData.type === "document" ? "Dokumen" : "Gambar"}
                    {mode === "create" && " *"}
                  </Label>

                  {!formData.file && !filePreview ? (
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-400 mb-2">Click untuk upload {formData.type === "document" ? "dokumen" : "gambar"}</p>
                      <p className="text-xs text-slate-500">{selectedType?.accept} - Maksimal 50MB</p>
                      <Input type="file" accept={selectedType?.accept} onChange={handleFileChange} className="hidden" id="file-input" />
                      <Label htmlFor="file-input" className="inline-block mt-2 cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md transition-colors">
                        Pilih File
                      </Label>
                    </div>
                  ) : (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {typeof filePreview === "string" ? (
                            // Image preview
                            <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            // File info
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              {isUploading ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin" /> : <FileText className="w-8 h-8 text-slate-400" />}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{formData.file?.name || "File terpilih"}</p>
                            {formData.file && (
                              <div className="text-sm text-slate-400 space-y-1">
                                <p>Size: {formatFileSize(formData.file.size)}</p>
                                <p>Type: {formData.file.type}</p>
                                {formData.file.size > 10 * 1024 * 1024 && <p className="text-yellow-400 text-xs">⚠️ File besar - upload membutuhkan waktu lebih lama</p>}
                              </div>
                            )}
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {formData.type === "document" ? "Dokumen" : "Gambar"}
                            </Badge>

                            {/* Upload Progress Bar */}
                            {isUploading && uploadProgress > 0 && (
                              <div className="mt-2 space-y-1">
                                <Progress value={uploadProgress} className="w-full h-2" />
                                <p className="text-xs text-blue-400">Mengupload: {uploadProgress}%</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="text-slate-400 hover:text-white" disabled={isUploading}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || isUploading} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Batal
            </Button>
            <Button type="submit" disabled={loading || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengupload...
                </>
              ) : loading ? (
                "Menyimpan..."
              ) : mode === "create" ? (
                "Buat Materi"
              ) : (
                "Perbarui Materi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
