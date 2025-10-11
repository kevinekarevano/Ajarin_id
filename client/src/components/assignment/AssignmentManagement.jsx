import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Users } from "lucide-react";
import { AssignmentList } from "@/components/assignment/AssignmentList";
import { AssignmentFormDialog } from "@/components/assignment/AssignmentFormDialog";
import { AssignmentGradingDialog } from "@/components/assignment/AssignmentGradingDialog";
import useAssignmentStore from "@/store/assignmentStore";
import toast from "react-hot-toast";

export function AssignmentManagement({ course, userRole = "mentor" }) {
  // Reduced logging to prevent console spam
  // console.log("AssignmentManagement rendered:", { courseId: course?._id });

  const { createAssignment, updateAssignment, loading, fetchCourseAssignments } = useAssignmentStore();
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: "create",
    assignment: null,
  });
  const [gradingDialog, setGradingDialog] = useState({
    open: false,
    assignment: null,
  });

  const handleCreateAssignment = () => {
    setFormDialog({
      open: true,
      mode: "create",
      assignment: null,
    });
  };

  const handleEditAssignment = (assignment) => {
    setFormDialog({
      open: true,
      mode: "edit",
      assignment,
    });
  };

  const handleViewSubmissions = (assignment) => {
    setGradingDialog({
      open: true,
      assignment,
    });
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formDialog.mode === "create") {
        await createAssignment(formData);
        toast.success("Assignment berhasil dibuat");
      } else {
        await updateAssignment(formDialog.assignment._id, formData);
        toast.success("Assignment berhasil diperbarui");
      }

      // Refresh assignment list after create/update
      if (course?._id) {
        await fetchCourseAssignments(course._id);
      }

      setFormDialog({ open: false, mode: "create", assignment: null });
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  if (!course) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Course Not Found</h3>
          <p className="text-slate-400 mb-4">Please select a valid course to manage assignments.</p>
          <p className="text-xs text-slate-500">This shouldn't happen if you accessed from course management.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Assignment Management</h1>
            <p className="text-slate-400 mt-1">Kelola tugas dan penilaian untuk course "{course.title}"</p>
          </div>
          {userRole === "mentor" && (
            <Button onClick={handleCreateAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Buat Assignment
            </Button>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 bg-slate-800">
            <TabsTrigger value="assignments" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
            {userRole === "mentor" && (
              <TabsTrigger value="submissions" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                All Submissions
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="assignments" className="space-y-4 mt-6">
            <AssignmentList courseId={course._id} onCreateAssignment={handleCreateAssignment} onEditAssignment={handleEditAssignment} onViewSubmissions={handleViewSubmissions} userRole={userRole} />
          </TabsContent>

          {userRole === "mentor" && (
            <TabsContent value="submissions" className="space-y-4 mt-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">Pilih assignment terlebih dahulu untuk melihat submissions</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialogs */}
      <AssignmentFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        onSubmit={handleFormSubmit}
        loading={loading}
        mode={formDialog.mode}
        initialData={formDialog.assignment}
        courseId={course._id}
      />

      <AssignmentGradingDialog open={gradingDialog.open} onOpenChange={(open) => setGradingDialog((prev) => ({ ...prev, open }))} assignment={gradingDialog.assignment} />
    </>
  );
}
