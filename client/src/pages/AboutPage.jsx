import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { icon: Users, label: "Pengguna Aktif", value: "10,000+" },
    { icon: Award, label: "Kursus Tersedia", value: "500+" },
    { icon: Target, label: "Tingkat Kepuasan", value: "98%" },
    { icon: Heart, label: "Mentor Berpengalaman", value: "200+" },
  ];

  const team = [
    {
      name: "Ahmad Rizki",
      role: "Founder & CEO",
      description: "Passionate about democratizing education in Indonesia",
      image: "https://via.placeholder.com/200x200?text=AR",
    },
    {
      name: "Siti Nurhaliza",
      role: "Head of Education",
      description: "Former teacher with 10+ years experience in pedagogy",
      image: "https://via.placeholder.com/200x200?text=SN",
    },
    {
      name: "Budi Santoso",
      role: "Tech Lead",
      description: "Full-stack developer passionate about EdTech innovation",
      image: "https://via.placeholder.com/200x200?text=BS",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1624]">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Ajarin.id</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Kami percaya bahwa pendidikan berkualitas harus dapat diakses oleh semua orang. Ajarin.id hadir sebagai platform pembelajaran peer-to-peer yang menghubungkan para pengajar dan pelajar di seluruh Indonesia.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Misi Kami</h2>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Menciptakan ekosistem pembelajaran yang inklusif, kolaboratif, dan berkelanjutan. Kami ingin setiap orang dapat berbagi ilmu dan belajar dari sesama, tanpa batasan geografis atau ekonomi.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="text-slate-300">Akses pendidikan gratis untuk semua</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="text-slate-300">Pembelajaran peer-to-peer yang efektif</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="text-slate-300">Komunitas belajar yang suportif</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">Visi Kami</h3>
                <p className="text-slate-300 leading-relaxed">Menjadi platform pembelajaran terdepan di Indonesia yang memberdayakan setiap individu untuk mencapai potensi maksimal mereka melalui kolaborasi dan sharing knowledge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Pencapaian Kami</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Beberapa angka yang menunjukkan dampak positif platform kami</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-slate-800/50 border-slate-700/50 text-center">
                    <CardContent className="p-6">
                      <Icon className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-slate-400 text-sm">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Tim Kami</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Bertemu dengan orang-orang hebat di balik Ajarin.id</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700/50 text-center">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-blue-400 mb-3">{member.role}</p>
                    <p className="text-slate-400 text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600/20 to-green-600/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Siap Bergabung dengan Komunitas Kami?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">Mulai perjalanan belajar Anda bersama ribuan pelajar dan pengajar lainnya</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">Gabung Sekarang</Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
