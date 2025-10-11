import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Star, Search, Filter, X, Plus, Heart, Play, CheckCircle, Loader } from "lucide-react";
import useCourseStore from "@/store/courseStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function DashboardBrowseCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Stores
  const { user } = useAuthStore();
  const { courses, loading, error, fetchPublicCourses } = useCourseStore();
  const { enrollmentStatus, checkEnrollmentStatus } = useEnrollmentStore();

  // Load courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        await fetchPublicCourses({
          limit: 50, // Increase limit to get more courses
          sort: "created_at",
          sortOrder: "desc",
        });
      } catch (error) {
        console.error("Failed to load courses:", error);
        toast.error("Gagal memuat kursus");
      }
    };

    loadCourses();
  }, [fetchPublicCourses]);

  // Debug: Log courses data to check cover image field and filtering
  useEffect(() => {
    if (courses.length > 0 && user) {
      console.log("📚 Total courses loaded:", courses.length);
      console.log("👤 Current user:", user);
      console.log("👤 Current user ID:", user._id);

      // Debug mentor_id structure for each course
      courses.forEach((course, index) => {
        console.log(`Course ${index + 1}:`, {
          title: course.title,
          mentor_id: course.mentor_id,
          mentor_id_type: typeof course.mentor_id,
          mentor_id_value: course.mentor_id?._id || course.mentor_id,
        });
      });

      const ownCourses = courses.filter((course) => course.mentor_id?._id === user?._id || course.mentor_id === user?._id);
      const othersCourses = courses.filter((course) => course.mentor_id?._id !== user?._id && course.mentor_id !== user?._id);

      console.log(
        "🏠 Own courses:",
        ownCourses.length,
        ownCourses.map((c) => c.title)
      );
      console.log(
        "👥 Others' courses:",
        othersCourses.length,
        othersCourses.map((c) => c.title)
      );

      console.log("🖼️ First course cover fields:", {
        cover_url: courses[0].cover_url,
        coverUrl: courses[0].coverUrl,
        cover: courses[0].cover,
        image: courses[0].image,
        thumbnail: courses[0].thumbnail,
        allFields: Object.keys(courses[0]),
      });
    }
  }, [courses, user]);

  // Check enrollment status for courses that are not owned by current user
  useEffect(() => {
    if (courses.length > 0 && user) {
      courses.forEach((course) => {
        // Only check enrollment for courses not owned by current user
        const isNotOwnCourse = course.mentor_id?._id !== user?._id && course.mentor_id !== user?._id;
        if (isNotOwnCourse) {
          checkEnrollmentStatus(course._id);
        }
      });
    }
  }, [courses, checkEnrollmentStatus, user]);

  // Filter out courses owned by current user for category counts
  const otherUsersCourses = courses.filter((course) => course.mentor_id?._id !== user?._id && course.mentor_id !== user?._id);

  const categories = [
    { id: "all", name: "Semua Kategori", count: otherUsersCourses.length },
    { id: "Programming", name: "Pemrograman", count: otherUsersCourses.filter((c) => c.category === "Programming").length },
    { id: "Design", name: "Desain", count: otherUsersCourses.filter((c) => c.category === "Design").length },
    { id: "Data Science", name: "Data Science", count: otherUsersCourses.filter((c) => c.category === "Data Science").length },
    { id: "Digital Marketing", name: "Digital Marketing", count: otherUsersCourses.filter((c) => c.category === "Digital Marketing").length },
    { id: "Web Development", name: "Web Development", count: otherUsersCourses.filter((c) => c.category === "Web Development").length },
  ];

  // Navigate to course detail
  const handleViewDetail = (courseId) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  // Get course button props
  const getCourseButtonProps = (courseId) => {
    const status = enrollmentStatus[courseId];

    if (status?.isEnrolled) {
      return {
        children: (
          <>
            <CheckCircle className="w-4 h-4 mr-2" /> Sudah Terdaftar
          </>
        ),
        variant: "outline",
        className: "border-green-500 text-green-500 hover:bg-green-600 hover:text-white",
      };
    }

    return {
      children: (
        <>
          <BookOpen className="w-4 h-4 mr-2" /> Lihat Detail
        </>
      ),
      variant: "default",
      className: "bg-blue-600 hover:bg-blue-700",
    };
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase()) || course.mentor_id?.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;

    // Exclude courses owned by the current user (mentor)
    const isNotOwnCourse = course.mentor_id?._id !== user?._id && course.mentor_id !== user?._id;

    return matchesSearch && matchesCategory && isNotOwnCourse;
  });

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case "Pemula":
        return "bg-green-600 text-white";
      case "Menengah":
        return "bg-yellow-600 text-white";
      case "Lanjutan":
        return "bg-red-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Jelajahi Kursus Terbaik</h1>
          <p className="text-xl text-blue-100">Temukan berbagai kursus berkualitas tinggi yang diajarkan oleh para ahli di bidangnya. Semua gratis untuk semua!</p>
          <div className="flex gap-4 mt-6">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <Play className="w-4 h-4 mr-2" />
              Mulai Belajar
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Filter Kursus
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input placeholder="Cari kursus, instruktur, atau topik..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400" />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {selectedCategory !== "all" && <Badge className="ml-2 bg-blue-600 text-white">{categories.find((cat) => cat.id === selectedCategory)?.name}</Badge>}
            </Button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === category.id ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
                {selectedCategory !== "all" && (
                  <Button onClick={() => setSelectedCategory("all")} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-slate-300">
          Ditemukan <span className="font-semibold text-white">{filteredCourses.length}</span> kursus
        </p>
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          Urutkan: Terpopuler
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="animate-pulse">
                {/* Image Skeleton */}
                <div className="w-full h-48 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 relative">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Title Skeleton */}
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-700 rounded-lg w-4/5" />
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                  </div>

                  {/* Instructor Skeleton */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-slate-700 rounded w-2/3" />
                      <div className="h-3 bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>

                  {/* Stats Skeleton */}
                  <div className="flex justify-between py-2 px-3 bg-slate-900/50 rounded-lg">
                    <div className="h-4 bg-slate-700 rounded w-16" />
                    <div className="h-4 bg-slate-700 rounded w-16" />
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-9 bg-slate-700 rounded-lg w-full" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-slate-800 border-red-900/50">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">⚠️</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Gagal memuat kursus</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">Terjadi kesalahan saat memuat data kursus. Periksa koneksi internet Anda atau coba lagi.</p>
              <div className="text-xs text-red-400 mb-4 p-3 bg-red-900/20 rounded border border-red-800">Error: {error}</div>
              <Button
                onClick={() => {
                  fetchPublicCourses({
                    limit: 50,
                    sort: "created_at",
                    sortOrder: "desc",
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🔄 Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative">
                  {/* Course Image with Better Handling */}
                  <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center overflow-hidden relative">
                    {course.cover_url?.url ? (
                      <>
                        <img
                          src={course.cover_url.url}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center" style={{ display: "none" }}>
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 max-w-24 leading-tight">{course.category}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 max-w-24 leading-tight">{course.category}</p>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Level Badge */}
                  {course.level && (
                    <div className="absolute top-3 left-3">
                      <Badge className={getLevelBadgeColor(course.level)}>{course.level}</Badge>
                    </div>
                  )}

                  {/* Enrollment Status Badge */}
                  {enrollmentStatus[course._id]?.isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white shadow-lg">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Terdaftar
                      </Badge>
                    </div>
                  )}

                  {/* Rating */}
                  {course.rating > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-sm text-white">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Price Badge */}
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-green-600 text-white font-semibold">GRATIS</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Course Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{course.description || "Deskripsi kursus tidak tersedia"}</p>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">{course.mentor_id?.fullname?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-400 font-medium truncate">{course.mentor_id?.fullname || "Mentor tidak diketahui"}</p>
                    <p className="text-xs text-slate-500 truncate">{course.mentor_id?.headline || "Instruktur"}</p>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 py-2 px-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{course.total_enrollments || 0}</span>
                    <span>siswa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{course.total_duration_minutes ? `${Math.floor(course.total_duration_minutes / 60)}h ${course.total_duration_minutes % 60}m` : "Belum ditentukan"}</span>
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-800/50">
                    {course.category}
                  </Badge>
                  {course.tags && course.tags.length > 0 && (
                    <Badge variant="outline" className="border-purple-600 text-purple-400 bg-purple-900/20">
                      +{course.tags.length} tags
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button size="sm" onClick={() => handleViewDetail(course._id)} className="w-full" {...getCourseButtonProps(course._id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCourses.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                {searchTerm || selectedCategory !== "all" ? <Search className="w-12 h-12 text-slate-400" /> : <div className="text-5xl">📚</div>}
                {!(searchTerm || selectedCategory !== "all") && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{searchTerm || selectedCategory !== "all" ? "Tidak ada kursus ditemukan" : "Belum ada kursus tersedia"}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed text-base">
                {searchTerm || selectedCategory !== "all"
                  ? `Tidak ditemukan kursus yang sesuai dengan pencarian "${searchTerm}" ${selectedCategory !== "all" ? `dalam kategori ${selectedCategory}` : ""}. Coba ubah kata kunci atau pilih kategori yang berbeda.`
                  : "Tim mentor sedang mempersiapkan kursus berkualitas tinggi untuk Anda. Kursus baru akan segera tersedia!"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    🔄 Reset Filter
                  </Button>
                  <div className="text-sm text-slate-500">Tampilkan semua kursus yang tersedia</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {filteredCourses.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Muat Lebih Banyak Kursus
          </Button>
        </div>
      )}
    </div>
  );
}
