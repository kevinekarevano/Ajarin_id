import React, { forwardRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import QRCode from "qrcode";
import { Award, CheckCircle, Calendar, User, BookOpen, Clock } from "lucide-react";

const CertificateTemplate = forwardRef(({ certificate, showControls = false }, ref) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    if (certificate?.public_url) {
      QRCode.toDataURL(certificate.public_url, {
        width: 120,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [certificate?.public_url]);

  if (!certificate) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-400">Loading certificate...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* Certificate Container */}
      <div
        ref={ref}
        className="w-[794px] h-[1123px] mx-auto relative bg-white shadow-2xl"
        style={{
          width: "794px",
          height: "1123px",
          backgroundColor: "white",
          position: "relative",
          padding: "60px",
          boxSizing: "border-box",
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
              linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)
            `,
          }}
        />

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4 text-left">
              <h1 className="text-2xl font-bold text-slate-800">AJARIN.ID</h1>
              <p className="text-sm text-slate-600">Learning Platform</p>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            GREAT WORK - KEEP LEARNING
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-slate-800 mb-2 tracking-wider">CERTIFICATE</h2>
          <p className="text-lg text-slate-600 font-medium">Sertifikat Ini Dengan Bangga Diberikan Kepada</p>
        </div>

        {/* Recipient Name */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">{certificate.recipient_name}</h3>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
        </div>

        {/* Course Description */}
        <div className="text-center mb-8">
          <p className="text-lg text-slate-700 mb-2">
            yang telah menyelesaikan kelas <strong>{certificate.course_category}</strong> dalam
          </p>
          <p className="text-lg text-slate-700 mb-4">
            program <strong>Kelas Online AJARIN.ID</strong>
          </p>

          <div className="bg-slate-50 rounded-lg p-6 mx-auto max-w-2xl border-l-4 border-blue-500">
            <h4 className="text-2xl font-bold text-slate-800 mb-2">{certificate.course_title}</h4>
            <p className="text-slate-600">Kategori: {certificate.course_category}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">Total Materi</p>
              <p className="text-lg font-bold text-slate-800">{certificate.total_materials}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">Penyelesaian</p>
              <p className="text-lg font-bold text-slate-800">{certificate.completion_percentage}%</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600">Durasi</p>
              <p className="text-lg font-bold text-slate-800">{certificate.course_duration_hours}h</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-12">
          {/* Date and Signature */}
          <div className="text-left">
            <p className="text-lg font-semibold text-slate-800 mb-4">{format(new Date(certificate.issued_date), "dd MMMM yyyy", { locale: id })}</p>

            {/* Signature Line */}
            <div className="w-48 border-b-2 border-slate-300 mb-2" />
            <div>
              <p className="text-sm font-medium text-slate-800">{certificate.mentor_name}</p>
              <p className="text-xs text-slate-600">Mentor</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="w-24 h-24 mx-auto mb-2" />}
            <p className="text-xs text-slate-500 max-w-24">Scan untuk verifikasi</p>
          </div>
        </div>

        {/* Certificate Number */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-slate-500 font-mono">Certificate No: {certificate.certificate_number}</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 border-4 border-blue-200 rounded-full opacity-20" />
        <div className="absolute top-12 right-12 w-12 h-12 border-4 border-purple-200 rounded-full opacity-20" />
        <div className="absolute bottom-16 left-12 w-20 h-20 border-4 border-teal-200 rounded-full opacity-20" />
        <div className="absolute bottom-8 right-8 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30" />
      </div>

      {/* Print/Download Controls */}
      {showControls && (
        <div className="mt-6 text-center space-x-4">
          <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Print Certificate
          </button>
          <button
            onClick={() => {
              // This will be handled by the parent component
              if (window.downloadCertificatePDF) {
                window.downloadCertificatePDF();
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      )}

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
