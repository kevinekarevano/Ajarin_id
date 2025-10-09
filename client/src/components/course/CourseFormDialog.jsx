import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const categories = [
  { value: "programming", label: "Pemrograman" },
  { value: "design", label: "Desain" },
  { value: "data-science", label: "Data Science" },
  { value: "marketing", label: "Marketing" },
  { value: "business", label: "Bisnis" },
  { value: "language", label: "Bahasa" },
  { value: "music", label: "Musik" },
  { value: "photography", label: "Fotografi" },
];

export function CourseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  mode = "create", // "create" or "edit"
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    tags: initialData?.tags || "",
    cover: null,
  });

  const [coverPreview, setCoverPreview] = useState(initialData?.cover_url?.url || null);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData && mode === "edit") {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
        cover: null,
      });
      setCoverPreview(initialData.cover_url?.url || null);
    } else if (open && mode === "create") {
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        cover: null,
      });
      setCoverPreview(null);
    }
  }, [open, initialData, mode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange("cover", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverPreview = () => {
    setCoverPreview(null);
    handleInputChange("cover", null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.title.trim() && formData.description.trim() && formData.category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Buat Kursus Baru" : "Edit Kursus"}</DialogTitle>
          <DialogDescription className="text-slate-400">{mode === "create" ? "Lengkapi informasi dasar untuk kursus baru Anda" : "Update informasi kursus Anda"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {coverPreview ? (
              <div className="relative">
                <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover rounded-lg" />
                <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white" onClick={removeCoverPreview}>
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">{formData.cover?.name || "Gambar saat ini"}</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Upload cover image untuk kursus</p>
                <p className="text-xs text-slate-500 mb-4">JPG, PNG, atau GIF (max. 5MB)</p>
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-slate-900 border-slate-700 text-white" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Judul Kursus <span className="text-red-400">*</span>
            </Label>
            <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Masukkan judul kursus yang menarik" className="bg-slate-900 border-slate-700 text-white" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Deskripsikan apa yang akan dipelajari siswa dalam kursus ini..."
              className="bg-slate-900 border-slate-700 text-white min-h-[120px]"
              required
            />
            <p className="text-xs text-slate-400">Semakin detail deskripsi, semakin menarik untuk calon siswa</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Kategori <span className="text-red-400">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Pilih kategori yang sesuai" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-slate-700">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags
            </Label>
            <Input id="tags" value={formData.tags} onChange={(e) => handleInputChange("tags", e.target.value)} placeholder="react, javascript, frontend, web development" className="bg-slate-900 border-slate-700 text-white" />
            <p className="text-xs text-slate-400">Pisahkan dengan koma. Tags membantu siswa menemukan kursus Anda.</p>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700" disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700" disabled={!isValid || loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                {mode === "create" ? "Membuat..." : "Menyimpan..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {mode === "create" ? "Buat Kursus" : "Simpan Perubahan"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
