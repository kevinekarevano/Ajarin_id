import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, MessageCircle, Users, Calendar, Search, Plus, Eye, MoreVertical, Pin, Lock, CheckCircle, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useDiscussionStore from "@/store/discussionStore";
import useCourseStore from "@/store/courseStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function CourseDiscussionsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { discussions, loading: discussionsLoading, fetchMentorCourseDiscussions, currentDiscussion, replies, fetchDiscussion, createReply, clearCurrentDiscussion } = useDiscussionStore();

  const { getCourseById } = useCourseStore();

  // Load course and discussions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get course details
        const courseData = await getCourseById(courseId);
        setCourse(courseData.course);

        // Verify user is the mentor of this course
        const mentorId = courseData.course.mentor_id?._id || courseData.course.mentor_id;
        if (String(mentorId) !== String(user._id)) {
          console.log("❌ Frontend access check failed:", {
            courseMentorId: courseData.course.mentor_id,
            extractedMentorId: mentorId,
            userId: user._id,
            mentorIdString: String(mentorId),
            userIdString: String(user._id),
            match: String(mentorId) === String(user._id),
          });
          toast.error("Anda tidak memiliki akses ke diskusi kursus ini");
          navigate("/dashboard/manage-courses");
          return;
        }

        console.log("✅ Frontend access check passed");

        // Fetch discussions
        await fetchMentorCourseDiscussions(courseId);
      } catch (error) {
        console.error("Failed to load course discussions:", error);
        toast.error("Gagal memuat diskusi kursus");
        navigate("/dashboard/manage-courses");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) {
      loadData();
    }
  }, [courseId, user, getCourseById, fetchMentorCourseDiscussions, navigate]);

  // Filter discussions
  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) || discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || discussion.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "question":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "general":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const handleViewDiscussion = async (discussion) => {
    try {
      setSelectedDiscussion(discussion);
      setShowDiscussionModal(true);

      // Fetch discussion details and replies
      await fetchDiscussion(discussion._id);
    } catch (error) {
      console.error("Failed to fetch discussion:", error);
      toast.error("Gagal memuat detail diskusi");
    }
  };

  const handleCloseModal = () => {
    setShowDiscussionModal(false);
    setSelectedDiscussion(null);
    setReplyContent("");
    clearCurrentDiscussion();
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Konten balasan tidak boleh kosong");
      return;
    }

    try {
      const result = await createReply(selectedDiscussion._id, { content: replyContent });

      if (result.success) {
        setReplyContent("");
        toast.success("Balasan berhasil ditambahkan");
        // Refresh discussion to get updated replies
        await fetchDiscussion(selectedDiscussion._id);
        // Also refresh the discussions list to update reply count
        await fetchMentorCourseDiscussions(courseId);
      } else {
        toast.error(result.error || "Gagal menambahkan balasan");
      }
    } catch (error) {
      console.error("Failed to create reply:", error);
      toast.error("Gagal menambahkan balasan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/manage-courses")} className="text-slate-300 hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Diskusi Kursus</h1>
            <p className="text-slate-300">{course?.title}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{discussions.length}</p>
                  <p className="text-sm text-slate-400">Total Diskusi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{course?.total_enrollments || 0}</p>
                  <p className="text-sm text-slate-400">Peserta Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{discussions.filter((d) => d.is_resolved).length}</p>
                  <p className="text-sm text-slate-400">Terjawab</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{discussions.filter((d) => new Date(d.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                  <p className="text-sm text-slate-400">Minggu Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Cari diskusi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
              </div>
              <div className="flex gap-2">
                {["all", "general", "question"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={selectedType === type ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                  >
                    {type === "all" ? "Semua" : type === "general" ? "Umum" : "Pertanyaan"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Daftar Diskusi ({filteredDiscussions.length})</span>
              <Button size="sm" onClick={() => navigate(`/dashboard/course-learn/${courseId}?tab=discussion`)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Buat Diskusi
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {discussionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredDiscussions.length > 0 ? (
              <div className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                  <div key={discussion._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeBadgeColor(discussion.type)}>{discussion.type === "question" ? "❓ Pertanyaan" : "💬 Umum"}</Badge>
                          {discussion.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                          {discussion.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                          {discussion.is_resolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>

                        <h3 className="font-semibold text-white mb-1">{discussion.title}</h3>
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">{discussion.content}</p>

                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>oleh {discussion.author_id?.fullname}</span>
                          <span>{format(new Date(discussion.created_at), "dd MMM yyyy, HH:mm")}</span>
                          <span>{discussion.reply_count || 0} balasan</span>
                          <span>{discussion.view_count || 0} views</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDiscussion(discussion)} className="text-slate-400 hover:text-white hover:bg-slate-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-600">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">Pin Diskusi</DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">Tandai Selesai</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700">Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Belum Ada Diskusi</h3>
                <p className="text-slate-400 mb-4">{searchTerm || selectedType !== "all" ? "Tidak ada diskusi yang sesuai dengan pencarian" : "Belum ada siswa yang membuat diskusi di kursus ini"}</p>
                <Button onClick={() => navigate(`/dashboard/course-learn/${courseId}?tab=discussion`)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Diskusi Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discussion Detail Modal */}
        <Dialog open={showDiscussionModal} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-5xl h-[85vh] bg-slate-800 border-slate-700 p-0 gap-0 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-slate-700 flex-shrink-0">
              <DialogTitle className="text-xl font-bold text-white">Detail Diskusi</DialogTitle>
            </DialogHeader>

            {selectedDiscussion ? (
              <div className="flex flex-col h-full">
                {/* Discussion Header - Fixed */}
                <div className="px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-800/90 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`${getTypeBadgeColor(selectedDiscussion.type)} font-medium`}>{selectedDiscussion.type === "question" ? "❓ Pertanyaan" : "💬 Umum"}</Badge>
                    {selectedDiscussion.is_pinned && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        <Pin className="w-3 h-3" />
                        <span>Disematkan</span>
                      </div>
                    )}
                    {selectedDiscussion.is_locked && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </div>
                    )}
                    {selectedDiscussion.is_resolved && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Terjawab</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{selectedDiscussion.title}</h2>

                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="font-medium">{selectedDiscussion.author_id?.fullname}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(selectedDiscussion.created_at), "dd MMM yyyy, HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedDiscussion.view_count || 0} views</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#475569 #1e293b",
                  }}
                >
                  {/* Discussion Content */}
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-700/20 border border-slate-600/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Isi Diskusi</span>
                        </div>
                        <p className="text-slate-100 whitespace-pre-wrap leading-relaxed text-base">{selectedDiscussion.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Replies Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                      <span>Balasan ({replies?.length || 0})</span>
                    </div>

                    {/* Replies List */}
                    {replies && replies.length > 0 ? (
                      <div className="space-y-4">
                        {replies.map((reply, index) => (
                          <div
                            key={reply._id}
                            className="bg-slate-700/20 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/30 hover:border-slate-500/50 transition-all duration-200 transform hover:scale-[1.01]"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.author_id?._id === course?.mentor_id?._id ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-slate-600"}`}>
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{reply.author_id?.fullname}</span>
                                    {reply.author_id?._id === course?.mentor_id?._id && <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 animate-pulse">👨‍🏫 Mentor</Badge>}
                                  </div>
                                  <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: id })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-11">
                              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-700/20 rounded-lg border border-slate-600/50">
                        <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">Belum ada balasan untuk diskusi ini</p>
                        <p className="text-slate-500 text-sm mt-1">Jadilah yang pertama memberikan balasan!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Form - Fixed at bottom */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/90 backdrop-blur-sm flex-shrink-0">
                  <form onSubmit={handleCreateReply} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Tulis balasan Anda sebagai mentor..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="bg-slate-700/80 border-slate-600 text-white placeholder-slate-400 resize-none focus:border-blue-500 focus:ring-blue-500/50 transition-colors"
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">{replyContent.length}/3000 karakter</span>
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg"
                            disabled={!replyContent.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Kirim Balasan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Memuat diskusi...</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
