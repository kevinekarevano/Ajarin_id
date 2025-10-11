import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Clock, Star, Calendar, Award, PlayCircle, CheckCircle, ArrowLeft, Heart, Share2, Download, Globe, Target, TrendingUp, User } from "lucide-react";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function CourseDetailDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Stores
  const { user } = useAuthStore();
  const { selectedCourse, loading: courseLoading, error, fetchCourseById } = useCourseStore();
  const { enrollmentStatus, checkEnrollmentStatus, enrollToCourse, unenrollFromCourse, loading: enrollmentLoading } = useEnrollmentStore();

  // Load course data
  useEffect(() => {
    if (id) {
      fetchCourseById(id);
      if (user) {
        checkEnrollmentStatus(id);
      }
    }
  }, [id, fetchCourseById, checkEnrollmentStatus, user]);

  const handleEnrollment = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    try {
      const currentStatus = enrollmentStatus[id];

      if (currentStatus?.isEnrolled) {
        await unenrollFromCourse(id);
        toast.success("Berhasil membatalkan enrollment");
      } else {
        await enrollToCourse(id);
        toast.success("Berhasil mendaftar ke kursus!");
        // Navigate to learning page after successful enrollment
        navigate(`/dashboard/course-learn/${id}`);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Gagal melakukan enrollment");
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-600 hover:bg-green-700";
      case "intermediate":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "advanced":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-slate-600 hover:bg-slate-700";
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Tidak diketahui";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins} menit`;
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Loading Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-slate-700 rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="w-3/4 h-8 bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="w-full h-4 bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="w-2/3 h-4 bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="w-full h-48 bg-slate-700 rounded animate-pulse"></div>
                <div className="w-full h-12 bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-24 bg-slate-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-red-400 mb-4 text-4xl">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Kursus Tidak Ditemukan</h3>
            <p className="text-slate-400 mb-4">{error || "Kursus yang Anda cari tidak tersedia atau telah dihapus."}</p>
            <Button onClick={() => navigate("/dashboard/browse-courses")} className="bg-blue-600 hover:bg-blue-700">
              ← Kembali ke Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = selectedCourse;
  const currentEnrollmentStatus = enrollmentStatus[id];
  const isEnrolled = currentEnrollmentStatus?.isEnrolled;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/dashboard/browse-courses")} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Browse
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className={getLevelBadgeColor(course.level)}>{String(course.level || "Semua Level")}</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {String(course.category || "Umum")}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{String(course.title || "Kursus Tidak Diketahui")}</h1>

                <p className="text-lg text-slate-300 leading-relaxed mb-6">{String(course.description || "")}</p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{String(course.rating || "0.0")}</span>
                    <span>({Number(course.total_reviews || 0)} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{Number(course.enrolled_count || 0)} siswa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.total_duration_minutes)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Terakhir update: {course.updated_at ? new Date(course.updated_at).toLocaleDateString("id-ID") : "Tidak diketahui"}</span>
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">👨‍🏫 Instruktur</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-slate-600">
                    <AvatarImage src={course.mentor_id?.avatar?.url || ""} />
                    <AvatarFallback className="bg-slate-600 text-white text-lg">{String(course.mentor_id?.fullname || "Instruktur").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xl font-semibold text-white">{String(course.mentor_id?.fullname || "Instruktur")}</h4>
                    <p className="text-slate-400">@{String(course.mentor_id?.username || "instructor")}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {Number(course.mentor_id?.total_courses || 0)} Kursus
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {Number(course.mentor_id?.total_students || 0)} Siswa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="space-y-6">
              {/* Course Preview */}
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="aspect-video relative group">
                  {course.cover_url?.url ? (
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img src={course.cover_url.url} alt={String(course.title || "Course Cover")} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-slate-900/80 text-white border-slate-600">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Course
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-blue-600/90 text-white border-blue-500/50">
                            {String(course.level || "Semua Level")}
                          </Badge>
                          <div className="flex items-center space-x-3 text-white/95 text-sm">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span>{String(course.rating || "0.0")}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{Number(course.enrolled_count || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-slate-800 flex flex-col items-center justify-center relative">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-slate-900/80 text-white border-slate-600">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Course
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-slate-900/80 text-slate-200">
                            {String(course.level || "Semua Level")}
                          </Badge>
                          <div className="flex items-center space-x-2 text-white/90 text-sm">
                            <Users className="w-4 h-4" />
                            <span>{Number(course.enrolled_count || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <BookOpen className="w-20 h-20 text-slate-300 mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold text-white mb-2">{String(course.title || "Kursus")}</h3>
                        <p className="text-slate-400 text-sm">Preview akan tersedia setelah cover diunggah</p>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white">{Number(course.price || 0) === 0 ? <span className="text-green-400">GRATIS</span> : <span>Rp {Number(course.price || 0).toLocaleString("id-ID")}</span>}</div>
                    {Number(course.price || 0) > 0 && <p className="text-sm text-slate-400 mt-1">Akses seumur hidup</p>}
                  </div>

                  {/* Enrollment Button */}
                  <Button onClick={handleEnrollment} disabled={enrollmentLoading} className={`w-full py-3 text-base font-semibold ${isEnrolled ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {enrollmentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Batalkan Enrollment
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Ikuti Kursus Ini
                      </>
                    )}
                  </Button>

                  {isEnrolled && (
                    <Button onClick={() => navigate(`/dashboard/course-learn/${id}`)} variant="outline" className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700">
                      🚀 Lanjutkan Belajar
                    </Button>
                  )}

                  {/* Course Info Summary */}
                  <div className="border-t border-slate-700 pt-4 mt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total Durasi:</span>
                      <span className="text-white font-medium">{formatDuration(course.total_duration_minutes)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total Materi:</span>
                      <span className="text-white font-medium">{Number(course.materials_count || 0)} Materi</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Bahasa:</span>
                      <span className="text-white font-medium">Bahasa Indonesia</span>
                    </div>
                  </div>

                  {/* Additional Actions */}
                  <div className="flex space-x-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1 text-slate-400 hover:text-white">
                      <Heart className="w-4 h-4 mr-1" />
                      Wishlist
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-slate-400 hover:text-white">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Features */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">✨ Yang Akan Anda Dapatkan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Akses materi seumur hidup
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Sertifikat penyelesaian
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Akses melalui mobile & desktop
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    Forum diskusi dengan instruktur
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border-slate-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              📋 Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-slate-700">
              📚 Kurikulum
            </TabsTrigger>
            <TabsTrigger value="instructor" className="data-[state=active]:bg-slate-700">
              👨‍🏫 Instruktur
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-slate-700">
              ⭐ Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>📝 Deskripsi Kursus</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-base">{course.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>🎯 Apa yang Akan Anda Pelajari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {["Konsep dasar hingga advanced", "Best practices dari industri", "Hands-on project dan studi kasus", "Tips dan trik dari expert"].map((item, index) => (
                    <div key={index} className="flex items-center text-slate-300">
                      <Target className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>📚 Kurikulum Kursus</CardTitle>
                <CardDescription>Materi pembelajaran yang terstruktur dan mudah diikuti</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Kurikulum Sedang Disiapkan</h3>
                <p className="text-slate-400">Instruktur sedang menyiapkan materi pembelajaran yang berkualitas untuk kursus ini.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>👨‍🏫 Tentang Instruktur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 border-2 border-slate-600">
                      <AvatarImage src={course.mentor_id?.avatar?.url} />
                      <AvatarFallback className="bg-slate-600 text-white text-2xl">{course.mentor_id?.fullname?.charAt(0) || "I"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{course.mentor_id?.fullname || "Instruktur Profesional"}</h3>
                    <p className="text-slate-400 mb-4">@{course.mentor_id?.username || "instructor"}</p>
                    <p className="text-slate-300 leading-relaxed mb-4">Instruktur berpengalaman di bidang {course.category} dengan track record mengajar yang excellent.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{course.mentor_id?.total_courses || 0}</div>
                        <div className="text-slate-400">Kursus</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{course.mentor_id?.total_students || 0}</div>
                        <div className="text-slate-400">Siswa</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{course.mentor_id?.average_rating || "5.0"}</div>
                        <div className="text-slate-400">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{course.mentor_id?.total_reviews || 0}</div>
                        <div className="text-slate-400">Reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>⭐ Reviews & Rating</CardTitle>
                <CardDescription>Feedback dari siswa yang telah mengikuti kursus ini</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Star className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Review</h3>
                <p className="text-slate-400">Jadilah yang pertama memberikan review untuk kursus ini setelah menyelesaikan pembelajaran.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
