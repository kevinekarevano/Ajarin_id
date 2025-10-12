import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <Link to="/register" className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Kembali ke halaman regist
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Syarat dan Ketentuan</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">Syarat dan ketentuan penggunaan platform pembelajaran Ajarin.id</p>
          <p className="text-sm text-slate-400 mt-4">Terakhir diperbarui: 12 Oktober 2025</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12">
          <div className="prose prose-invert prose-blue max-w-none text-slate-200">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Penerimaan Syarat</h2>
              <p className="leading-relaxed">
                Dengan mengakses dan menggunakan platform Ajarin.id, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Definisi Layanan</h2>
              <p className="leading-relaxed mb-4">Ajarin.id adalah platform pembelajaran online yang menyediakan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Kursus pembelajaran dalam berbagai bidang teknologi</li>
                <li>Materi pembelajaran berupa video, teks, dan tugas praktik</li>
                <li>Sistem penilaian dan sertifikat penyelesaian</li>
                <li>Forum diskusi dan komunitas pembelajaran</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Akun Pengguna</h2>
              <p className="leading-relaxed mb-4">Untuk menggunakan layanan kami, Anda perlu membuat akun dengan ketentuan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informasi yang diberikan harus akurat dan terkini</li>
                <li>Anda bertanggung jawab menjaga keamanan akun dan password</li>
                <li>Satu orang hanya diperbolehkan memiliki satu akun</li>
                <li>Kami berhak menangguhkan akun yang melanggar ketentuan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Penggunaan Platform</h2>
              <p className="leading-relaxed mb-4">Dalam menggunakan platform ini, Anda setuju untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menggunakan layanan hanya untuk tujuan pembelajaran yang sah</li>
                <li>Tidak membagikan akses akun kepada orang lain</li>
                <li>Tidak melakukan aktivitas yang dapat merusak sistem</li>
                <li>Menghormati hak kekayaan intelektual materi pembelajaran</li>
                <li>Berinteraksi dengan sopan dalam forum diskusi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Konten dan Kekayaan Intelektual</h2>
              <p className="leading-relaxed mb-4">Semua konten di platform ini, termasuk video, teks, gambar, dan materi pembelajaran lainnya adalah milik Ajarin.id atau pemilik lisensi yang sah. Anda tidak diperkenankan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mengunduh, menyalin, atau mendistribusikan konten tanpa izin</li>
                <li>Menggunakan konten untuk kepentingan komersial</li>
                <li>Memodifikasi atau membuat karya turunan dari konten</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Pembayaran dan Refund</h2>
              <p className="leading-relaxed mb-4">Untuk kursus berbayar, berlaku ketentuan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pembayaran harus dilakukan sebelum mengakses materi premium</li>
                <li>Refund dapat diberikan dalam 7 hari pertama dengan syarat tertentu</li>
                <li>Akses kursus berlaku selama periode yang ditentukan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Batasan Tanggung Jawab</h2>
              <p className="leading-relaxed">
                Ajarin.id tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan platform ini. Kami berusaha memberikan layanan terbaik namun tidak menjamin ketersediaan layanan 100% tanpa gangguan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Perubahan Syarat</h2>
              <p className="leading-relaxed">Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui platform dan akan berlaku efektif setelah diumumkan.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Kontak</h2>
              <p className="leading-relaxed">Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami di:</p>
              <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
                <p>
                  <strong>Email:</strong> support@ajarin.id
                </p>
                <p>
                  <strong>Alamat:</strong> Jakarta, Indonesia
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
