import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertTriangle, RefreshCw } from "lucide-react";

// Loading skeleton for course cards
export function CourseCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-0">
        <div className="w-full h-48 bg-slate-700 rounded-t-lg animate-pulse" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-700 rounded w-16 animate-pulse" />
            <div className="h-6 bg-slate-700 rounded w-12 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-3 bg-slate-700 rounded animate-pulse" />
            <div className="h-3 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-slate-700 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-slate-700 rounded flex-1 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading grid for multiple course cards
export function CoursesGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Error state component
export function CourseError({ error, onRetry }) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="py-12 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Terjadi Kesalahan</h3>
        <p className="text-slate-400 mb-6">{error || "Gagal memuat data kursus. Silakan coba lagi."}</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Empty state component
export function EmptyCoursesState({ onCreateCourse, title, description }) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="py-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{title || "Belum ada kursus"}</h3>
        <p className="text-slate-400 mb-6">{description || "Mulai berbagi pengetahuan dengan membuat kursus pertama Anda"}</p>
        {onCreateCourse && (
          <Button onClick={onCreateCourse} className="bg-blue-600 hover:bg-blue-700">
            <BookOpen className="w-4 h-4 mr-2" />
            Buat Kursus Baru
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
