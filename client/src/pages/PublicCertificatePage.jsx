import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Share2, Download, Copy, CheckCircle, ExternalLink, Printer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import useCertificateStore from "@/store/certificateStore";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PublicCertificatePage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const { currentCertificate, loading, error, fetchPublicCertificate, downloadCertificate, shareCertificate } = useCertificateStore();

  useEffect(() => {
    if (certificateId) {
      fetchPublicCertificate(certificateId);
    }
  }, [certificateId]);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || downloading) return;

    try {
      setDownloading(true);
      toast.loading("Generating PDF...", { id: "pdf-gen" });

      // Call API to increment download count
      await downloadCertificate(certificateId);

      // Generate PDF
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [794, 1123],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 794, 1123);
      pdf.save(`certificate-${currentCertificate?.recipient_name?.replace(/\s+/g, "-")}.pdf`);

      toast.success("PDF downloaded successfully!", { id: "pdf-gen" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: "pdf-gen" });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async (platform) => {
    const result = await shareCertificate(currentCertificate, platform);
    if (result.success && platform === "copy") {
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCertificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="text-center p-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Certificate Not Found</h2>
            <p className="text-slate-400 mb-6">{error || "The certificate you are looking for does not exist or has been revoked."}</p>
            <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-300 hover:text-white">
                ← Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Digital Certificate</h1>
                <p className="text-sm text-slate-400">Ajarin.id Learning Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-300">
                Public Certificate
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Certificate Display */}
          <div className="xl:col-span-3">
            <Card className="bg-white border-slate-200 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <CertificateTemplate certificate={currentCertificate} ref={certificateRef} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificate Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Certificate Information</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Recipient</p>
                    <p className="text-white font-medium">{currentCertificate.recipient_name}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Course</p>
                    <p className="text-white font-medium">{currentCertificate.course_title}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="text-white">{currentCertificate.course_category}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Mentor</p>
                    <p className="text-white">{currentCertificate.mentor_name}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Issued Date</p>
                    <p className="text-white">
                      {new Date(currentCertificate.issued_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Certificate No.</p>
                    <p className="text-white font-mono text-xs">{currentCertificate.certificate_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

                <div className="space-y-3">
                  {/* Print Button */}
                  <Button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Certificate
                  </Button>

                  {/* Download PDF Button */}
                  <Button onClick={handleDownloadPDF} disabled={downloading} className="w-full bg-green-600 hover:bg-green-700">
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  {/* Share Buttons */}
                  <div className="pt-2 border-t border-slate-600">
                    <p className="text-sm text-slate-400 mb-3">Share Certificate</p>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleShare("copy")} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Link
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Share2 className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        LinkedIn
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleShare("twitter")} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Share2 className="w-3 h-3 mr-1" />
                        Twitter
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-300">Verified Certificate</h3>
                </div>

                <p className="text-sm text-green-200 mb-4">This certificate has been verified and is authentic. It was issued by Ajarin.id upon successful completion of the course requirements.</p>

                <div className="text-xs text-green-300 space-y-1">
                  <p>• Course completion: {currentCertificate.completion_percentage}%</p>
                  <p>• Total materials: {currentCertificate.total_materials}</p>
                  <p>• Duration: {currentCertificate.course_duration_hours} hours</p>
                  <p>• Views: {currentCertificate.view_count || 0}</p>
                  <p>• Downloads: {currentCertificate.download_count || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
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
}
