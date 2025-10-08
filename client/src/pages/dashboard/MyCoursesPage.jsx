import { useState } from "react";
import { BookOpen, Clock, Star, Play, MoreVertical, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const courses = [
    {
      id: 1,
      title: "React.js Fundamentals",
      instructor: "John Doe",
      progress: 75,
      status: "in-progress",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.8,
      totalLessons: 25,
      completedLessons: 18,
      nextLesson: "State Management with Hooks",
      estimatedTime: "2h 30m",
      enrolledAt: "2025-09-15",
    },
    {
      id: 2,
      title: "Node.js Backend Development",
      instructor: "Jane Smith",
      progress: 40,
      status: "in-progress",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.6,
      totalLessons: 30,
      completedLessons: 12,
      nextLesson: "Express.js Middleware",
      estimatedTime: "4h 15m",
      enrolledAt: "2025-09-20",
    },
    {
      id: 3,
      title: "JavaScript ES6+ Features",
      instructor: "Bob Wilson",
      progress: 100,
      status: "completed",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.9,
      totalLessons: 20,
      completedLessons: 20,
      nextLesson: null,
      estimatedTime: "0m",
      completedAt: "2025-09-10",
    },
    {
      id: 4,
      title: "Python for Beginners",
      instructor: "Alice Johnson",
      progress: 15,
      status: "in-progress",
      thumbnail: "/api/placeholder/300/200",
      rating: 4.7,
      totalLessons: 35,
      completedLessons: 5,
      nextLesson: "Variables and Data Types",
      estimatedTime: "8h 45m",
      enrolledAt: "2025-10-01",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "in-progress":
        return "bg-blue-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "in-progress":
        return "Sedang Berjalan";
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
              <Button variant={filterStatus === "in-progress" ? "default" : "outline"} onClick={() => setFilterStatus("in-progress")} className={filterStatus === "in-progress" ? "bg-blue-600" : "border-slate-600 text-slate-300"}>
                Sedang Berjalan
              </Button>
              <Button variant={filterStatus === "completed" ? "default" : "outline"} onClick={() => setFilterStatus("completed")} className={filterStatus === "completed" ? "bg-blue-600" : "border-slate-600 text-slate-300"}>
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="p-0">
              <div className="relative">
                <div className="w-full h-48 bg-slate-700 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(course.status)}>{getStatusText(course.status)}</Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs text-white">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-white mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-slate-400">oleh {course.instructor}</p>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-300">Progress</span>
                  <span className="text-sm text-slate-300">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
                  <span>
                    {course.completedLessons}/{course.totalLessons} pelajaran
                  </span>
                  {course.estimatedTime !== "0m" && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.estimatedTime} tersisa
                    </span>
                  )}
                </div>
              </div>

              {/* Next Lesson or Completed */}
              {course.status === "completed" ? (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">✅ Kursus selesai!</p>
                  <p className="text-xs text-green-300">Diselesaikan pada {new Date(course.completedAt).toLocaleDateString("id-ID")}</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium">Selanjutnya:</p>
                  <p className="text-xs text-blue-300">{course.nextLesson}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to={`/courses/${course.id}`}>
                    {course.status === "completed" ? (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Lihat Ulang
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {course.progress === 0 ? "Mulai" : "Lanjutkan"}
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
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">Download Materi</DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">Beri Rating</DropdownMenuItem>
                    {course.status !== "completed" && <DropdownMenuItem className="text-red-400 hover:bg-slate-700">Keluar dari Kursus</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
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
