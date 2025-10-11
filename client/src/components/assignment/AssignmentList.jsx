import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Clock, MoreVertical, Edit, Trash2, Eye, Users, CheckCircle, PlayCircle, PauseCircle, AlertTriangle } from "lucide-react";
import useAssignmentStore from "@/store/assignmentStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export function AssignmentList({ courseId, onCreateAssignment, onEditAssignment, userRole = "student" }) {
  const { assignments, loading, fetchCourseAssignments, deleteAssignment, updateAssignment } = useAssignmentStore();
  const navigate = useNavigate();

  // Add error state
  const [renderError, setRenderError] = useState(null);

  // Debugging info - only log when assignments actually change
  useEffect(() => {
    if (assignments.length > 0) {
      console.log("AssignmentList data updated:", {
        courseId,
        assignmentsCount: assignments.length,
        loading,
      });
    }
  }, [assignments.length, courseId, loading]); // Only trigger when length changes, not on every assignment update
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assignment: null });
  const [publishDialog, setPublishDialog] = useState({ open: false, assignment: null });

  // Fetch assignments if not already fetched by parent component
  useEffect(() => {
    if (courseId && assignments.length === 0 && !loading) {
      console.log("Fetching assignments for course:", courseId);
      fetchCourseAssignments(courseId)
        .then((result) => {
          console.log("Fetch assignments result:", result);
        })
        .catch((error) => {
          console.error("Error fetching assignments:", error);
        });
    }
  }, [courseId]); // Remove fetchCourseAssignments from dependencies to prevent infinite loop

  const handleDeleteAssignment = async () => {
    if (!deleteDialog.assignment) return;

    try {
      const result = await deleteAssignment(deleteDialog.assignment._id);

      if (result.success) {
        // Refresh assignments list
        await fetchCourseAssignments(courseId);
        toast.success("Assignment berhasil dihapus");
      }

      setDeleteDialog({ open: false, assignment: null });
    } catch (error) {
      console.error("Error in handleDeleteAssignment:", error);
      toast.error("Gagal menghapus assignment");
    }
  };

  const handleTogglePublish = async (assignment) => {
    if (!assignment || !assignment._id) {
      toast.error("Assignment tidak valid");
      return;
    }

    try {
      const updatedData = {
        is_published: !assignment.is_published,
        publish_date: !assignment.is_published ? new Date().toISOString() : null,
      };

      console.log("Updating assignment publish status:", {
        assignmentId: assignment._id,
        currentStatus: assignment.is_published,
        newStatus: updatedData.is_published,
        updatedData,
      });

      const result = await updateAssignment(assignment._id, updatedData);

      console.log("Update result:", result);

      if (result && result.success) {
        // Refresh assignments list to ensure we have the latest data
        await fetchCourseAssignments(courseId);
        toast.success(assignment.is_published ? "Assignment berhasil disembunyikan" : "Assignment berhasil dipublikasi");
      } else {
        toast.error("Update assignment gagal");
      }

      setPublishDialog({ open: false, assignment: null });
    } catch (error) {
      console.error("Error in handleTogglePublish:", error);
      toast.error("Gagal mengubah status publikasi: " + (error.message || "Unknown error"));
    }
  };

  const getAssignmentStatus = (assignment) => {
    if (!assignment.is_published) {
      return { label: "Draft", color: "bg-gray-500", icon: PauseCircle };
    }

    return { label: "Aktif", color: "bg-green-500", icon: CheckCircle };
  };

  const getSubmissionTypeLabel = (type) => {
    switch (type) {
      case "file_upload":
        return "File Upload";
      case "text_submission":
        return "Text Submission";
      case "both":
        return "File & Text";
      default:
        return "Unknown";
    }
  };

  const getFileTypesDisplay = (fileTypes) => {
    if (!fileTypes || fileTypes.length === 0) return "-";
    return fileTypes.slice(0, 3).join(", ") + (fileTypes.length > 3 ? "..." : "");
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/dashboard/courses/${courseId}/assignments/${assignmentId}`);
  };

  // Handle render errors
  if (renderError) {
    return (
      <Card className="bg-slate-800 border-red-500/50">
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Assignments</h3>
          <p className="text-slate-400 mb-4">{renderError.message}</p>
          <Button
            onClick={() => {
              setRenderError(null);
              fetchCourseAssignments(courseId);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Belum Ada Assignment</h3>
          <p className="text-slate-400 mb-6">{userRole === "mentor" ? "Mulai buat assignment pertama untuk siswa Anda" : "Belum ada tugas yang tersedia untuk course ini"}</p>
          {userRole === "mentor" && onCreateAssignment && (
            <Button onClick={onCreateAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="w-4 h-4 mr-2" />
              Buat Assignment Pertama
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  try {
    return (
      <>
        <div className="space-y-4">
          {assignments
            ?.filter((assignment) => assignment && assignment._id)
            .map((assignment) => {
              try {
                const status = getAssignmentStatus(assignment);
                const StatusIcon = status?.icon || CheckCircle;

                return (
                  <Card key={assignment._id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg font-semibold text-white">{assignment.title}</CardTitle>
                            <Badge className={`${status.color} text-white text-xs px-2 py-1`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-300 line-clamp-2">{assignment.description}</p>

                          {/* Question File Indicator */}
                          {assignment.question_file && assignment.question_file.url && (
                            <div className="mt-2">
                              <a href={assignment.question_file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-2 py-1 rounded">
                                <FileText className="w-3 h-3" />
                                File Soal: {assignment.question_file.file_name}
                              </a>
                            </div>
                          )}
                        </div>

                        {userRole === "mentor" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem onClick={() => onEditAssignment && onEditAssignment(assignment)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPublishDialog({ open: true, assignment })} className="text-slate-300 hover:text-white hover:bg-slate-700">
                                {assignment.is_published ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                                {assignment.is_published ? "Sembunyikan" : "Publikasikan"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, assignment })} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-slate-400">Tipe</p>
                            <p className="text-white font-medium">{getSubmissionTypeLabel(assignment.assignment_type)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-slate-400">Nilai Maks</p>
                            <p className="text-white font-medium">{assignment.max_points} poin</p>
                          </div>
                        </div>
                      </div>

                      {(assignment.assignment_type === "file_upload" || assignment.assignment_type === "both") && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-400 mb-1">File Types: {getFileTypesDisplay(assignment.allowed_file_types)}</p>
                          <p className="text-xs text-slate-400">Max Size: {Math.round(assignment.max_file_size / (1024 * 1024))} MB</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>
                            Max {assignment.max_attempts} attempt{assignment.max_attempts > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {userRole === "student" && assignment.is_published && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleViewAssignment(assignment._id)}>
                              <FileText className="w-4 h-4 mr-1" />
                              Kerjakan
                            </Button>
                          )}

                          {userRole === "mentor" && (
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <Users className="w-4 h-4 mr-1" />
                              Lihat Submissions
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } catch (mapError) {
                console.error("Error rendering assignment:", assignment._id, mapError);
                return (
                  <Card key={assignment._id || Math.random()} className="bg-slate-800 border-red-500/50">
                    <CardContent className="text-center py-8">
                      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-400 text-sm">Error loading assignment: {assignment?.title || "Unknown"}</p>
                    </CardContent>
                  </Card>
                );
              }
            })}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, assignment: null })}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Hapus Assignment
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Apakah Anda yakin ingin menghapus assignment "{deleteDialog.assignment?.title}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua submission yang terkait.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, assignment: null })} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Batal
              </Button>
              <Button onClick={handleDeleteAssignment} className="bg-red-600 hover:bg-red-700 text-white">
                Ya, Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Confirmation Dialog */}
        <Dialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog({ open, assignment: null })}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {publishDialog.assignment?.is_published ? <PauseCircle className="w-5 h-5 text-yellow-400" /> : <PlayCircle className="w-5 h-5 text-green-400" />}
                {publishDialog.assignment?.is_published ? "Sembunyikan Assignment" : "Publikasikan Assignment"}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {publishDialog.assignment?.is_published
                  ? `Assignment "${publishDialog.assignment?.title}" akan disembunyikan dari siswa. Mereka tidak akan bisa mengakses atau submit assignment ini.`
                  : `Assignment "${publishDialog.assignment?.title}" akan dipublikasikan dan terlihat oleh siswa. Mereka akan bisa mengakses dan submit assignment ini.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialog({ open: false, assignment: null })} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Batal
              </Button>
              <Button onClick={() => handleTogglePublish(publishDialog.assignment)} className={publishDialog.assignment?.is_published ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
                {publishDialog.assignment?.is_published ? "Ya, Sembunyikan" : "Ya, Publikasikan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  } catch (error) {
    console.error("Error rendering AssignmentList:", error);
    setRenderError(error);
    return (
      <Card className="bg-slate-800 border-red-500/50">
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Render Error</h3>
          <p className="text-slate-400 mb-4">Something went wrong while rendering assignments</p>
        </CardContent>
      </Card>
    );
  }
}
