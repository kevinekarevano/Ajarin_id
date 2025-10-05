import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-green-500/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-yellow-500/20 rounded-full blur-md animate-pulse delay-3000"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-20 opacity-30 animate-float">
          <BookOpen className="w-8 h-8 text-blue-400" />
        </div>
        <div className="absolute top-60 right-32 opacity-30 animate-float delay-1000">
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <div className="absolute bottom-60 left-40 opacity-30 animate-float delay-2000">
          <Star className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="absolute top-80 right-1/4 opacity-30 animate-float delay-3000">
          <div className="w-4 h-4 bg-green-400 rounded rotate-45"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Main heading */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-blue-400">Belajar Bareng</span>
            <span className="text-white">, </span>
            <span className="text-white">Pintar Bareng</span>
            <span className="text-yellow-400">.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Bisa <span className="text-blue-400 font-semibold">Mengajar dan Belajar!</span> Temukan <span className="text-green-400 font-semibold">Ilmu Gratis</span> dari Sesama, atau Bagikan{" "}
            <span className="text-purple-400 font-semibold">Keahlianmu Sekarang!</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            Gabung Sekarang
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
            Lihat Semua Kursus
          </Button>
        </div>

        {/* Featured courses preview */}
        <div className="w-full max-w-4xl">
          <p className="text-slate-400 text-lg mb-8">Temukan berbagai materi menarik!</p>

          <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Course category icons */}
              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">Ai</span>
                </div>
                <span className="text-white text-sm font-medium">Design</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <span className="text-white text-sm font-medium">Mathematics</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">💻</span>
                </div>
                <span className="text-white text-sm font-medium">Programming</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">🎨</span>
                </div>
                <span className="text-white text-sm font-medium">Creative</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
