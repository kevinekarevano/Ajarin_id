import { Link } from "react-router";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="container mx-auto px-6 py-12 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text leading-none">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>

          <Link to="/courses" className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200">
            <Search className="w-5 h-5 mr-2" />
            Jelajahi Kursus
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Mungkin Anda sedang mencari:</h3>
          <div className="space-y-2">
            <Link to="/courses" className="block text-blue-300 hover:text-blue-200 transition-colors">
              • Daftar Kursus Pembelajaran
            </Link>
            <Link to="/about" className="block text-blue-300 hover:text-blue-200 transition-colors">
              • Tentang Ajarin.id
            </Link>
            <Link to="/contact" className="block text-blue-300 hover:text-blue-200 transition-colors">
              • Hubungi Kami
            </Link>
            <Link to="/login" className="block text-blue-300 hover:text-blue-200 transition-colors">
              • Masuk ke Akun
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12">
          <p className="text-sm text-slate-400">
            Jika Anda yakin ini adalah kesalahan, silakan{" "}
            <Link to="/contact" className="text-blue-300 hover:text-blue-200 underline">
              hubungi tim support
            </Link>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
