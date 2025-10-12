import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Award, Download, Share2, Eye, Calendar, BookOpen, Search, Filter, ExternalLink, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useCertificateStore from "@/store/certificateStore";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function MyCertificatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { certificates, loading, pagination, fetchUserCertificates, shareCertificate, downloadCertificate } = useCertificateStore();

  useEffect(() => {
    fetchUserCertificates({ page: 1, limit: 12 });
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // In a real implementation, you might debounce this
    fetchUserCertificates({
      page: 1,
      limit: 12,
      search: term,
      sortBy,
    });
  };

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
    fetchUserCertificates({
      page: 1,
      limit: 12,
      search: searchTerm,
      sortBy: newSortBy,
    });
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      fetchUserCertificates({
        page: pagination.currentPage + 1,
        limit: 12,
        search: searchTerm,
        sortBy,
      });
    }
  };

  const handleShare = async (certificate, platform) => {
    const result = await shareCertificate(certificate, platform);
    if (result.success) {
      if (platform === "copy") {
        toast.success("Link sertifikat berhasil disalin!");
      }
    }
  };

  const handleDownload = async (certificateId, recipientName) => {
    const result = await downloadCertificate(certificateId);
    if (result.success) {
      toast.success("Sertifikat siap diunduh!");
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) => cert.course_title.toLowerCase().includes(searchTerm.toLowerCase()) || cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) || cert.course_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && certificates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sertifikat Saya</h1>
          <p className="text-slate-400 mt-1">Kumpulan sertifikat digital dari kursus yang telah Anda selesaikan</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">
            <Award className="w-3 h-3 mr-1" />
            {certificates.length} Sertifikat
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Cari sertifikat berdasarkan nama kursus, kategori..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Filter className="w-4 h-4 mr-2" />
                  {sortBy === "newest" ? "Terbaru" : sortBy === "oldest" ? "Terlama" : sortBy === "course-name" ? "Nama Kursus" : "Sort By"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem onClick={() => handleSort("newest")} className="text-slate-300 hover:bg-slate-700">
                  Terbaru
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("oldest")} className="text-slate-300 hover:bg-slate-700">
                  Terlama
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("course-name")} className="text-slate-300 hover:bg-slate-700">
                  Nama Kursus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate._id} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="bg-blue-600 text-white text-xs mb-2">{certificate.course_category}</Badge>
                    <CardTitle className="text-white text-lg leading-tight">{certificate.course_title}</CardTitle>
                  </div>
                  <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Certificate Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(certificate.issued_date), "dd MMM yyyy", { locale: id })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{certificate.total_materials} materi</span>
                  </div>

                  <div className="text-slate-500 text-xs font-mono">{certificate.certificate_number}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => window.open(certificate.public_url, "_blank")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Eye className="w-3 h-3 mr-1" />
                    Lihat
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => handleDownload(certificate.certificate_id, certificate.recipient_name)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Download className="w-3 h-3" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={() => handleShare(certificate, "copy")} className="text-slate-300 hover:bg-slate-700">
                        <Copy className="w-3 h-3 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(certificate, "whatsapp")} className="text-slate-300 hover:bg-slate-700">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(certificate, "linkedin")} className="text-slate-300 hover:bg-slate-700">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(certificate, "twitter")} className="text-slate-300 hover:bg-slate-700">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Twitter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{searchTerm ? "Sertifikat tidak ditemukan" : "Belum ada sertifikat"}</h3>
            <p className="text-slate-400 mb-6">{searchTerm ? "Coba gunakan kata kunci yang berbeda" : "Selesaikan kursus untuk mendapatkan sertifikat digital"}</p>
            {!searchTerm && (
              <Button onClick={() => navigate("/dashboard/browse-courses")} className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Jelajahi Kursus
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {pagination.hasNextPage && (
        <div className="text-center">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            {loading ? "Loading..." : "Load More Certificates"}
          </Button>
        </div>
      )}

      {/* Stats Footer */}
      {certificates.length > 0 && (
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-300">{certificates.length}</div>
                <div className="text-sm text-blue-200">Total Sertifikat</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-blue-300">{new Set(certificates.map((c) => c.course_category)).size}</div>
                <div className="text-sm text-blue-200">Kategori Berbeda</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-blue-300">{certificates.reduce((sum, cert) => sum + (cert.total_materials || 0), 0)}</div>
                <div className="text-sm text-blue-200">Total Materi Diselesaikan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
