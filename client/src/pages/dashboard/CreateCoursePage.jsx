import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useCourseStore from "@/store/courseStore";
import toast from "react-hot-toast";
import { debugCourseData } from "@/utils/debugCourse";

// Course categories (sesuai model enum)
const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Design",
  "UI/UX",
  "Digital Marketing",
  "Business",
  "Language",
  "Mathematics",
  "Science",
  "Art & Creative",
  "Music",
  "Photography",
  "Writing",
  "Personal Development",
  "Other",
];

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { createCourse, loading } = useCourseStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    coverImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [currentTag, setCurrentTag] = useState("");

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP).");
        e.target.value = ""; // Reset input
        return;
      }

      // Check file size (10MB limit to match backend)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 10MB.");
        e.target.value = ""; // Reset input
        return;
      }

      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
    }));
    setImagePreview(null);
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()],
      }));
      setCurrentTag("");
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Judul kursus harus diisi");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Deskripsi kursus harus diisi");
      return;
    }
    if (!formData.category) {
      toast.error("Kategori kursus harus dipilih");
      return;
    }

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        coverImage: formData.coverImage,
      };

      // Debug: Check if cover image exists before sending
      console.log("=== CreateCoursePage Debug ===");
      console.log("Cover Image File:", {
        exists: !!formData.coverImage,
        fileName: formData.coverImage?.name,
        fileType: formData.coverImage?.type,
        fileSize: formData.coverImage?.size,
        isFileInstance: formData.coverImage instanceof File,
      });

      // Debug data structure
      if (!debugCourseData(courseData)) {
        toast.error("Data tidak valid, silakan periksa form");
        return;
      }

      const result = await createCourse(courseData);

      if (result.success) {
        toast.success("Kursus berhasil dibuat!");
        navigate("/dashboard/manage-courses");
      } else {
        toast.error(result.error || "Gagal membuat kursus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat membuat kursus");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1624] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard/manage-courses")} className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Manage Courses
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Buat Kursus Baru</h1>
              <p className="text-gray-400">Buat kursus baru untuk dibagikan kepada siswa</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-[#1E293B] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">
                      Judul Kursus *
                    </Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Masukkan judul kursus" className="bg-[#0F1624] border-gray-600 text-white" required />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-300">
                      Deskripsi Kursus *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Jelaskan tentang kursus ini..."
                      rows={4}
                      className="bg-[#0F1624] border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-300">
                      Kategori *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-[#0F1624] border-gray-600 text-white">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-gray-600">
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category} className="text-white hover:bg-[#0F1624]">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-[#1E293B] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tags Kursus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Tambahkan tag (contoh: javascript, react, frontend)..."
                      className="bg-[#0F1624] border-gray-600 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} className="bg-blue-600 hover:bg-blue-700">
                      Tambah
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-white px-3 py-1">
                        {tag}
                        <X className="w-4 h-4 ml-2 cursor-pointer hover:text-red-400" onClick={() => removeTag(index)} />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cover Image */}
            <div className="space-y-6">
              <Card className="bg-[#1E293B] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Cover Kursus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-400 mb-2">Upload cover kursus</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP maksimal 10MB</p>
                      </div>
                    )}

                    <Input type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="bg-[#0F1624] border-gray-600 text-white" />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card className="bg-[#1E293B] border-gray-700">
                <CardContent className="pt-6">
                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50">
                    {loading ? "Membuat Kursus..." : "Buat Kursus"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
