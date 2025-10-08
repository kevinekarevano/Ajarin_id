import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Star, Search, Filter, X, Plus, Heart, Play } from "lucide-react";

export default function DashboardBrowseCoursesPage() {
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
      image: "/api/placeholder/400/200",
      level: "Pemula",
    },
    {
      id: 2,
      title: "UI/UX Design Fundamentals",
      description: "Memahami prinsip-prinsip dasar desain UI/UX untuk membuat pengalaman pengguna yang baik",
      instructor: "Jane Smith",
      students: 987,
      duration: "6 jam",
      rating: 4.7,
      price: "Gratis",
      category: "design",
      image: "/api/placeholder/400/200",
      level: "Pemula",
    },
    {
      id: 3,
      title: "Data Analysis dengan Python",
      description: "Analisis data menggunakan Python, pandas, dan matplotlib untuk insights yang actionable",
      instructor: "Mike Johnson",
      students: 756,
      duration: "10 jam",
      rating: 4.9,
      price: "Gratis",
      category: "data-science",
      image: "/api/placeholder/400/200",
      level: "Menengah",
    },
    {
      id: 4,
      title: "Digital Marketing Strategy",
      description: "Strategi pemasaran digital yang efektif untuk meningkatkan brand awareness dan sales",
      instructor: "Sarah Wilson",
      students: 543,
      duration: "5 jam",
      rating: 4.6,
      price: "Gratis",
      category: "marketing",
      image: "/api/placeholder/400/200",
      level: "Pemula",
    },
    {
      id: 5,
      title: "Node.js Backend Development",
      description: "Membangun API REST yang scalable menggunakan Node.js, Express, dan MongoDB",
      instructor: "Alex Chen",
      students: 1089,
      duration: "12 jam",
      rating: 4.8,
      price: "Gratis",
      category: "programming",
      image: "/api/placeholder/400/200",
      level: "Menengah",
    },
    {
      id: 6,
      title: "Figma untuk Desainer Pemula",
      description: "Menguasai tools Figma untuk membuat prototype dan desain interface yang professional",
      instructor: "Lisa Brown",
      students: 432,
      duration: "4 jam",
      rating: 4.7,
      price: "Gratis",
      category: "design",
      image: "/api/placeholder/400/200",
      level: "Pemula",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase()) || course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all group">
            <CardHeader className="p-0">
              <div className="relative">
                {/* Course Image */}
                <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-slate-400" />
                </div>

                {/* Level Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={getLevelBadgeColor(course.level)}>{course.level}</Badge>
                </div>

                {/* Favorite Button */}
                <Button size="sm" variant="ghost" className="absolute top-3 right-3 bg-black/50 hover:bg-black/70">
                  <Heart className="w-4 h-4 text-white" />
                </Button>

                {/* Rating */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-sm text-white">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  {course.rating}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-2">{course.description}</p>
                <p className="text-sm text-blue-400">oleh {course.instructor}</p>
              </div>

              {/* Course Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {course.students.toLocaleString()} siswa
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-green-400">{course.price}</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Ikuti Kursus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tidak ada kursus ditemukan</h3>
            <p className="text-slate-400 mb-6">Coba ubah kata kunci pencarian atau filter yang dipilih</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reset Filter
            </Button>
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
