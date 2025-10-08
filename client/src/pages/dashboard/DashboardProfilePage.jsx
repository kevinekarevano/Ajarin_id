import { useState } from "react";
import { User, Mail, Calendar, MapPin, Edit, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/authStore";

export default function DashboardProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    skills: user?.skills || [],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullname: user?.fullname || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
      skills: user?.skills || [],
    });
    setIsEditing(false);
  };

  const stats = {
    coursesEnrolled: 5,
    coursesCompleted: 2,
    coursesCreated: 1,
    totalStudents: 25,
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
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">{user?.fullname?.charAt(0)?.toUpperCase() || "U"}</div>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-bold text-white">{user?.fullname || "User Name"}</h2>
                <p className="text-slate-400">{user?.role || "Student"}</p>
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
                <Input id="fullname" value={formData.fullname} onChange={(e) => handleInputChange("fullname", e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
              ) : (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-white">{user?.fullname || "Belum diisi"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              {isEditing ? (
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="bg-slate-900 border-slate-700 text-white" />
              ) : (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-white">{user?.email || "Belum diisi"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-slate-300">
                Lokasi
              </Label>
              {isEditing ? (
                <Input id="location" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="Jakarta, Indonesia" />
              ) : (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-white">{formData.location || "Belum diisi"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="website" className="text-slate-300">
                Website
              </Label>
              {isEditing ? (
                <Input id="website" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="https://yourwebsite.com" />
              ) : (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded text-white">{formData.website || "Belum diisi"}</div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-slate-300">
              Bio
            </Label>
            {isEditing ? (
              <Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="Ceritakan tentang diri Anda..." rows={4} />
            ) : (
              <div className="p-2 bg-slate-900 border border-slate-700 rounded text-white min-h-[100px]">{formData.bio || "Belum diisi"}</div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Keahlian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["React.js", "Node.js", "JavaScript", "Python", "UI/UX Design"].map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                {skill}
              </span>
            ))}
            {isEditing && (
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                + Tambah Keahlian
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
