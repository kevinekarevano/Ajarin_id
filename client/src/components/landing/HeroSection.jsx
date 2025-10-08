import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Star } from "lucide-react";
import { Link } from "react-router";
import useAuthStore from "@/store/authStore";

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative min-h-screen pt-20  overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-30 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-green-500/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-yellow-500/20 rounded-full blur-md animate-pulse delay-3000"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute hidden xl:block inset-0 pointer-events-none">
        <div className="absolute top-32 left-20 animate-float">
          <h1 className="text-6xl rotate-19">👨‍🎓</h1>
        </div>
        <div className="absolute top-60 right-32 animate-float delay-1000">
          <h1 className="text-6xl -rotate-23">📖</h1>
        </div>
        <div className="absolute top-140 left-40  animate-float delay-2000">
          <h1 className="text-6xl rotate-5">💻</h1>
        </div>
        <div className="absolute top-170 right-40 animate-float delay-3000">
          <h1 className="text-6xl -rotate-12">🤩</h1>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Main heading */}
        <div className="mb-8">
          <h1 className="inline-block text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#5C92FF] via-[#D6FEEA] to-[#F5FF64] bg-clip-text text-transparent leading-[1.2]">Belajar Bareng, Pintar Bareng.</h1>

          <p className="text-xl md:text-3xl font-light text-[#E6E6E6] max-w-4xl mx-auto leading-relaxed">
            Bisa <span className=" font-semibold">Mengajar dan Belajar!</span> Temukan <span className=" font-semibold">Ilmu Gratis</span> dari Sesama, atau Bagikan <span className="font-semibold">Keahlianmu Sekarang!</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4  mb-16">
          {isAuthenticated ? (
            <>
              <Button className="bg-[#2279AB] text-2xl py-6 px-5 hover:bg-[#1f6d9a] text-white" asChild>
                <Link to="/dashboard">Ke Dashboard</Link>
              </Button>
              <Button className="bg-[#3A4B54]  text-2xl py-6 px-5  hover:bg-[#334249] text-white" asChild>
                <Link to="/courses">Lihat Semua Kursus</Link>
              </Button>
            </>
          ) : (
            <>
              <Button className="bg-[#2279AB] text-2xl py-6 px-5 hover:bg-[#1f6d9a] text-white" asChild>
                <Link to="/register">Gabung Sekarang</Link>
              </Button>
              <Button className="bg-[#3A4B54]  text-2xl py-6 px-5  hover:bg-[#334249] text-white" asChild>
                <Link to="/courses">Lihat Semua Kursus</Link>
              </Button>
            </>
          )}
        </div>

        {/* Featured courses preview */}
        <div className="w-full mt-30 max-w-4xl">
          <p className="text-slate-400 text-2xl mb-6">Temukan berbagai materi menarik!</p>

          <div>
            <img src="/preview-courses.png" alt="prevuew courses" />
          </div>
        </div>
      </div>
    </section>
  );
}
