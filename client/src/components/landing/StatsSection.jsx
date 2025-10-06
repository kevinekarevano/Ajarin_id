import { GraduationCap, BookOpen, Users, TrendingUp } from "lucide-react";

export function StatsSection() {
  return (
    <section className="py-20 ">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sudah terbukti!</h2>
          <p className="text-slate-400 text-lg">Bergabunglah dengan komunitas pembelajar yang terus berkembang</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-30 max-w-6xl items-center mx-auto">
          <div>
            <img src="/stats-anggota.svg" alt="" className="mx-auto" />
          </div>
          <div>
            <img src="/stats-materi.svg" alt="" className="mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
