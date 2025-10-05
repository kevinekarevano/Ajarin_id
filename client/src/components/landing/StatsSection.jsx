import { GraduationCap, BookOpen, Users, TrendingUp } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: "100+",
      label: "Anggota",
      color: "text-blue-400",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      number: "500+",
      label: "Materi",
      color: "text-green-400",
    },
  ];

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sudah terbukti!</h2>
          <p className="text-slate-400 text-lg">Bergabunglah dengan komunitas pembelajar yang terus berkembang</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-6">
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-xl text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
