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
      name: "Kevin Ekarevano",
      role: "Founder & Full Stack Developer",
      description: "Passionate about creating innovative education solutions and leading the technical vision",
      image: "/kepin.jpg",
    },
    {
      name: "Ahmad Ferdiansyah",
      role: "Co-Founder & Security Engineer",
      description: "Focused on platform security, infrastructure, and ensuring safe learning environment",
      image: "/perdi.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1624]">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Ajarin.id</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">Platform pembelajaran online yang menyediakan kursus berkualitas tinggi untuk semua orang, gratis dan mudah diakses.</p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Misi Kami</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Memberikan akses pendidikan berkualitas tinggi untuk semua orang, tanpa batasan geografis atau ekonomi. Kami percaya setiap orang berhak mendapatkan kesempatan untuk belajar dan berkembang.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-white font-semibold mb-2">Pendidikan Gratis</h3>
                  <p className="text-slate-400 text-sm">Akses pembelajaran tanpa biaya untuk semua</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-white font-semibold mb-2">Komunitas</h3>
                  <p className="text-slate-400 text-sm">Belajar bersama dalam komunitas yang suportif</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-white font-semibold mb-2">Mudah Diakses</h3>
                  <p className="text-slate-400 text-sm">Platform yang simple dan user-friendly</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Platform dalam Angka</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Tim Developer</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Bertemu dengan developer di balik Ajarin.id</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700/50 text-center">
                  <CardContent className="p-8">
                    <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-blue-400 mb-3 font-medium">{member.role}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600/20 to-green-600/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Mulai Belajar Sekarang</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">Bergabunglah dengan ribuan learner lainnya dan tingkatkan skill Anda</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">Lihat Kursus</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
