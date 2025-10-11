import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  Timer,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  GripVertical,
  Play,
  Download,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Hash,
  HardDrive,
  Lock,
  CheckCircle,
  Circle,
} from "lucide-react";
import { tokenManager } from "@/lib/cookieAuth";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return null;

  // Handle both number and string values
  const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!numBytes || numBytes === 0) return null;

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const MATERIAL_TYPE_CONFIG = {
  document: {
    icon: FileText,
    label: "Dokumen",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  image: {
    icon: Image,
    label: "Gambar",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  video: {
    icon: Video,
    label: "Video",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  link: {
    icon: LinkIcon,
    label: "Link",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  quiz: {
    icon: FileText,
    label: "Quiz",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  assignment: {
    icon: FileText,
    label: "Tugas",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
};

export function MaterialList({ materials, loading, onEdit, onDelete, onView, showActions = true, isDraggable = false, onReorder, groupByChapter = true, showReorderControls = false, materialProgress = [], sequentialLearning = false }) {
  console.log("MaterialList rendered with:", {
    materialsCount: materials.length,
    progressCount: materialProgress.length,
    sequentialLearning,
    progressData: materialProgress.map((p) => ({ material_id: p.material_id, is_completed: p.is_completed })),
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);
  const [tempPosition, setTempPosition] = useState("");

  const handleDownload = async (material) => {
    if (material && material._id) {
      try {
        const token = tokenManager.getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/materials/${material._id}/download`, {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Get filename from Content-Disposition header
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = material.file_info?.file_name || material.title || "download";

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "");
            }
          }

          // Create blob and download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          console.error("Download failed:", response.statusText);
        }
      } catch (error) {
        console.error("Download error:", error);
      }
    }
  };

  // Group materials by chapter
  const groupedMaterials = groupByChapter
    ? materials.reduce((groups, material) => {
        const chapter = material.chapter || "Tanpa Chapter";
        if (!groups[chapter]) {
          groups[chapter] = [];
        }
        groups[chapter].push(material);
        return groups;
      }, {})
    : { "Semua Materi": materials };

  const handleDragStart = (e, material) => {
    if (!isDraggable) return;
    setDraggedItem(material);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", material._id);

    // Add visual feedback
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    if (!isDraggable) return;
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.currentTarget.style.borderColor = "#3b82f6";
    e.currentTarget.style.borderWidth = "2px";
  };

  const handleDragLeave = (e) => {
    if (!isDraggable) return;
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.borderWidth = "";
  };

  const handleDrop = (e, targetMaterial) => {
    if (!isDraggable || !draggedItem) return;
    e.preventDefault();

    // Reset visual feedback
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.borderWidth = "";

    if (draggedItem._id === targetMaterial._id) return;

    if (onReorder) {
      const draggedIndex = materials.findIndex((m) => m._id === draggedItem._id);
      const targetIndex = materials.findIndex((m) => m._id === targetMaterial._id);

      console.log("Drag & Drop:", { draggedIndex, targetIndex, draggedItem: draggedItem.title, target: targetMaterial.title });
      onReorder(draggedIndex, targetIndex);
    }

    setDraggedItem(null);
  };

  // Reorder helper functions
  const handleMoveUp = (material) => {
    const currentIndex = materials.findIndex((m) => m._id === material._id);
    if (currentIndex > 0) {
      onReorder?.(currentIndex, currentIndex - 1);
    }
  };

  const handleMoveDown = (material) => {
    const currentIndex = materials.findIndex((m) => m._id === material._id);
    if (currentIndex < materials.length - 1) {
      onReorder?.(currentIndex, currentIndex + 1);
    }
  };

  const handleMoveToTop = (material) => {
    const currentIndex = materials.findIndex((m) => m._id === material._id);
    if (currentIndex > 0) {
      onReorder?.(currentIndex, 0);
    }
  };

  const handleMoveToBottom = (material) => {
    const currentIndex = materials.findIndex((m) => m._id === material._id);
    if (currentIndex < materials.length - 1) {
      onReorder?.(currentIndex, materials.length - 1);
    }
  };

  const handlePositionChange = (material, newPosition) => {
    const position = parseInt(newPosition);
    if (position >= 1 && position <= materials.length) {
      const currentIndex = materials.findIndex((m) => m._id === material._id);
      const targetIndex = position - 1;
      if (currentIndex !== targetIndex) {
        onReorder?.(currentIndex, targetIndex);
      }
    }
    setEditingPosition(null);
    setTempPosition("");
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs > 0) {
      return `${hrs}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const getContentPreview = (material) => {
    if (material.type === "video" && material.content_url) {
      // Extract video thumbnail for YouTube
      const youtubeMatch = material.content_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
      }
    }

    if (material.type === "image" && material.file_info?.url) {
      return material.file_info.url;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!materials?.length) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Belum Ada Materi</h3>
          <p className="text-slate-400">Mulai buat materi pembelajaran untuk course Anda</p>
        </CardContent>
      </Card>
    );
  }

  const renderMaterialCard = (material, index, globalIndex) => {
    const typeConfig = MATERIAL_TYPE_CONFIG[material.type] || MATERIAL_TYPE_CONFIG.document;
    const IconComponent = typeConfig.icon;
    const contentPreview = getContentPreview(material);
    const duration = formatDuration(material.duration_minutes);

    // Find progress for this material - handle both populated and string IDs
    const progress = materialProgress.find((p) => {
      const progressMaterialId = typeof p.material_id === "object" ? p.material_id._id : p.material_id;
      return progressMaterialId === material._id;
    });
    const isCompleted = progress?.is_completed || false;

    // Sequential learning logic
    let isUnlocked = true;
    if (sequentialLearning && globalIndex > 0) {
      // Check if previous material is completed
      const prevMaterial = materials[globalIndex - 1];
      const prevProgress = materialProgress.find((p) => {
        const progressMaterialId = typeof p.material_id === "object" ? p.material_id._id : p.material_id;
        return progressMaterialId === prevMaterial?._id;
      });
      isUnlocked = prevProgress?.is_completed || false;

      console.log(`🔐 Material "${material.title}" (index ${globalIndex}):`, {
        isCompleted,
        isUnlocked,
        shouldBeLocked: !isUnlocked,
        prevMaterialTitle: prevMaterial?.title,
        prevMaterialCompleted: prevProgress?.is_completed,
        prevMaterialId: prevMaterial?._id,
        materialId: material._id,
        progressFound: !!progress,
        prevProgressFound: !!prevProgress,
      });

      // Additional logging for debugging
      if (!isUnlocked) {
        console.log(`🚫 Material "${material.title}" should be LOCKED because previous material "${prevMaterial?.title}" is not completed`);
      } else if (globalIndex > 0) {
        console.log(`✅ Material "${material.title}" is UNLOCKED because previous material "${prevMaterial?.title}" is completed`);
      }
    }

    return (
      <Card
        key={material._id}
        className={`bg-slate-800 border-slate-700 transition-all duration-300 ${isDraggable ? "cursor-move" : ""} ${draggedItem?._id === material._id ? "opacity-50 scale-95" : ""} ${
          !isUnlocked ? "opacity-40 grayscale cursor-not-allowed border-slate-600/50" : "hover:border-slate-600 cursor-pointer"
        } ${isCompleted ? "border-green-500/30 bg-green-900/10" : ""}`}
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, material)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, material)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            {isDraggable && (
              <div className="flex items-center justify-center w-6 h-16 text-slate-500 hover:text-slate-400 transition-colors">
                <GripVertical className="w-4 h-4" />
              </div>
            )}

            {/* Material Preview */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
              {contentPreview ? (
                <img src={contentPreview} alt={material.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            {/* Material Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div
                    className={`flex items-center gap-2 transition-colors group ${isUnlocked ? "cursor-pointer hover:text-blue-400" : "cursor-not-allowed"}`}
                    onClick={() => isUnlocked && onView?.(material)}
                    title={isUnlocked ? "Klik untuk membuka materi" : "Selesaikan materi sebelumnya terlebih dahulu"}
                  >
                    <h3 className={`font-semibold mb-1 truncate ${isUnlocked ? "text-white group-hover:text-blue-400" : "text-slate-500"}`}>{material.title}</h3>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-400" title="Selesai" />}
                      {!isUnlocked && <Lock className="w-4 h-4 text-slate-500" title="Terkunci" />}
                      {isUnlocked && !isCompleted && <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />}
                    </div>
                  </div>

                  {material.description && <p className="text-sm text-slate-400 mb-2 line-clamp-2">{material.description}</p>}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${typeConfig.color}`}>{typeConfig.label}</Badge>

                    {duration && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Timer className="w-3 h-3" />
                        {duration}
                      </div>
                    )}

                    {/* File Size for documents and images */}
                    {(material.type === "document" || material.type === "image") && (material.file_info?.file_size || material.file_info?.bytes) && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(material.file_info.bytes || material.file_info.file_size)}
                      </div>
                    )}

                    <div className="text-xs text-slate-500">#{globalIndex + 1}</div>
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center gap-2">
                    {/* Reorder Controls */}
                    {showReorderControls && (
                      <div className="flex items-center gap-1 mr-2">
                        {/* Position Input */}
                        <div className="flex items-center gap-1">
                          {editingPosition === material._id ? (
                            <Input
                              value={tempPosition}
                              onChange={(e) => setTempPosition(e.target.value)}
                              onBlur={() => handlePositionChange(material, tempPosition)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handlePositionChange(material, tempPosition);
                                }
                              }}
                              className="w-12 h-6 px-1 text-xs bg-slate-700 border-slate-600"
                              autoFocus
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPosition(material._id);
                                setTempPosition((globalIndex + 1).toString());
                              }}
                              className="text-slate-400 hover:text-white p-1 h-6 w-8 text-xs"
                              title="Edit position"
                            >
                              <Hash className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Up/Down Buttons */}
                        <div className="flex flex-col gap-0">
                          <Button variant="ghost" size="sm" onClick={() => handleMoveUp(material)} disabled={globalIndex === 0} className="text-slate-400 hover:text-white p-0.5 h-4 w-6" title="Move up">
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleMoveDown(material)} disabled={globalIndex === materials.length - 1} className="text-slate-400 hover:text-white p-0.5 h-4 w-6" title="Move down">
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <Button variant="ghost" size="sm" onClick={() => onView?.(material)} className="text-slate-400 hover:text-white p-2" title="Lihat materi">
                      {material.type === "video" ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>

                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => onView?.(material)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Materi
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit?.(material)} className="text-white hover:bg-slate-700 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Materi
                        </DropdownMenuItem>

                        {(material.type === "document" || material.type === "image") && material.file_info?.url && (
                          <DropdownMenuItem onClick={() => handleDownload(material)} className="text-white hover:bg-slate-700 cursor-pointer">
                            <Download className="w-4 h-4 mr-2" />
                            Download File
                          </DropdownMenuItem>
                        )}

                        {/* Quick Reorder Options */}
                        {showReorderControls && (
                          <>
                            <DropdownMenuSeparator className="bg-slate-700" />

                            <DropdownMenuItem onClick={() => handleMoveToTop(material)} disabled={globalIndex === 0} className="text-blue-400 hover:bg-blue-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                              <ArrowUp className="w-4 h-4 mr-2" />
                              Pindah ke Atas
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleMoveToBottom(material)}
                              disabled={globalIndex === materials.length - 1}
                              className="text-blue-400 hover:bg-blue-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-4 h-4 mr-2" />
                              Pindah ke Bawah
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator className="bg-slate-700" />

                        <DropdownMenuItem onClick={() => onDelete?.(material)} className="text-red-400 hover:bg-red-900/20 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Materi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedMaterials).map(([chapterName, chapterMaterials]) => (
        <div key={chapterName} className="space-y-4">
          {/* Chapter Header */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{chapterName}</h3>
                  <p className="text-sm text-slate-400">{chapterMaterials.length} materi dalam chapter ini</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-600/10 text-blue-400 border-blue-600/20">
                {chapterMaterials.length}
              </Badge>
            </div>
          </div>

          {/* Chapter Materials */}
          <div className="space-y-3 ml-4">
            {chapterMaterials.length > 0 ? (
              chapterMaterials.map((material, index) => {
                const globalIndex = materials.findIndex((m) => m._id === material._id);
                return renderMaterialCard(material, index, globalIndex);
              })
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 border-dashed">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Belum ada materi di chapter ini</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
