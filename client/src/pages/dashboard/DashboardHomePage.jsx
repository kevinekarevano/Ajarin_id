import { useState, useEffect } from "react";
import { BookOpen, Users, Award, Plus, Star, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import useAuthStore from "@/store/authStore";
import useEnrollmentStore from "@/store/enrollmentStore";

export default function DashboardHomePage() {
  const { user } = useAuthStore();
  const { enrolledCourses, loading, fetchMyEnrolledCourses } = useEnrollmentStore();

  useEffect(() => {
    // Fetch enrolled courses when component mounts
    fetchMyEnrolledCourses({ limit: 5, sort: "-last_accessed" });
  }, [fetchMyEnrolledCourses]);

  // Calculate stats from real data
  const stats = {
    enrolledCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((course) => course.status === "completed").length,
    totalPoints: enrolledCourses.reduce((sum, course) => sum + (course.points_earned || 0), 0),
    averageProgress: enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) / enrolledCourses.length) : 0,
  };

  // Transform enrolled courses for display (limit to recent 5)
  const recentCourses = enrolledCourses.slice(0, 5).map((enrollment) => ({
    id: enrollment.course_id._id,
    title: enrollment.course_id.title,
    progress: Math.round(enrollment.progress_percentage || 0),
    nextLesson: enrollment.current_material || "Mulai pembelajaran",
    instructor: enrollment.course_id.instructor?.fullname || "Instructor",
    thumbnail: enrollment.course_id.thumbnail?.url || "/api/placeholder/300/200",
    courseId: enrollment.course_id._id,
    status: enrollment.status,
    lastAccessed: enrollment.last_accessed,
  }));

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-lg p-6 text-white w-full">
        <h1 className="text-2xl font-bold mb-2">Selamat datang kembali, {user?.fullname || "User"}! 👋</h1>
        <p className="text-blue-100">Siap melanjutkan perjalanan belajar hari ini? Mari capai target belajar Anda!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Kursus Diikuti</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.enrolledCourses}</div>
            <p className="text-xs text-blue-300/70">Total kursus aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Kursus Selesai</CardTitle>
            <Award className="w-4 h-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedCourses}</div>
            <p className="text-xs text-green-300/70">{stats.enrolledCourses > 0 ? `${Math.round((stats.completedCourses / stats.enrolledCourses) * 100)}% completion rate` : "Mulai kursus pertama"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300">Total Poin</CardTitle>
            <Star className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
            <p className="text-xs text-yellow-300/70">Poin pembelajaran</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Progress Rata-rata</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.averageProgress}%</div>
            <p className="text-xs text-purple-300/70">Dari semua kursus</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Recent Courses */}
        <div className="lg:col-span-2 w-full">
          <Card className="bg-slate-800 border-slate-700 w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Lanjutkan Belajar</CardTitle>
                <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                  <Link to="/dashboard/my-courses">Lihat Semua</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg animate-pulse">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-2 bg-slate-700 rounded w-full"></div>
                      </div>
                      <div className="w-20 h-8 bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg">
                    {course.thumbnail && course.thumbnail !== "/api/placeholder/300/200" ? (
                      <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                      <p className="text-sm text-slate-400 mb-2">{course.progress > 0 ? `Selanjutnya: ${course.nextLesson}` : "Mulai pembelajaran"}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${course.status === "completed" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{course.progress}%</span>
                        {course.status === "completed" && <Award className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                    <Button asChild size="sm" className={`${course.status === "completed" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                      <Link to={`/dashboard/course-learn/${course.courseId}`}>{course.status === "completed" ? "Selesai" : "Lanjutkan"}</Link>
                    </Button>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Belum ada kursus</h3>
                  <p className="text-slate-400 mb-4">Mulai perjalanan belajar Anda dengan mendaftar kursus pertama</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/dashboard/browse-courses">Jelajahi Kursus</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Progress Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.slice(0, 3).map((enrollment) => (
                <div key={enrollment.course_id._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white text-sm truncate">{enrollment.course_id.title}</h4>
                    <span className="text-xs text-indigo-300">{Math.round(enrollment.progress_percentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${enrollment.progress_percentage || 0}%` }} />
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="text-center py-4">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Belum ada kursus yang diikuti</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Statistik Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300">Kursus Aktif</span>
                <span className="text-lg font-bold text-white">{stats.enrolledCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300">Diselesaikan</span>
                <span className="text-lg font-bold text-white">{stats.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300">Rata-rata Progress</span>
                <span className="text-lg font-bold text-white">{stats.averageProgress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto p-6 flex-col gap-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg">
              <Link to="/dashboard/browse-courses">
                <BookOpen className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Jelajahi Kursus</div>
                  <div className="text-xs text-blue-100 mt-1">Temukan kursus baru</div>
                </div>
              </Link>
            </Button>

            <Button asChild className="h-auto p-6 flex-col gap-3 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-0 shadow-lg">
              <Link to="/dashboard/create-course">
                <Plus className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Buat Kursus</div>
                  <div className="text-xs text-purple-100 mt-1">Bagikan pengetahuan</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
