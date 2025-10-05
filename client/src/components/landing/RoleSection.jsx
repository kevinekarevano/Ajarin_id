import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users } from "lucide-react";

export function RoleSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-slate-400 text-lg mb-4">Bisa mengajar & belajar!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Mentor Section */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 text-6xl">👨‍🏫</div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 ml-8">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">Bisa jadi,</h3>
                <h3 className="text-3xl font-bold mb-4">
                  <span className="text-green-400">Mentor</span>
                  <span className="text-white"> ✓</span>
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed">Bagikan keahlianmu dan bantu orang lain belajar. Dapatkan pengalaman mengajar yang berharga sambil membangun komunitas pembelajaran.</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl group">
                Mulai Mengajar
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Learner Section */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 text-6xl">👨‍🎓</div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mr-8">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">Bisa jadi,</h3>
                <h3 className="text-3xl font-bold mb-4">
                  <span className="text-purple-400">Learner</span>
                  <span className="text-white"> ✓</span>
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed">Temukan berbagai kursus menarik dari mentor berpengalaman. Belajar dengan fleksibel sesuai waktu dan minatmu.</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl group">
                Mulai Belajar
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
