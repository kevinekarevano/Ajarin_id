import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Users, Clock, Star, Plus, Edit, Trash2, Eye, Upload, Search, Filter, MoreVertical, Calendar, TrendingUp, Award, Settings, Archive, AlertTriangle, FileText, MessageCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useCourseStore from "@/store/courseStore";
import { CoursesGridSkeleton, CourseError, EmptyCoursesState } from "@/components/course/CourseStates";
import { CourseFormDialog } from "@/components/course/CourseFormDialog";

export default function MyCourseManagementPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuthStore();
  const { courses, loading, error, filters, pagination, fetchMyCourses, createCourse, updateCourse, deleteCourse, updateCourseStatus, setFilters, clearError } = useCourseStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Safe wrapper for fetchMyCourses
  const safeFetchMyCourses = async () => {
    try {
      await fetchMyCourses();
    } catch (error) {
      console.error("Error in safeFetchMyCourses:", error);
    }
  };

  // Categories
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

  // Status options
  const statusOptions = [
    { value: "all", label: "Semua Status", color: "slate" },
    { value: "draft", label: "Draft", color: "gray" },
    { value: "published", label: "Published", color: "green" },
    { value: "archived", label: "Archived", color: "red" },
  ];

  // Load courses on component mount
  useEffect(() => {
    console.log("MyCourseManagementPage mounted:", { isAuthenticated, user: !!user, token: !!token });

    if (isAuthenticated && user && token) {
      console.log("Calling fetchMyCourses...");
      safeFetchMyCourses();
    } else {
      console.log("Not authenticated, skipping fetchMyCourses");
    }
  }, [isAuthenticated, user, token]); // Remove fetchMyCourses from dependencies to prevent infinite loop

  // Filter courses locally (API filtering will be handled by the store)
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = !filters.search || course.title.toLowerCase().includes(filters.search.toLowerCase()) || course.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "all" || course.status === filters.status;
    const matchesCategory = filters.category === "all" || course.category === filters.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle course creation
  const handleCreateCourse = async (formData) => {
    const result = await createCourse(formData);

    if (result.success) {
      setShowCreateDialog(false);
    }
  };

  // Handle course editing
  const handleEditCourse = async (formData) => {
    const result = await updateCourse(selectedCourse._id || selectedCourse.id, formData);

    if (result.success) {
      setShowEditDialog(false);
      setSelectedCourse(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  // Handle course deletion confirmation
  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete._id || courseToDelete.id);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  // Cancel delete operation
  const cancelDeleteCourse = () => {
    setShowDeleteDialog(false);
    setCourseToDelete(null);
  };

  // Handle course status change
  const handleCourseStatusChange = async (courseId, newStatus) => {
    const result = await updateCourseStatus(courseId, newStatus);
    if (result.success) {
      // Refresh the courses list to reflect the change
      await safeFetchMyCourses();
    }
  };

  // Open edit dialog
  const openEditDialog = (course) => {
    setSelectedCourse(course);
    setShowEditDialog(true);
  };

  // Handle filter changes
  const handleSearchChange = (value) => {
    setFilters({ search: value });
  };

  const handleStatusChange = (value) => {
    setFilters({ status: value });
  };

  const handleCategoryChange = (value) => {
    setFilters({ category: value });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-600 text-white hover:bg-green-700";
      case "draft":
        return "bg-gray-600 text-white hover:bg-gray-700";
      case "archived":
        return "bg-red-600 text-white hover:bg-red-700";
      default:
        return "bg-slate-600 text-white hover:bg-slate-700";
    }
  };

  // Get category display name
  const getCategoryName = (categoryValue) => {
    return categories.find((cat) => cat.value === categoryValue)?.label || categoryValue;
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">Kelola Kursus Saya</h1>
            <p className="text-xl text-purple-100">Buat, edit, dan kelola semua kursus yang Anda ajarkan di platform Ajarin.id</p>
          </div>
          <div className="mt-6 lg:mt-0">
            <Button onClick={() => navigate("/dashboard/create-course")} className="bg-white text-purple-600 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" />
              Buat Kursus Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Total Courses */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-blue-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-xs text-slate-400">Total Kursus</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">+{courses.filter((c) => c.status === "published").length} published</span>
              <span className="text-slate-500">•</span>
              <span className="text-yellow-400">{courses.filter((c) => c.status === "draft").length} draft</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-green-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{courses.reduce((total, course) => total + (course.students_count || 0), 0)}</p>
                <p className="text-xs text-slate-400">Total Siswa</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">Rata-rata {Math.round(courses.reduce((total, course) => total + (course.students_count || 0), 0) / Math.max(courses.length, 1))} siswa/kursus</div>
          </CardContent>
        </Card>

        {/* Total Materials */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-purple-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{courses.reduce((total, course) => total + (course.total_materials || 0), 0)}</p>
                <p className="text-xs text-slate-400">Total Materi</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">{courses.reduce((total, course) => total + (course.total_assignments || 0), 0)} assignment dibuat</div>
          </CardContent>
        </Card>

        {/* Avg Rating */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-yellow-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {courses.filter((c) => c.rating > 0).length > 0 ? (courses.reduce((total, course) => total + (course.rating || 0), 0) / courses.filter((c) => c.rating > 0).length).toFixed(1) : "0.0"}
                </p>
                <p className="text-xs text-slate-400">Rata-rata Rating</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">{courses.filter((c) => c.rating > 0).length} kursus terrating</div>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-indigo-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{courses.length > 0 ? Math.round(courses.reduce((total, course) => total + (course.total_materials || 0) + (course.total_assignments || 0), 0) / courses.length) : 0}</p>
                <p className="text-xs text-slate-400">Avg Konten</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">{Math.round((courses.filter((c) => (c.total_materials || 0) + (c.total_assignments || 0) >= 5).length / Math.max(courses.length, 1)) * 100)}% complete</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input placeholder="Cari kursus..." value={filters.search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-10 bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white hover:bg-slate-700">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white hover:bg-slate-700">
                  Semua Kategori
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-slate-700">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      {loading ? (
        <CoursesGridSkeleton count={6} />
      ) : error ? (
        <CourseError
          error={error}
          onRetry={() => {
            clearError();
            fetchMyCourses();
          }}
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyCoursesState
          onCreateCourse={() => navigate("/dashboard/create-course")}
          title={courses.length === 0 ? "Belum ada kursus" : "Tidak ada kursus yang ditemukan"}
          description={courses.length === 0 ? "Mulai berbagi pengetahuan dengan membuat kursus pertama Anda" : "Coba ubah filter pencarian atau buat kursus baru"}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
              <CardHeader className="p-0">
                <div className="relative">
                  {/* Course Cover */}
                  <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {course.cover_url?.url ? <img src={course.cover_url.url} alt={course.title} className="w-full h-full object-cover" /> : <BookOpen className="w-12 h-12 text-slate-400" />}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <Badge className={getStatusBadgeColor(course.status)} size="sm">
                      {course.status === "published" && <div className="w-1.5 h-1.5 bg-current rounded-full mr-1 animate-pulse"></div>}
                      {statusOptions.find((s) => s.value === course.status)?.label || course.status}
                    </Badge>

                    {course.students_count > 0 && (
                      <Badge variant="secondary" className="bg-blue-600/30 text-blue-200 border-blue-600/40 text-xs">
                        <Users className="w-2.5 h-2.5 mr-1" />
                        {course.students_count}
                      </Badge>
                    )}

                    {(course.total_assignments || course.total_tasks || 0) > 0 && (
                      <Badge variant="secondary" className="bg-purple-600/30 text-purple-200 border-purple-600/40 text-xs">
                        <FileText className="w-2.5 h-2.5 mr-1" />
                        {course.total_assignments || course.total_tasks}
                      </Badge>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                        {/* Main Actions */}
                        <DropdownMenuItem onClick={() => navigate(`/courses/${course._id || course.id}`)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Detail Course
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => openEditDialog(course)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Informasi Course
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/materials`)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Kelola Materi
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/assignments`)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          Kelola Assignment
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/students`)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <Users className="w-4 h-4 mr-2" />
                          Kelola Siswa ({course.students_count})
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700" />

                        {/* Status Actions */}
                        <DropdownMenuItem onClick={() => handleCourseStatusChange(course._id || course.id, "draft")} className="text-white hover:bg-slate-700 cursor-pointer" disabled={course.status === "draft"}>
                          <Settings className="w-4 h-4 mr-2" />
                          Ubah ke Draft
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleCourseStatusChange(course._id || course.id, "published")} className="text-green-400 hover:bg-green-900/20 cursor-pointer" disabled={course.status === "published"}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Publikasikan Course
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleCourseStatusChange(course._id || course.id, "archived")} className="text-orange-400 hover:bg-orange-900/20 cursor-pointer" disabled={course.status === "archived"}>
                          <Archive className="w-4 h-4 mr-2" />
                          Arsipkan Course
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700" />

                        {/* Danger Zone */}
                        <DropdownMenuItem onClick={() => openDeleteDialog(course)} className="text-red-400 hover:bg-red-900/20 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-2 hover:text-blue-400 transition-colors cursor-pointer flex-1" onClick={() => navigate(`/courses/${course._id || course.id}`)}>
                      {course.title}
                    </h3>
                    {course.status === "published" && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {getCategoryName(course.category)}
                    </Badge>
                    <div className="text-xs text-slate-500">{new Date(course.createdAt || course.created_at).toLocaleDateString("id-ID")}</div>
                  </div>
                </div>

                {/* Enhanced Course Stats */}
                <div className="mb-4">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    {/* Students Count */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <div className="text-blue-300 font-semibold">{course.students_count || 0}</div>
                          <div className="text-blue-400/80 text-[10px]">siswa terdaftar</div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Count */}
                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-green-400" />
                        <div>
                          <div className="text-green-300 font-semibold">{course.total_materials || course.total_lessons || 0}</div>
                          <div className="text-green-400/80 text-[10px]">materi</div>
                        </div>
                      </div>
                    </div>

                    {/* Assignments Count */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <div>
                          <div className="text-purple-300 font-semibold">{course.total_assignments || course.total_tasks || 0}</div>
                          <div className="text-purple-400/80 text-[10px]">assignment</div>
                        </div>
                      </div>
                    </div>

                    {/* Rating or Duration */}
                    {course.rating && course.rating > 0 ? (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                          <div>
                            <div className="text-yellow-300 font-semibold">{course.rating.toFixed(1)}</div>
                            <div className="text-yellow-400/80 text-[10px]">rating</div>
                          </div>
                        </div>
                      </div>
                    ) : course.duration ? (
                      <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <div>
                            <div className="text-indigo-300 font-semibold">{course.duration}</div>
                            <div className="text-indigo-400/80 text-[10px]">durasi</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-slate-500/10 to-slate-600/10 border border-slate-500/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <div className="text-slate-300 font-semibold text-[10px]">
                              {new Date(course.createdAt || course.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </div>
                            <div className="text-slate-400/80 text-[10px]">dibuat</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Primary Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-blue-500 transition-all duration-200"
                      onClick={() => navigate(`/courses/${course._id || course.id}`)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Lihat Detail
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-500 transition-all duration-200" onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/materials`)}>
                      <BookOpen className="w-3 h-3 mr-1" />
                      Kelola Materi
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-purple-300 hover:bg-purple-900/20 transition-all duration-200 text-xs p-2"
                      onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/assignments`)}
                    >
                      <FileText className="w-3 h-3 mb-0.5" />
                      <span className="text-[10px]">{(course.total_assignments || course.total_tasks || 0) > 0 ? `${course.total_assignments || course.total_tasks} Task` : "Assignment"}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-orange-300 hover:bg-orange-900/20 transition-all duration-200 text-xs p-2"
                      onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/discussions`)}
                    >
                      <MessageCircle className="w-3 h-3 mb-0.5" />
                      <span className="text-[10px]">Diskusi</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-blue-300 hover:bg-blue-900/20 transition-all duration-200 text-xs p-2" onClick={() => openEditDialog(course)}>
                      <Edit className="w-3 h-3 mb-0.5" />
                      <span className="text-[10px]">Edit</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-green-300 hover:bg-green-900/20 transition-all duration-200 text-xs p-2"
                      onClick={() => navigate(`/dashboard/courses/${course._id || course.id}/students`)}
                    >
                      <Users className="w-3 h-3 mb-0.5" />
                      <span className="text-[10px]">{course.students_count > 0 ? `${course.students_count} Siswa` : "Siswa"}</span>
                    </Button>
                  </div>

                  {/* Quick Status Action */}
                  {course.status === "draft" && (
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200" onClick={() => handleCourseStatusChange(course._id || course.id, "published")}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Publikasikan Course
                    </Button>
                  )}

                  {course.status === "published" && course.students_count === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-orange-500 text-orange-400 hover:bg-orange-600 hover:text-white transition-all duration-200"
                      onClick={() => handleCourseStatusChange(course._id || course.id, "draft")}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Ubah ke Draft
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Form Dialogs */}
      <CourseFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSubmit={handleCreateCourse} loading={loading} mode="create" />

      <CourseFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} onSubmit={handleEditCourse} loading={loading} mode="edit" initialData={selectedCourse} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-3 text-red-400 text-lg">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              Konfirmasi Hapus Course
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Course akan dihapus secara permanen dari sistem beserta semua data yang terkait.</DialogDescription>
          </DialogHeader>

          {courseToDelete && (
            <div className="py-4 border-t border-b border-slate-700">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600/50">
                <h4 className="font-medium text-slate-200 mb-3 text-sm uppercase tracking-wide">Course yang akan dihapus:</h4>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {courseToDelete.cover_url?.url ? <img src={courseToDelete.cover_url.url} alt={courseToDelete.title} className="w-full h-full object-cover" /> : <BookOpen className="w-8 h-8 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white mb-1 line-clamp-2">{courseToDelete.title}</h5>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-2">{courseToDelete.description?.length > 80 ? `${courseToDelete.description.substring(0, 80)}...` : courseToDelete.description || "Tidak ada deskripsi"}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Status: {courseToDelete.status}</span>
                      <span>•</span>
                      <span>{courseToDelete.total_materials || 0} materi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 pt-4">
            <Button variant="outline" onClick={cancelDeleteCourse} disabled={loading} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCourse} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menghapus...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Ya, Hapus Course
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
