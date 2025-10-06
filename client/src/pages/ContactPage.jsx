import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "hello@ajarin.id",
      description: "Kirim email untuk pertanyaan umum",
    },
    {
      icon: Phone,
      title: "Telepon",
      content: "+62 21 1234 5678",
      description: "Hubungi kami untuk bantuan langsung",
    },
    {
      icon: MapPin,
      title: "Alamat",
      content: "Jakarta, Indonesia",
      description: "Kantor pusat kami",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      content: "09:00 - 18:00 WIB",
      description: "Senin - Jumat",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-[#0F1624]">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Hubungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Kami</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">Ada pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu Anda 24/7.</p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="bg-slate-800/50 border-slate-700/50 text-center hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-6">
                      <Icon className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                      <p className="text-blue-400 font-medium mb-2">{info.content}</p>
                      <p className="text-slate-400 text-sm">{info.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Form and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Kirim Pesan</CardTitle>
                  <CardDescription className="text-slate-400">Isi form di bawah ini dan kami akan segera merespons pesan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-slate-300">
                        Nama Lengkap
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-300">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nama@email.com"
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-300">
                        Subjek
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      >
                        <option value="" className="bg-slate-800">
                          Pilih subjek
                        </option>
                        <option value="general" className="bg-slate-800">
                          Pertanyaan Umum
                        </option>
                        <option value="technical" className="bg-slate-800">
                          Masalah Teknis
                        </option>
                        <option value="partnership" className="bg-slate-800">
                          Kerjasama
                        </option>
                        <option value="feedback" className="bg-slate-800">
                          Saran & Masukan
                        </option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-300">
                        Pesan
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tulis pesan Anda di sini..."
                        className="flex w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold transition-all duration-300 group">
                      Kirim Pesan
                      <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="space-y-8">
                {/* FAQ Section */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">FAQ</CardTitle>
                    <CardDescription className="text-slate-400">Pertanyaan yang sering diajukan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Apakah Ajarin.id benar-benar gratis?</h4>
                      <p className="text-slate-400 text-sm">Ya, semua kursus di platform kami dapat diakses secara gratis.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Bagaimana cara menjadi pengajar?</h4>
                      <p className="text-slate-400 text-sm">Daftar akun, lengkapi profil, dan ajukan permohonan untuk menjadi pengajar.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Apakah ada sertifikat?</h4>
                      <p className="text-slate-400 text-sm">Ya, Anda akan mendapat sertifikat digital setelah menyelesaikan kursus.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Ikuti Kami</CardTitle>
                    <CardDescription className="text-slate-400">Tetap terhubung di media sosial</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        LinkedIn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
