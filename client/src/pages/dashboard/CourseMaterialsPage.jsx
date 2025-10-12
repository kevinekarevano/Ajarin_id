import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, BookOpen, Users, Clock, FileText, AlertTriangle, Shuffle, Eye, Settings, TrendingUp, ChevronUp } from "lucide-react";
import useCourseStore from "@/store/courseStore";
import useMaterialStore from "@/store/materialStore";
import useAuthStore from "@/store/authStore";
import { MaterialFormDialog } from "@/components/material/MaterialFormDialog";
import { MaterialList } from "@/components/material/MaterialList";
// import { BulkReorderDialog } from "@/components/material/BulkReorderDialog";
import toast from "react-hot-toast";

export default function CourseMaterialsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { selectedCourse, fetchCourseById, loading: courseLoading } = useCourseStore();

  const { materials, loading: materialLoading, fetchCourseMaterials, createMaterial, updateMaterial, deleteMaterial, reorderMaterials, clearMaterials } = useMaterialStore();

  // Local state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [groupByChapter, setGroupByChapter] = useState(true);
  const [showReorderControls, setShowReorderControls] = useState(false);
  // const [showBulkReorderDialog, setShowBulkReorderDialog] = useState(false);

  // Load course and materials
  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchCourseMaterials(courseId);
    }

    return () => {
      clearMaterials();
    };
  }, [courseId]);

  // Handlers
  const handleCreateMaterial = async (materialData) => {
    const result = await createMaterial({
      ...materialData,
      course_id: courseId,
    });

    if (result.success) {
      setShowCreateDialog(false);
      // Refresh materials
      fetchCourseMaterials(courseId);
    }
  };

  const handleEditMaterial = async (materialData) => {
    if (!selectedMaterial) return;

    const result = await updateMaterial(selectedMaterial._id, materialData);

    if (result.success) {
      setShowEditDialog(false);
      setSelectedMaterial(null);
      // Refresh materials
      fetchCourseMaterials(courseId);
    }
  };

  const handleDeleteMaterial = (material) => {
    setMaterialToDelete(material);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;

    const result = await deleteMaterial(materialToDelete._id);

    if (result.success) {
      setShowDeleteDialog(false);
      setMaterialToDelete(null);
      // Refresh materials
      fetchCourseMaterials(courseId);
    }
  };

  const handleViewMaterial = (material) => {
    // Navigate to material view page
    navigate(`/dashboard/courses/${courseId}/materials/${material._id}`);
  };

  const handleEditClick = (material) => {
    setSelectedMaterial(material);
    setShowEditDialog(true);
  };

  const handleReorderMaterials = async (fromIndex, toIndex) => {
    const reorderedMaterials = [...materials];
    const [movedItem] = reorderedMaterials.splice(fromIndex, 1);
    reorderedMaterials.splice(toIndex, 0, movedItem);

    // Create order array with format expected by backend: { id, order, chapter }
    const materialOrders = reorderedMaterials.map((material, index) => ({
      id: material._id,
      order: index + 1,
      chapter: material.chapter || "General",
    }));

    const result = await reorderMaterials(courseId, materialOrders);

    if (result.success) {
      toast.success("Urutan materi berhasil diubah!");
      // Refresh materials to get updated order from server
      fetchCourseMaterials(courseId);
    } else {
      toast.error("Gagal mengubah urutan materi");
    }
  };

  // Check if user is mentor of this course
  const isMentor =
    selectedCourse &&
    user &&
    // If mentor_id is populated (object with _id)
    (selectedCourse.mentor_id?._id === user._id ||
      // If mentor_id is just a string ID
      selectedCourse.mentor_id === user._id ||
      // Additional fallback checks
      selectedCourse.instructor_id === user._id ||
      selectedCourse.created_by === user._id);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-[#0F1624] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-[#0F1624] text-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Course Tidak Ditemukan</h2>
              <p className="text-slate-400">Course yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
              <Button onClick={() => navigate("/dashboard/manage-courses")} className="mt-4">
                Kembali ke Manage Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isMentor) {
    return (
      <div className="min-h-screen bg-[#0F1624] text-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Akses Ditolak</h2>
              <p className="text-slate-400">Anda tidak memiliki akses untuk mengelola materi course ini.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4">
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // const handleBulkReorder = async (materialOrders) => {
  //   const result = await reorderMaterials(courseId, materialOrders);

  //   if (result.success) {
  //     toast.success("Bulk reorder berhasil!");
  //     setShowBulkReorderDialog(false);
  //     // Refresh materials to get updated order from server
  //     fetchCourseMaterials(courseId);
  //   } else {
  //     toast.error("Gagal melakukan bulk reorder");
  //   }
  // };

  // Material stats calculation
  const materialStats = {
    total: materials?.length || 0,
    documents: materials?.filter((m) => m.type === "document")?.length || 0,
    videos: materials?.filter((m) => m.type === "video")?.length || 0,
    images: materials?.filter((m) => m.type === "image")?.length || 0,
    links: materials?.filter((m) => m.type === "link")?.length || 0,
    totalDuration: materials?.reduce((acc, m) => acc + (m.duration_minutes || 0), 0) || 0,
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Kelola Materi Course</h1>
              <h2 className="text-xl text-blue-400 mb-2">{selectedCourse?.title || "Loading..."}</h2>
              <p className="text-slate-400">{selectedCourse?.description || "Loading course information..."}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => navigate(`/courses/${selectedCourse?.slug || selectedCourse?._id || ""}`)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Eye className="w-4 h-4 mr-2" />
                Preview Course
              </Button>

              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Materi
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{materialStats.total}</p>
                  <p className="text-xs text-slate-400">Total Materi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{materialStats.documents}</p>
                  <p className="text-xs text-slate-400">Dokumen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{Math.floor(materialStats.totalDuration / 60)}j</p>
                  <p className="text-xs text-slate-400">Total Durasi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{selectedCourse.total_enrollments || 0}</p>
                  <p className="text-xs text-slate-400">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="materials" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="materials" className="text-slate-300">
                Daftar Materi ({materialStats.total})
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-slate-300">
                Pengaturan
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Group by Chapter Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="group-mode" className="text-slate-300 text-sm">
                    Group by Chapter
                  </Label>
                  <Switch id="group-mode" checked={groupByChapter} onCheckedChange={setGroupByChapter} />
                </div>

                {/* Drag & Drop Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="reorder-mode" className="text-slate-300 text-sm">
                    Drag & Drop Mode
                  </Label>
                  <Switch id="reorder-mode" checked={isDraggable} onCheckedChange={setIsDraggable} />
                </div>

                {/* Reorder Controls Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="controls-mode" className="text-slate-300 text-sm">
                    Reorder Controls
                  </Label>
                  <Switch id="controls-mode" checked={showReorderControls} onCheckedChange={setShowReorderControls} />
                </div>
              </div>

              {/* Bulk Reorder Button - Temporarily disabled */}
              <Button variant="outline" onClick={() => toast.info("Bulk reorder feature coming soon!")} disabled={!materials?.length} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Bulk Reorder
              </Button>
            </div>
          </div>

          <TabsContent value="materials" className="space-y-6">
            {(isDraggable || showReorderControls) && (
              <Card className="bg-blue-900/20 border-blue-700 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {isDraggable && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <Shuffle className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-blue-300 font-medium">Mode Drag & Drop Aktif</p>
                          <p className="text-blue-400/80 text-sm">Seret dan lepas materi untuk mengubah urutan pembelajaran</p>
                        </div>
                      </div>
                    )}

                    {showReorderControls && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <ChevronUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-green-300 font-medium">Reorder Controls Aktif</p>
                          <p className="text-green-400/80 text-sm">Gunakan tombol ↑↓, #posisi, atau dropdown untuk mengatur urutan</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <MaterialList
              materials={materials}
              loading={materialLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteMaterial}
              onView={handleViewMaterial}
              isDraggable={isDraggable}
              onReorder={handleReorderMaterials}
              showActions={true}
              groupByChapter={groupByChapter}
              showReorderControls={showReorderControls}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pengaturan Materi</CardTitle>
                <CardDescription className="text-slate-400">Kelola pengaturan dan organisasi materi course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Auto-numbering Materi</Label>
                      <p className="text-sm text-slate-400">Otomatis memberikan nomor urut pada materi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Preview Mode</Label>
                      <p className="text-sm text-slate-400">Izinkan preview materi tanpa enrollment</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Pengaturan Lanjutan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <MaterialFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSubmit={handleCreateMaterial} loading={materialLoading} mode="create" courseId={courseId} />

        <MaterialFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} onSubmit={handleEditMaterial} loading={materialLoading} mode="edit" initialData={selectedMaterial} courseId={courseId} />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-3 text-red-400 text-lg">
                <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                Konfirmasi Hapus Materi
              </DialogTitle>
              <DialogDescription className="text-slate-300 mt-2 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Materi akan dihapus secara permanen dari course.</DialogDescription>
            </DialogHeader>

            {materialToDelete && (
              <div className="py-4 border-t border-b border-slate-700">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-600/50">
                  <h4 className="font-medium text-slate-200 mb-3 text-sm uppercase tracking-wide">Materi yang akan dihapus:</h4>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white mb-1">{materialToDelete.title}</h5>
                      <p className="text-sm text-slate-400 mb-2">{materialToDelete.description || "Tidak ada deskripsi"}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Tipe: {materialToDelete.type}</span>
                        {materialToDelete.chapter && (
                          <>
                            <span>•</span>
                            <span>{materialToDelete.chapter}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={materialLoading} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMaterial} disabled={materialLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {materialLoading ? "Menghapus..." : "Ya, Hapus Materi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Reorder Dialog - Temporarily disabled */}
        {/* <BulkReorderDialog
          open={showBulkReorderDialog}
          onOpenChange={setShowBulkReorderDialog}
          materials={materials}
          onReorder={handleBulkReorder}
          loading={materialLoading}
        /> */}
      </div>
    </div>
  );
}
