import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, Search, Filter, X, Loader2 } from "lucide-react";
import useCourseStore from "@/store/courseStore";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get state and actions from courseStore
  const { courses, loading, error, pagination, fetchPublicCourses } = useCourseStore();

  // Calculate category counts from actual courses data
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return courses.length;
    return courses.filter((course) => course.category === categoryId).length;
  };

  const categories = [
    { id: "all", name: "Semua Kategori", count: getCategoryCount("all") },
    { id: "Programming", name: "Pemrograman", count: getCategoryCount("Programming") },
    { id: "Web Development", name: "Web Development", count: getCategoryCount("Web Development") },
    { id: "Mobile Development", name: "Mobile Development", count: getCategoryCount("Mobile Development") },
    { id: "Data Science", name: "Data Science", count: getCategoryCount("Data Science") },
    { id: "Design", name: "Desain", count: getCategoryCount("Design") },
    { id: "UI/UX", name: "UI/UX", count: getCategoryCount("UI/UX") },
    { id: "Digital Marketing", name: "Digital Marketing", count: getCategoryCount("Digital Marketing") },
  ];

  // Filter courses based on search and category (client-side filtering for better UX)
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.mentor_id?.fullname && course.mentor_id.fullname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        await fetchPublicCourses({
          limit: 50, // Load more courses for better client-side filtering
          page: 1,
          // We'll do client-side filtering for better UX, so fetch all categories
        });
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };

    loadCourses();
  }, [fetchPublicCourses]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    // Optional: Add a brief success feedback
    const button = document.activeElement;
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1624]">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Jelajahi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Kursus Terbaik</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">Temukan berbagai kursus berkualitas tinggi yang diajarkan oleh para ahli di bidangnya. Semua gratis untuk semua!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Mulai Belajar
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3">
                Filter Kursus
              </Button>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-10 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari kursus, instruktur, atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {(searchTerm || selectedCategory !== "all") && (
                <div className="mb-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 font-medium">Filter Aktif:</span>
                      <div className="flex items-center gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                            <Search className="h-3 w-3" />"{searchTerm}"
                          </span>
                        )}
                        {selectedCategory !== "all" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            <Filter className="h-3 w-3" />
                            {categories.find((cat) => cat.id === selectedCategory)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Toggle and Categories */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Categories Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      aria-pressed={selectedCategory === category.id}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        selectedCategory === category.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105" : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102"
                      }`}
                    >
                      {selectedCategory === category.id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>}
                      {category.name}
                      <span className="ml-2 text-xs opacity-75">({category.count})</span>
                    </button>
                  ))}
                </div>

                {/* Clear Filters and Results Count */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">{filteredCourses.length} kursus ditemukan</span>
                    {(searchTerm || selectedCategory !== "all") && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                        <span>Filter aktif</span>
                      </div>
                    )}
                  </div>
                  {(searchTerm || selectedCategory !== "all") && (
                    <button
                      onClick={handleClearFilters}
                      className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-red-600/20 hover:to-red-500/10 border border-slate-700 hover:border-red-500/50 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-500/0 group-hover:from-red-600/10 group-hover:to-red-500/5 rounded-lg transition-all duration-300"></div>
                      <X className="relative h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                      <span className="relative">Hapus Semua Filter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">{searchTerm ? `Hasil pencarian "${searchTerm}"` : "Kursus Populer"}</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                {selectedCategory !== "all" ? `Kursus dalam kategori ${categories.find((cat) => cat.id === selectedCategory)?.name}` : "Pilihan kursus terbaik yang dipilih khusus untuk mengembangkan skill Anda"}
              </p>
            </div>

            {loading ? (
              /* Loading State */
              <div className="text-center py-16">
                <Loader2 className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-white mb-2">Memuat kursus...</h3>
                <p className="text-slate-400">Mohon tunggu sebentar</p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Gagal memuat kursus</h3>
                  <p className="text-slate-400 mb-6">{error}</p>
                  <Button onClick={() => fetchPublicCourses({ limit: 50, page: 1 })} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Coba Lagi
                  </Button>
                </div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {course.cover_url?.url ? <img src={course.cover_url.url} alt={course.title} className="w-full h-full object-cover" /> : <BookOpen className="h-12 w-12 text-blue-400" />}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                      <CardDescription className="text-slate-400 line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.total_enrollments || 0}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {Math.ceil((course.total_duration_minutes || 0) / 60)} jam
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {course.rating?.average?.toFixed(1) || "0.0"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Oleh {course.mentor_id?.fullname || "Unknown"}</p>
                          <p className="text-green-400 font-semibold">Gratis</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                          <Link to={`/courses/${course._id}`}>Detail</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="relative mb-6">
                    <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    {(searchTerm || selectedCategory !== "all") && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                        <X className="h-4 w-4 text-red-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Tidak ada kursus ditemukan</h3>
                  <p className="text-slate-400 mb-6">{searchTerm || selectedCategory !== "all" ? "Coba ubah kata kunci pencarian atau pilih kategori yang berbeda" : "Belum ada kursus yang tersedia saat ini"}</p>
                  {(searchTerm || selectedCategory !== "all") && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleClearFilters}
                        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                      >
                        <X className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                        Hapus Semua Filter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
