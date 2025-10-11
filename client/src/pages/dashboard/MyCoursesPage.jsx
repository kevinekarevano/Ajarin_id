import { useState, useEffect } from "react";
import { BookOpen, Clock, Star, Play, MoreVertical, Filter, Search, Users, Trophy, TrendingUp, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import useEnrollmentStore from "@/store/enrollmentStore";
import useAuthStore from "@/store/authStore";

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Stores
  const { user } = useAuthStore();
  const { enrolledCourses, learningStats, loading, error, fetchMyEnrolledCourses, fetchLearningStats } = useEnrollmentStore();

  // Load data on mount
  useEffect(() => {
    fetchMyEnrolledCourses();
    fetchLearningStats();
  }, [fetchMyEnrolledCourses, fetchLearningStats]);

  // Debug: Log enrolled courses data to check cover image structure
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      console.log("📚 My Enrolled Courses:", enrolledCourses);
      console.log("🖼️ First course cover structure:", {
        course: enrolledCourses[0].course_id,
        cover_url: enrolledCourses[0].course_id?.cover_url,
        cover_url_url: enrolledCourses[0].course_id?.cover_url?.url,
        allCourseFields: Object.keys(enrolledCourses[0].course_id || {}),
      });
    }
  }, [enrolledCourses]);

  // Filter courses based on search and status
  const filteredCourses = enrolledCourses.filter((enrollment) => {
    const course = enrollment.course_id;
    const matchesSearch =
      course?.title.toLowerCase().includes(searchQuery.toLowerCase()) || course?.description.toLowerCase().includes(searchQuery.toLowerCase()) || enrollment.mentor_id?.fullname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || enrollment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "active":
        return "bg-blue-600 text-white";
      case "dropped":
        return "bg-red-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "active":
        return "Sedang Berjalan";
      case "dropped":
        return "Berhenti";
      default:
        return "Belum Dimulai";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Kursus Saya</h1>
        <p className="text-slate-400">Kelola dan lanjutkan perjalanan belajar Anda</p>
      </div>

      {/* Learning Stats */}
      {learningStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Kursus</CardTitle>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{learningStats.statistics?.totalEnrollments || 0}</div>
              <p className="text-xs text-slate-400">Kursus yang diikuti</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Kursus Selesai</CardTitle>
              <Trophy className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{learningStats.statistics?.completedCourses || 0}</div>
              <p className="text-xs text-slate-400">Telah diselesaikan</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Rata-rata Progress</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{learningStats.statistics?.avgProgress?.toFixed(1) || 0}%</div>
              <p className="text-xs text-slate-400">Progress keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Waktu Belajar</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.floor((learningStats.statistics?.totalLearningTime || 0) / 60)}h</div>
              <p className="text-xs text-slate-400">Total waktu belajar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Cari kursus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")} className={filterStatus === "all" ? "bg-blue-600" : "border-slate-600 text-slate-300"}>
                Semua
              </Button>
              <Button variant={filterStatus === "active" ? "default" : "outline"} onClick={() => setFilterStatus("active")} className={filterStatus === "active" ? "bg-blue-600" : "border-slate-600 text-slate-300"}>
                Sedang Berjalan
              </Button>
              <Button variant={filterStatus === "completed" ? "default" : "outline"} onClick={() => setFilterStatus("completed")} className={filterStatus === "completed" ? "bg-blue-600" : "border-slate-600 text-slate-300"}>
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
              <div className="w-full h-48 bg-slate-700 rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-slate-600 rounded w-3/4" />
                <div className="h-3 bg-slate-600 rounded w-full" />
                <div className="h-2 bg-slate-600 rounded w-full" />
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-slate-600 rounded w-20" />
                  <div className="h-8 bg-slate-600 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <div className="text-red-400 mb-4">❌</div>
            <h3 className="text-xl font-semibold text-white mb-2">Gagal memuat kursus</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchMyEnrolledCourses} className="bg-blue-600 hover:bg-blue-700">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment) => {
            const course = enrollment.course_id;
            return (
              <Card key={enrollment._id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors group">
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {course?.cover_url?.url ? (
                        <div className="relative w-full h-full">
                          <img src={course.cover_url.url} alt={course?.title || "Course Cover"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          {/* Subtle overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center text-slate-400">
                          <BookOpen className="w-12 h-12 mb-2" />
                          <span className="text-xs text-center">Cover tidak tersedia</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(enrollment.status)}>{getStatusText(enrollment.status)}</Badge>
                    </div>
                    {course?.rating > 0 && (
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs text-white">
                          <Star className="w-3 h-3 text-yellow-400" />
                          {course.rating.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{course?.title}</h3>
                    <p className="text-sm text-slate-400">oleh {enrollment.mentor_id?.fullname}</p>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Progress</span>
                      <span className="text-sm text-slate-300">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${enrollment.progress_percentage}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
                      <span>{enrollment.completed_materials?.length || 0} materi diselesaikan</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor((course?.total_duration_minutes || 0) / 60)}h {(course?.total_duration_minutes || 0) % 60}m
                      </span>
                    </div>
                  </div>

                  {/* Status Info */}
                  {enrollment.status === "completed" ? (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <p className="text-sm text-green-400 font-medium">✅ Kursus selesai!</p>
                      <p className="text-xs text-green-300">Diselesaikan pada {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString("id-ID") : ""}</p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-sm text-blue-400 font-medium">Sedang Dipelajari</p>
                      <p className="text-xs text-blue-300">Terakhir diakses: {enrollment.last_accessed ? new Date(enrollment.last_accessed).toLocaleDateString("id-ID") : "Belum pernah"}</p>
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      {course?.total_enrollments || 0} siswa
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <BookOpen className="w-3 h-3" />
                      Kategori: {course?.category}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                      <Link to={`/dashboard/course-learn/${course?._id}`}>
                        {enrollment.status === "completed" ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Lihat Ulang
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {enrollment.progress_percentage === 0 ? "Mulai" : "Lanjutkan"}
                          </>
                        )}
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="border-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700" asChild>
                          <Link to={`/dashboard/courses/${course?._id}/assignments`}>Lihat Tugas</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">Beri Rating</DropdownMenuItem>
                        {enrollment.status !== "completed" && <DropdownMenuItem className="text-red-400 hover:bg-slate-700">Keluar dari Kursus</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCourses.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{searchQuery ? "Tidak ada kursus yang ditemukan" : "Belum ada kursus"}</h3>
            <p className="text-slate-400 mb-6">{searchQuery ? "Coba ubah kata kunci pencarian atau filter yang dipilih" : "Mulai perjalanan belajar Anda dengan mengikuti kursus pertama"}</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/dashboard/browse-courses">Jelajahi Kursus</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
