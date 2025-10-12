import { useState, useEffect } from "react";
import { User, Mail, Calendar, MapPin, Edit, Camera, Save, X, BookOpen, Award, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/authStore";
import useEnrollmentStore from "@/store/enrollmentStore";
import useCourseStore from "@/store/courseStore";
import toast from "react-hot-toast";

export default function DashboardProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { enrolledCourses, fetchMyEnrolledCourses } = useEnrollmentStore();
  const { courses, fetchMyCourses } = useCourseStore();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    bio: "",
    headline: "",
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchMyEnrolledCourses();
    fetchMyCourses();
  }, [fetchMyEnrolledCourses, fetchMyCourses, user?._id]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        headline: user.headline || "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const result = await updateUser(formData);

      if (result.success) {
        toast.success("Profil berhasil diperbarui!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        headline: user.headline || "",
      });
    }
    setIsEditing(false);
  };

  // Calculate real statistics from API data
  const stats = {
    coursesEnrolled: enrolledCourses?.length || 0,
    coursesCompleted: enrolledCourses?.filter((enrollment) => enrollment.progress === 100 || enrollment.completed)?.length || 0,
    coursesCreated: courses?.length || 0,
    totalStudents:
      courses?.reduce((total, course) => {
        return total + (course.enrolledStudents || course.studentsCount || 0);
      }, 0) || 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user?.fullname || user?.username || "User"} className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-slate-600" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-slate-600">
                    {(() => {
                      // Generate initials from fullname or username
                      const name = user?.fullname || user?.username || "User";
                      const words = name.trim().split(" ");

                      if (words.length >= 2) {
                        // If multiple words, take first letter of first and last word
                        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
                      } else {
                        // If single word, take first letter
                        return words[0].charAt(0).toUpperCase();
                      }
                    })()}
                  </div>
                )}
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-bold text-white">{user?.fullname || user?.username || "User"}</h2>
                <p className="text-slate-400">@{user?.username || "username"}</p>
                {user?.headline && <p className="text-slate-300 text-sm mt-1">{user.headline}</p>}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Profil Saya</h1>
                  <p className="text-slate-400">Kelola informasi profil dan preferensi akun Anda</p>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} className={isEditing ? "border-slate-600 text-slate-300" : "bg-blue-600 hover:bg-blue-700"}>
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Batal
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profil
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{stats.coursesEnrolled}</div>
                  <div className="text-xs text-slate-400">Kursus Diikuti</div>
                </div>
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{stats.coursesCompleted}</div>
                  <div className="text-xs text-slate-400">Kursus Selesai</div>
                </div>
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{stats.coursesCreated}</div>
                  <div className="text-xs text-slate-400">Kursus Dibuat</div>
                </div>
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{stats.totalStudents}</div>
                  <div className="text-xs text-slate-400">Total Siswa</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullname" className="text-slate-300">
                Nama Lengkap
              </Label>
              {isEditing ? (
                <Input id="fullname" value={formData.fullname} onChange={(e) => handleInputChange("fullname", e.target.value)} className="bg-slate-900 border-slate-700 text-white focus:border-blue-500" placeholder="Masukkan nama lengkap" />
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white min-h-[42px] flex items-center">{user?.fullname || "Belum diisi"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              {isEditing ? (
                <Input id="username" value={formData.username} onChange={(e) => handleInputChange("username", e.target.value)} className="bg-slate-900 border-slate-700 text-white focus:border-blue-500" placeholder="username_unik" />
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white min-h-[42px] flex items-center">@{user?.username || "username"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              {isEditing ? (
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="bg-slate-900 border-slate-700 text-white focus:border-blue-500" placeholder="email@example.com" />
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white min-h-[42px] flex items-center">{user?.email || "Belum diisi"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="headline" className="text-slate-300">
                Headline
              </Label>
              {isEditing ? (
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                  placeholder="Fullstack Developer | React Enthusiast"
                />
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white min-h-[42px] flex items-center">{user?.headline || "Belum diisi"}</div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-slate-300">
              Bio
            </Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                placeholder="Ceritakan tentang diri Anda, pengalaman, dan keahlian yang dimiliki..."
                rows={4}
              />
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white min-h-[100px] whitespace-pre-wrap">{user?.bio || "Belum diisi"}</div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Aktivitas Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enrolled Courses */}
            <div>
              <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Kursus yang Diikuti ({stats.coursesEnrolled})
              </h3>
              {enrolledCourses && enrolledCourses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {enrolledCourses.slice(0, 5).map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                      <span className="text-white text-sm truncate flex-1 mr-2">{enrollment.course?.title || "Kursus"}</span>
                      <span className="text-xs text-slate-400">{enrollment.progress || 0}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm p-4 text-center border border-slate-700 rounded-lg">Belum mengikuti kursus apapun</div>
              )}
            </div>

            {/* Created Courses */}
            <div>
              <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Kursus yang Dibuat ({stats.coursesCreated})
              </h3>
              {courses && courses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {courses.slice(0, 5).map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                      <span className="text-white text-sm truncate flex-1 mr-2">{course.title}</span>
                      <span className="text-xs text-slate-400">{course.enrolledStudents || course.studentsCount || 0} siswa</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm p-4 text-center border border-slate-700 rounded-lg">Belum membuat kursus apapun</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
