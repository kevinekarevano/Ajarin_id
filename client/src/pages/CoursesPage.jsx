import { useState } from "react";
import { Link } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, Search, Filter, X } from "lucide-react";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "all", name: "Semua Kategori", count: 15 },
    { id: "programming", name: "Pemrograman", count: 6 },
    { id: "design", name: "Desain", count: 4 },
    { id: "data-science", name: "Data Science", count: 3 },
    { id: "marketing", name: "Marketing", count: 2 },
  ];
  const courses = [
    {
      id: 1,
      title: "Pemrograman Web dengan React",
      description: "Belajar membuat aplikasi web modern dengan React.js dari dasar hingga mahir",
      instructor: "John Doe",
      students: 1234,
      duration: "8 jam",
      rating: 4.8,
      price: "Gratis",
      category: "programming",
      image: "https://via.placeholder.com/300x200?text=React+Course",
    },
    {
      id: 2,
      title: "Machine Learning untuk Pemula",
      description: "Pengenalan konsep machine learning dan implementasinya dengan Python",
      instructor: "Jane Smith",
      students: 856,
      duration: "12 jam",
      rating: 4.9,
      price: "Gratis",
      category: "data-science",
      image: "https://via.placeholder.com/300x200?text=ML+Course",
    },
    {
      id: 3,
      title: "Desain UI/UX dengan Figma",
      description: "Belajar membuat desain interface yang menarik dan user-friendly",
      instructor: "Sarah Wilson",
      students: 678,
      duration: "6 jam",
      rating: 4.7,
      price: "Gratis",
      category: "design",
      image: "https://via.placeholder.com/300x200?text=UI+UX+Course",
    },
    {
      id: 4,
      title: "Python untuk Data Analysis",
      description: "Analisis data menggunakan Python, Pandas, dan Matplotlib",
      instructor: "Dr. Ahmad",
      students: 542,
      duration: "10 jam",
      rating: 4.6,
      price: "Gratis",
      category: "data-science",
      image: "https://via.placeholder.com/300x200?text=Python+Data",
    },
    {
      id: 5,
      title: "JavaScript Modern ES6+",
      description: "Pelajari fitur-fitur terbaru JavaScript untuk development modern",
      instructor: "Budi Santoso",
      students: 923,
      duration: "7 jam",
      rating: 4.8,
      price: "Gratis",
      category: "programming",
      image: "https://via.placeholder.com/300x200?text=JavaScript",
    },
    {
      id: 6,
      title: "Digital Marketing Strategy",
      description: "Strategi pemasaran digital untuk meningkatkan brand awareness",
      instructor: "Lisa Permata",
      students: 456,
      duration: "5 jam",
      rating: 4.5,
      price: "Gratis",
      category: "marketing",
      image: "https://via.placeholder.com/300x200?text=Marketing",
    },
  ];

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase()) || course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Filter Toggle and Categories */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Categories Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"}`}
                    >
                      {category.name}
                      <span className="ml-2 text-xs opacity-75">({category.count})</span>
                    </button>
                  ))}
                </div>

                {/* Clear Filters and Results Count */}
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm">{filteredCourses.length} kursus ditemukan</span>
                  {(searchTerm || selectedCategory !== "all") && (
                    <button onClick={handleClearFilters} className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                      Hapus Filter
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

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-blue-400" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                      <CardDescription className="text-slate-400">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.students}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {course.rating}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Oleh {course.instructor}</p>
                          <p className="text-green-400 font-semibold">{course.price}</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                          <Link to={`/courses/${course.id}`}>Mulai</Link>
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
                  <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Tidak ada kursus ditemukan</h3>
                  <p className="text-slate-400 mb-6">Coba ubah kata kunci pencarian atau pilih kategori yang berbeda</p>
                  <Button onClick={handleClearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Tampilkan Semua Kursus
                  </Button>
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
