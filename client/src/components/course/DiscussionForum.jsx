import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, Search, Plus, Clock, User, Pin, Lock, CheckCircle, MessageSquare } from "lucide-react";
import useDiscussionStore from "@/store/discussionStore";
import useAuthStore from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

export function DiscussionForum({ courseId }) {
  const { user } = useAuthStore();
  const { discussions, currentDiscussion, replies, loading, error, fetchCourseDiscussions, fetchDiscussion, createDiscussion, createReply, clearCurrentDiscussion } = useDiscussionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    type: "general",
  });

  // Fetch discussions on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourseDiscussions(courseId);
    }
  }, [courseId]);

  // Handle create discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const result = await createDiscussion(courseId, newDiscussion);

      if (result.success) {
        setNewDiscussion({ title: "", content: "", type: "general" });
        setShowCreateDialog(false);
        // Refresh discussions
        await fetchCourseDiscussions(courseId);
      }
    } catch (error) {
      console.error("Error in handleCreateDiscussion:", error);
      toast.error("Failed to create discussion");
    }
  };

  // Handle view discussion
  const handleViewDiscussion = async (discussion) => {
    setSelectedDiscussion(discussion);
    await fetchDiscussion(discussion._id);
  };

  // Handle create reply
  const handleCreateReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Reply content is required");
      return;
    }

    if (!selectedDiscussion) return;

    const result = await createReply(selectedDiscussion._id, {
      content: replyContent,
    });

    if (result.success) {
      setReplyContent("");
      // Refresh discussion to get updated replies
      await fetchDiscussion(selectedDiscussion._id);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchCourseDiscussions(courseId, { search: searchQuery });
    } else {
      fetchCourseDiscussions(courseId);
    }
  };

  // Format date
  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: id,
    });
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    if (!type) return "bg-gray-100 text-gray-800";

    switch (type) {
      case "question":
        return "bg-blue-100 text-blue-800";
      case "announcement":
        return "bg-green-100 text-green-800";
      case "help":
        return "bg-yellow-100 text-yellow-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !discussions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Forum Diskusi</h2>
          <p className="text-slate-400 mt-1">Diskusi dan tanya jawab dengan sesama learner</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Buat Diskusi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <DialogHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-white">Buat Diskusi Baru</DialogTitle>
                  <DialogDescription className="text-slate-400 mt-1">Mulai percakapan menarik dengan sesama learner di course ini</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateDiscussion} className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Judul Diskusi
                </Label>
                <Input
                  id="title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  placeholder="Contoh: Bagaimana cara menggambar karakter anime yang ekspresif?"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 h-12"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-slate-300">
                  Kategori Diskusi
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "general", label: "Umum", icon: "💬", desc: "Diskusi santai & sharing" },
                    { value: "question", label: "Pertanyaan", icon: "❓", desc: "Butuh bantuan & jawaban" },
                  ].map((category) => (
                    <div
                      key={category.value}
                      onClick={() => setNewDiscussion({ ...newDiscussion, type: category.value })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                        newDiscussion.type === category.value ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-slate-600 bg-slate-800 hover:border-slate-500"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="font-medium text-white text-sm">{category.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{category.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Isi Diskusi
                </Label>
                <Textarea
                  id="content"
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  placeholder="Jelaskan topik diskusi Anda dengan detail. Semakin jelas pertanyaan atau topik yang disampaikan, semakin mudah orang lain untuk memberikan respon yang membantu..."
                  rows={5}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>💡 Tips: Gunakan bahasa yang jelas dan sopan</span>
                  <span>{newDiscussion.content.length}/2000</span>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <span>Batal</span>
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !newDiscussion.title.trim() || !newDiscussion.content.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Buat Diskusi
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari diskusi..." className="w-full" />
        </div>
        <Button type="submit" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {/* Discussion List */}
      {!selectedDiscussion ? (
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Belum Ada Diskusi</h3>
                <p className="text-slate-400 mb-4">Jadilah yang pertama memulai diskusi di course ini</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Diskusi Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            discussions
              .filter((discussion) => discussion && discussion._id)
              .map((discussion) => (
                <Card key={discussion._id} className="hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-6" onClick={() => handleViewDiscussion(discussion)}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeBadgeColor(discussion.type || "general")}>{discussion.type === "question" ? "Pertanyaan" : "Umum"}</Badge>
                          {discussion.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                          {discussion.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                          {discussion.is_resolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{discussion.title}</h3>

                        <p className="text-slate-300 mb-3 line-clamp-2">{discussion.content}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {discussion.author_id?.fullname || discussion.author_id?.username || "Unknown User"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {discussion.created_at ? formatDate(discussion.created_at) : "Just now"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {discussion.replies_count || 0} replies
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      ) : (
        /* Discussion Detail View */
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDiscussion(null);
              clearCurrentDiscussion();
            }}
          >
            ← Kembali ke Daftar Diskusi
          </Button>

          {/* Discussion Detail */}
          {currentDiscussion && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getTypeBadgeColor(currentDiscussion.type || "general")}>{currentDiscussion.type === "question" ? "Pertanyaan" : "Umum"}</Badge>
                  {currentDiscussion.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  {currentDiscussion.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                  {currentDiscussion.is_resolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">{currentDiscussion.title}</h1>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {currentDiscussion.author_id?.fullname || currentDiscussion.author_id?.username || "Unknown User"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentDiscussion.created_at ? formatDate(currentDiscussion.created_at) : "Just now"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{currentDiscussion.content}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Balasan ({replies.length})</h3>

            {replies
              .filter((reply) => reply && reply._id)
              .map((reply) => (
                <Card key={reply._id} className="ml-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">{reply.author_id?.fullname || reply.author_id?.username || "Unknown User"}</span>
                          <span className="text-sm text-slate-400">{reply.created_at ? formatDate(reply.created_at) : "Just now"}</span>
                        </div>

                        <p className="text-slate-300 mb-2 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Reply Form */}
          {currentDiscussion && !currentDiscussion.is_locked && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleCreateReply} className="space-y-4">
                  <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Tulis balasan..." rows={3} className="w-full" />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !replyContent.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? "Mengirim..." : "Kirim Balasan"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
