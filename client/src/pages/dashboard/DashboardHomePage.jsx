import { useState } from "react";
import { BookOpen, Users, Award, Plus, Star, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import useAuthStore from "@/store/authStore";

export default function DashboardHomePage() {
  const { user } = useAuthStore();

  // Mock data
  const stats = {
    enrolledCourses: 5,
    completedCourses: 2,
    totalPoints: 1250,
    streak: 7,
  };

  const recentCourses = [
    {
      id: 1,
      title: "React.js Fundamentals",
      progress: 75,
      nextLesson: "State Management with Hooks",
      instructor: "John Doe",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: 2,
      title: "Node.js Backend Development",
      progress: 40,
      nextLesson: "Express.js Middleware",
      instructor: "Jane Smith",
      thumbnail: "/api/placeholder/300/200",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "JavaScript Workshop",
      date: "15 Oktober 2025",
      time: "19:00 WIB",
      type: "Workshop",
    },
    {
      id: 2,
      title: "Career Talk: Frontend Developer",
      date: "18 Oktober 2025",
      time: "20:00 WIB",
      type: "Webinar",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "First Course Completed",
      description: "Selesaikan kursus pertama Anda",
      icon: "🏆",
      earned: true,
    },
    {
      id: 2,
      title: "7-Day Streak",
      description: "Belajar selama 7 hari berturut-turut",
      icon: "🔥",
      earned: true,
    },
    {
      id: 3,
      title: "Top Learner",
      description: "Masuk 10 besar learner terbaik",
      icon: "⭐",
      earned: false,
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white w-full">
        <h1 className="text-2xl font-bold mb-2">Selamat datang kembali, {user?.fullname || "User"}! 👋</h1>
        <p className="text-blue-100">Siap melanjutkan perjalanan belajar hari ini? Mari capai target belajar Anda!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Kursus Diikuti</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.enrolledCourses}</div>
            <p className="text-xs text-slate-400">+2 dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Kursus Selesai</CardTitle>
            <Award className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedCourses}</div>
            <p className="text-xs text-slate-400">40% completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Poin</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
            <p className="text-xs text-slate-400">+150 poin minggu ini</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Streak Belajar</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.streak} hari</div>
            <p className="text-xs text-slate-400">Pertahankan streak!</p>
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
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">Selanjutnya: {course.nextLesson}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{course.progress}%</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Lanjutkan
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Acara Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{event.title}</h4>
                    <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">{event.type}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5" />
                Pencapaian Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-3 rounded-lg ${achievement.earned ? "bg-green-900/20 border border-green-700" : "bg-slate-900 border border-slate-700"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${achievement.earned ? "text-green-400" : "text-slate-400"}`}>{achievement.title}</h4>
                      <p className="text-xs text-slate-500">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
              <Link to="/dashboard/browse-courses">
                <BookOpen className="w-6 h-6" />
                <span>Jelajahi Kursus</span>
              </Link>
            </Button>

            <Button asChild className="h-auto p-4 flex-col gap-2 bg-purple-600 hover:bg-purple-700">
              <Link to="/dashboard/create-course">
                <Plus className="w-6 h-6" />
                <span>Buat Kursus</span>
              </Link>
            </Button>

            <Button asChild className="h-auto p-4 flex-col gap-2 bg-green-600 hover:bg-green-700">
              <Link to="/dashboard/discussions">
                <Users className="w-6 h-6" />
                <span>Gabung Diskusi</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
