import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Clock, Star, Plus, Edit, Trash2, Eye, Upload, Search, Filter, MoreVertical, Calendar, TrendingUp, Award, Settings } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useCourseStore from "@/store/courseStore";
import { CoursesGridSkeleton, CourseError, EmptyCoursesState } from "@/components/course/CourseStates";
import { CourseFormDialog } from "@/components/course/CourseFormDialog";

export default function MyCourseManagementPage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const { courses, loading, error, filters, pagination, fetchMyCourses, createCourse, updateCourse, deleteCourse, setFilters, clearError } = useCourseStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  // Handle course deletion
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus course ini?")) {
      await deleteCourse(courseId);
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
            <Button onClick={() => setShowCreateDialog(true)} className="bg-white text-purple-600 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" />
              Buat Kursus Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Kursus</p>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Siswa</p>
                <p className="text-2xl font-bold text-white">{courses.reduce((total, course) => total + course.students_count, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Kursus Published</p>
                <p className="text-2xl font-bold text-white">{courses.filter((course) => course.status === "published").length}</p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Rata-rata Rating</p>
                <p className="text-2xl font-bold text-white">{(courses.reduce((total, course) => total + course.rating, 0) / courses.filter((c) => c.rating > 0).length || 0).toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
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
          onCreateCourse={() => setShowCreateDialog(true)}
          title={courses.length === 0 ? "Belum ada kursus" : "Tidak ada kursus yang ditemukan"}
          description={courses.length === 0 ? "Mulai berbagi pengetahuan dengan membuat kursus pertama Anda" : "Coba ubah filter pencarian atau buat kursus baru"}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all">
              <CardHeader className="p-0">
                <div className="relative">
                  {/* Course Cover */}
                  <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {course.cover_url?.url ? <img src={course.cover_url.url} alt={course.title} className="w-full h-full object-cover" /> : <BookOpen className="w-12 h-12 text-slate-400" />}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusBadgeColor(course.status)}>{statusOptions.find((s) => s.value === course.status)?.label || course.status}</Badge>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-2" onClick={() => openEditDialog(course)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-2" onClick={() => handleDeleteCourse(course._id || course.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">{course.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {getCategoryName(course.category)}
                    </Badge>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.students_count} siswa
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.total_lessons} lessons
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {course.rating}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Eye className="w-3 h-3 mr-1" />
                    Lihat
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-3 h-3 mr-1" />
                    Kelola
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Form Dialogs */}
      <CourseFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSubmit={handleCreateCourse} loading={loading} mode="create" />

      <CourseFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} onSubmit={handleEditCourse} loading={loading} mode="edit" initialData={selectedCourse} />
    </div>
  );
}
