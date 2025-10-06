import { useState } from "react";
import { useParams } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, Play, Download, Share2, Heart, CheckCircle, Award, Globe, Calendar, User, MessageCircle } from "lucide-react";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Dummy course data
  const course = {
    id: id || 1,
    title: "Pemrograman Web dengan React",
    description: "Belajar membuat aplikasi web modern dengan React.js dari dasar hingga mahir. Kursus ini akan mengajarkan Anda konsep fundamental React, hooks, state management, dan best practices dalam pengembangan aplikasi web.",
    instructor: {
      name: "John Doe",
      bio: "Senior Frontend Developer dengan 8+ tahun pengalaman di berbagai startup teknologi. Telah mengajar lebih dari 10,000 siswa online.",
      avatar: "https://via.placeholder.com/100x100?text=JD",
      rating: 4.9,
      students: 15420,
      courses: 12,
    },
    thumbnail: "https://via.placeholder.com/800x400?text=React+Course+Thumbnail",
    students: 1234,
    duration: "8 jam",
    rating: 4.8,
    totalRatings: 567,
    price: "Gratis",
    category: "Pemrograman",
    level: "Pemula - Menengah",
    language: "Bahasa Indonesia",
    lastUpdated: "November 2024",
    whatYouWillLearn: [
      "Memahami konsep dasar React dan JSX",
      "Menggunakan React Hooks (useState, useEffect, dll)",
      "Mengelola state aplikasi dengan Context API",
      "Membuat komponen reusable dan maintainable",
      "Implementasi routing dengan React Router",
      "Integrasi dengan REST API",
      "Best practices dalam React development",
      "Deploy aplikasi React ke production",
    ],
    requirements: ["Pemahaman dasar HTML, CSS, dan JavaScript", "Text editor (VS Code recommended)", "Node.js terinstall di komputer", "Koneksi internet yang stabil"],
    curriculum: [
      {
        id: 1,
        title: "Pendahuluan dan Setup",
        lessons: [
          { id: 1, title: "Pengenalan React", duration: "10 menit", isPreview: true },
          { id: 2, title: "Setup Development Environment", duration: "15 menit", isPreview: true },
          { id: 3, title: "Membuat Project React Pertama", duration: "20 menit", isPreview: false },
        ],
      },
      {
        id: 2,
        title: "React Fundamentals",
        lessons: [
          { id: 4, title: "JSX dan Components", duration: "25 menit", isPreview: false },
          { id: 5, title: "Props dan State", duration: "30 menit", isPreview: false },
          { id: 6, title: "Event Handling", duration: "20 menit", isPreview: false },
        ],
      },
      {
        id: 3,
        title: "React Hooks",
        lessons: [
          { id: 7, title: "useState Hook", duration: "25 menit", isPreview: false },
          { id: 8, title: "useEffect Hook", duration: "30 menit", isPreview: false },
          { id: 9, title: "Custom Hooks", duration: "35 menit", isPreview: false },
        ],
      },
      {
        id: 4,
        title: "Advanced Topics",
        lessons: [
          { id: 10, title: "Context API", duration: "40 menit", isPreview: false },
          { id: 11, title: "React Router", duration: "35 menit", isPreview: false },
          { id: 12, title: "API Integration", duration: "45 menit", isPreview: false },
        ],
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Ahmad Rizki",
        rating: 5,
        comment: "Kursus yang sangat bagus! Penjelasan sangat jelas dan mudah dipahami. Sekarang saya sudah bisa membuat aplikasi React sendiri.",
        date: "2 minggu lalu",
        avatar: "https://via.placeholder.com/50x50?text=AR",
      },
      {
        id: 2,
        user: "Siti Nurhaliza",
        rating: 5,
        comment: "Instruktur sangat berpengalaman dan cara mengajarnya sangat engaging. Materi up-to-date dengan industri.",
        date: "1 bulan lalu",
        avatar: "https://via.placeholder.com/50x50?text=SN",
      },
      {
        id: 3,
        user: "Budi Santoso",
        rating: 4,
        comment: "Overall bagus, tapi mungkin bisa ditambah lebih banyak project practice.",
        date: "3 minggu lalu",
        avatar: "https://via.placeholder.com/50x50?text=BS",
      },
    ],
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // TODO: API call to enroll user
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Kurikulum" },
    { id: "instructor", label: "Instruktur" },
    { id: "reviews", label: "Ulasan" },
  ];

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
                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{course.category}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">{course.description}</p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-slate-400">({course.totalRatings} ulasan)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{course.students} siswa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span>{course.language}</span>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {course.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Dibuat oleh {course.instructor.name}</p>
                    <p className="text-slate-400 text-sm">Update terakhir {course.lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Course Card */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700/50 sticky top-24">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg flex items-center justify-center relative">
                    <Play className="h-16 w-16 text-white bg-blue-600 rounded-full p-4 cursor-pointer hover:bg-blue-700 transition-colors" />
                    <span className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">Preview</span>
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold text-green-400">{course.price}</span>
                    </div>

                    {!isEnrolled ? (
                      <Button onClick={handleEnroll} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold mb-4">
                        Daftar Sekarang
                      </Button>
                    ) : (
                      <div className="space-y-3 mb-4">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                          <Play className="mr-2 h-5 w-5" />
                          Mulai Belajar
                        </Button>
                        <div className="flex items-center justify-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Anda sudah terdaftar
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mb-6">
                      <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Heart className="h-4 w-4 mr-2" />
                        Simpan
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Share2 className="h-4 w-4 mr-2" />
                        Bagikan
                      </Button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level:</span>
                        <span className="text-white">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Durasi:</span>
                        <span className="text-white">{course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sertifikat:</span>
                        <span className="text-white flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          Ya
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Akses:</span>
                        <span className="text-white">Selamanya</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-700 mb-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-400" : "text-slate-400 hover:text-white"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* What You'll Learn */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Yang Akan Anda Pelajari</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Persyaratan</h3>
                      <div className="space-y-3">
                        {course.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-300">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "curriculum" && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-6">Kurikulum Kursus</h3>
                    {course.curriculum.map((section) => (
                      <Card key={section.id} className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {section.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                  <Play className="h-4 w-4 text-blue-400" />
                                  <span className="text-slate-300">{lesson.title}</span>
                                  {lesson.isPreview && <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Preview</span>}
                                </div>
                                <span className="text-slate-400 text-sm">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === "instructor" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-6">Tentang Instruktur</h3>
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-2xl font-bold">
                              {course.instructor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-white mb-2">{course.instructor.name}</h4>
                            <p className="text-slate-300 mb-4 leading-relaxed">{course.instructor.bio}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-white font-semibold">{course.instructor.rating}</span>
                                </div>
                                <span className="text-slate-400 text-sm">Rating Instruktur</span>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-semibold mb-1">{course.instructor.students.toLocaleString()}</div>
                                <span className="text-slate-400 text-sm">Siswa</span>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-semibold mb-1">{course.instructor.courses}</div>
                                <span className="text-slate-400 text-sm">Kursus</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">Ulasan Siswa</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{course.rating}</span>
                        <span className="text-slate-400">({course.totalRatings} ulasan)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {course.reviews.map((review) => (
                        <Card key={review.id} className="bg-slate-800/50 border-slate-700/50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                  {review.user
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-white">{review.user}</h5>
                                  <span className="text-slate-400 text-sm">{review.date}</span>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-slate-600"}`} />
                                  ))}
                                </div>
                                <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Related Courses */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700/50 sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-white">Kursus Terkait</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h6 className="text-white text-sm font-medium mb-1">JavaScript Advanced</h6>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Users className="h-3 w-3" />
                            <span>890 siswa</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
