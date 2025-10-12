import { Link } from "react-router";
import { ChevronLeft, Shield, Eye, Lock, Database } from "lucide-react";

const PrivacyPage = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Kebijakan Privasi</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda</p>
          <p className="text-sm text-slate-400 mt-4">Terakhir diperbarui: 12 Oktober 2025</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12">
          {/* Privacy Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-blue-500/20 rounded-xl">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Keamanan Data</h3>
              <p className="text-slate-300 text-sm">Data Anda dienkripsi dan disimpan dengan aman</p>
            </div>
            <div className="text-center p-6 bg-green-500/20 rounded-xl">
              <Eye className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Transparansi</h3>
              <p className="text-slate-300 text-sm">Kami jelas tentang data yang dikumpulkan</p>
            </div>
            <div className="text-center p-6 bg-purple-500/20 rounded-xl">
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Kontrol Anda</h3>
              <p className="text-slate-300 text-sm">Anda memiliki kontrol penuh atas data pribadi</p>
            </div>
          </div>

          <div className="prose prose-invert prose-blue max-w-none text-slate-200">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Informasi yang Kami Kumpulkan</h2>
              <p className="leading-relaxed mb-4">Kami mengumpulkan informasi yang Anda berikan secara langsung dan informasi yang dikumpulkan secara otomatis saat Anda menggunakan layanan kami:</p>

              <h3 className="text-xl font-medium text-blue-300 mb-3">Informasi Pribadi</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Nama lengkap dan username</li>
                <li>Alamat email</li>
                <li>Foto profil (opsional)</li>
                <li>Informasi profil seperti bio dan headline</li>
              </ul>

              <h3 className="text-xl font-medium text-blue-300 mb-3">Data Aktivitas</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Progress pembelajaran dan skor tugas</li>
                <li>Kursus yang diikuti dan diselesaikan</li>
                <li>Aktivitas forum dan diskusi</li>
                <li>Data penggunaan platform dan preferensi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Bagaimana Kami Menggunakan Informasi</h2>
              <p className="leading-relaxed mb-4">Informasi yang dikumpulkan digunakan untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menyediakan dan meningkatkan layanan pembelajaran</li>
                <li>Personalisasi pengalaman belajar Anda</li>
                <li>Mengirim notifikasi dan update penting</li>
                <li>Memberikan dukungan pelanggan</li>
                <li>Menganalisis penggunaan untuk perbaikan platform</li>
                <li>Mencegah penyalahgunaan dan aktivitas penipuan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Berbagi Informasi</h2>
              <p className="leading-relaxed mb-4">Kami tidak menjual data pribadi Anda kepada pihak ketiga. Informasi hanya dibagikan dalam situasi berikut:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Dengan persetujuan Anda:</strong> Ketika Anda secara eksplisit memberikan izin
                </li>
                <li>
                  <strong>Penyedia layanan:</strong> Dengan partner terpercaya yang membantu operasional platform
                </li>
                <li>
                  <strong>Kepatuhan hukum:</strong> Jika diwajibkan oleh hukum atau proses pengadilan
                </li>
                <li>
                  <strong>Keamanan:</strong> Untuk melindungi hak, properti, atau keamanan pengguna
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Keamanan Data</h2>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-4">
                <div className="flex items-center mb-3">
                  <Database className="w-6 h-6 text-blue-400 mr-3" />
                  <h3 className="text-lg font-medium text-white">Perlindungan Teknis</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Enkripsi data menggunakan protokol SSL/TLS</li>
                  <li>Sistem autentikasi berlapis</li>
                  <li>Monitoring keamanan 24/7</li>
                  <li>Backup data reguler</li>
                  <li>Akses terbatas pada data sensitif</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Hak Anda</h2>
              <p className="leading-relaxed mb-4">Anda memiliki hak-hak berikut terkait data pribadi:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-300 mb-2">Akses Data</h4>
                  <p className="text-sm text-slate-300">Meminta salinan data pribadi yang kami simpan</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-300 mb-2">Perbaikan Data</h4>
                  <p className="text-sm text-slate-300">Memperbarui atau memperbaiki informasi yang tidak akurat</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-red-300 mb-2">Penghapusan Data</h4>
                  <p className="text-sm text-slate-300">Meminta penghapusan data dalam kondisi tertentu</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-2">Portabilitas Data</h4>
                  <p className="text-sm text-slate-300">Mendapatkan data dalam format yang dapat dipindahkan</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies dan Teknologi Pelacakan</h2>
              <p className="leading-relaxed mb-4">Kami menggunakan cookies dan teknologi serupa untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mengingat preferensi dan pengaturan Anda</li>
                <li>Menjaga keamanan sesi login</li>
                <li>Menganalisis penggunaan dan performa platform</li>
                <li>Memberikan konten yang relevan</li>
              </ul>
              <p className="leading-relaxed mt-4 text-sm bg-slate-800/50 p-4 rounded-lg">
                <strong>Catatan:</strong> Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur platform mungkin tidak berfungsi optimal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Retensi Data</h2>
              <p className="leading-relaxed">
                Kami menyimpan data pribadi Anda selama akun aktif dan periode yang diperlukan untuk memberikan layanan. Data akan dihapus atau di-anonimkan setelah tidak lagi diperlukan, kecuali jika penyimpanan lebih lama diperlukan untuk
                kepatuhan hukum.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Perubahan Kebijakan</h2>
              <p className="leading-relaxed">Kebijakan privasi ini dapat diperbarui dari waktu ke waktu. Perubahan material akan diberitahukan melalui email atau pemberitahuan di platform setidaknya 30 hari sebelum berlaku efektif.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Hubungi Kami</h2>
              <p className="leading-relaxed mb-4">Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak privasi Anda, silakan hubungi kami:</p>
              <div className="bg-blue-500/20 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">Email</h4>
                    <p className="text-slate-200">privacy@ajarin.id</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">Data Protection Officer</h4>
                    <p className="text-slate-200">dpo@ajarin.id</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">Alamat</h4>
                    <p className="text-slate-200">Jakarta, Indonesia</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">Respon Time</h4>
                    <p className="text-slate-200">Maksimal 7 hari kerja</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
