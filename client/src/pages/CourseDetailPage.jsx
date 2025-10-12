import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import useCourseStore from "@/store/courseStore";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Get course data from store
  const { selectedCourse: course, loading, error, fetchCourseById } = useCourseStore();

  // Map API data to UI-compatible format
  const courseData = course
    ? {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: {
          name: course.mentor_id?.fullname || "Unknown Instructor",
          bio: course.mentor_id?.bio || "Instructor bio not available",
          avatar: course.mentor_id?.avatar?.url || "https://via.placeholder.com/100x100?text=I",
          rating: 4.9, // TODO: Get from API when available
          students: 0, // TODO: Get from API when available
          courses: 0, // TODO: Get from API when available
        },
        thumbnail: course.cover_url?.url || "https://via.placeholder.com/800x400?text=Course",
        students: course.total_enrollments || 0,
        duration: `${Math.ceil((course.total_duration_minutes || 0) / 60)} jam`,
        rating: course.rating?.average || 0,
        totalRatings: course.rating?.count || 0,
        price: "Gratis",
        category: course.category || "General",
        lastUpdated: new Date(course.updated_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        }),
      }
    : null;

  // Fetch course data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchCourseById(id);
    }
  }, [id, fetchCourseById]);

  const handleEnroll = () => {
    setIsEnrolling(true);

    // Simulate enrollment process
    setTimeout(() => {
      setIsEnrolled(true);
      setIsEnrolling(false);
      // TODO: API call to enroll user

      // Redirect to dashboard after enrollment
      setTimeout(() => {
        navigate("/dashboard/browse-courses");
      }, 1000); // Show success state for 1 second before redirect
    }, 1000); // Simulate API call delay
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1624]">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Memuat detail kursus...</h3>
            <p className="text-slate-400">Mohon tunggu sebentar</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1624]">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Gagal memuat kursus</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={() => fetchCourseById(id)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Coba Lagi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show not found state
  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#0F1624]">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Kursus tidak ditemukan</h3>
            <p className="text-slate-400 mb-6">Kursus yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
            <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Kembali
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1624]">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{courseData.category}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{courseData.title}</h1>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">{courseData.description}</p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{courseData.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({courseData.totalRatings})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{courseData.students} siswa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{courseData.duration}</span>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {courseData.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Dibuat oleh {courseData.instructor.name}</p>
                    <p className="text-slate-400 text-sm">Update terakhir {courseData.lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Course Card */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700/50 sticky top-24">
                  {/* Course Image */}
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg overflow-hidden">
                    {courseData.thumbnail ? (
                      <img src={courseData.thumbnail} alt={courseData.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold text-green-400">{courseData.price}</span>
                    </div>

                    {!isEnrolled ? (
                      <Button onClick={handleEnroll} disabled={isEnrolling} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 text-lg font-semibold">
                        {isEnrolling ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Mendaftar...
                          </>
                        ) : (
                          "Daftar Sekarang"
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Berhasil Terdaftar
                        </Button>
                        <div className="flex items-center justify-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mengarahkan ke kursus saya...
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
