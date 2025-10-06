import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Award, MessageCircle, Upload, BarChart3 } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Berbagai Materi",
      description: "Gratis Berkualitas",
      detail: "Akses materi pembelajaran inovatif dan relevan yang dirancang untuk membantu menyelesaikan kebutuhan belajar, dari tingkat dasar hingga mahir, tanpa perlu mengeluarkan biaya.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Komunitas Aktif",
      description: "Belajar Bersama",
      detail: "Bergabung dengan komunitas pembelajar yang saling mendukung dan berbagi pengetahuan.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Forum Diskusi",
      description: "Tanya & Jawab",
      detail: "Bertanya, berdiskusi, dan berbagi pengalaman dengan mentor dan sesama learner.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload Tugas",
      description: "Sistem Assignment",
      detail: "Submit tugas dengan mudah dan dapatkan feedback dari mentor untuk perkembangan belajar.",
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-400",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor Pembelajaran",
      detail: "Pantau kemajuan belajar dengan sistem tracking yang sederhana dan efektif.",
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-400",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Mentor Berpengalaman",
      description: "Bimbingan Ahli",
      detail: "Belajar dari mentor yang berpengalaman dan siap membimbing perjalanan belajarmu.",
      gradient: "from-indigo-500/20 to-blue-500/20",
      iconColor: "text-indigo-400",
    },
  ];

  return (
    <section className="py-20 ">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Berbagai Materi, <span className="bg-gradient-to-r from-[#5C92FF] via-[#D6FEEA] to-[#F5FF64] bg-clip-text text-transparent ">Gratis Berkualitas</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Akses materi pembelajaran inovatif dan relevan yang dirancang untuk membantu menyelesaikan kebutuhan belajar, dari tingkat dasar hingga mahir, tanpa perlu mengeluarkan biaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={feature.iconColor}>{feature.icon}</div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>

                <p className="text-blue-400 font-semibold mb-3">{feature.description}</p>

                <p className="text-slate-400 leading-relaxed">{feature.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course preview cards */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Website", color: "bg-orange-500", icon: "🌐" },
                { name: "Softskill", color: "bg-blue-500", icon: "🧠" },
                { name: "Design", color: "bg-yellow-500", icon: "🎨" },
                { name: "Academic", color: "bg-cyan-500", icon: "📐" },
                { name: "Editing", color: "bg-green-500", icon: "💻" },
                { name: "AI", color: "bg-blue-600", icon: "🤖" },
                { name: "Mobile Dev", color: "bg-blue-600", icon: "📱" },
              ].map((tech, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-white text-sm font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
