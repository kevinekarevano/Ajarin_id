import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Video, Image, Link as LinkIcon, GripVertical, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
// Using HTML5 drag and drop instead of external library

const MATERIAL_TYPE_CONFIG = {
  document: { icon: FileText, label: "Dokumen", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  image: { icon: Image, label: "Gambar", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  video: { icon: Video, label: "Video", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  link: { icon: LinkIcon, label: "Link", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  quiz: { icon: FileText, label: "Quiz", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  assignment: { icon: FileText, label: "Tugas", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
};

export function BulkReorderDialog({ open, onOpenChange, materials, onReorder, loading = false }) {
  const [reorderedMaterials, setReorderedMaterials] = useState([]);
  const [sortBy, setSortBy] = useState("manual");
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (open && materials) {
      setReorderedMaterials([...materials]);
    }
  }, [open, materials]);

  const handleDragStart = (e, material, index) => {
    setDraggedItem({ material, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.index === targetIndex) return;

    const items = [...reorderedMaterials];
    const [movedItem] = items.splice(draggedItem.index, 1);
    items.splice(targetIndex, 0, movedItem);

    setReorderedMaterials(items);
    setDraggedItem(null);
  };

  const handleSort = (sortType) => {
    let sorted = [...reorderedMaterials];

    switch (sortType) {
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "type":
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "chapter":
        sorted.sort((a, b) => (a.chapter || "").localeCompare(b.chapter || ""));
        break;
      case "created-asc":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "created-desc":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setReorderedMaterials(sorted);
    setSortBy(sortType);
  };

  const handleReset = () => {
    setReorderedMaterials([...materials]);
    setSortBy("manual");
  };

  const handleSave = () => {
    const materialOrders = reorderedMaterials.map((material, index) => ({
      id: material._id,
      order: index + 1,
      chapter: material.chapter || "General",
    }));

    onReorder(materialOrders);
  };

  const moveItem = (fromIndex, toIndex) => {
    const items = [...reorderedMaterials];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    setReorderedMaterials(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700 text-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Bulk Reorder Materials</DialogTitle>
          <DialogDescription className="text-slate-400">Atur ulang urutan semua materi sekaligus dengan drag & drop atau sorting otomatis</DialogDescription>
        </DialogHeader>

        {/* Sort Controls */}
        <div className="flex items-center gap-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Sort by:</label>
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="manual">Manual Order</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="chapter">Chapter</SelectItem>
                <SelectItem value="created-asc">Created (Oldest)</SelectItem>
                <SelectItem value="created-desc">Created (Newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="border-slate-600 text-slate-300">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {reorderedMaterials.map((material, index) => {
              const typeConfig = MATERIAL_TYPE_CONFIG[material.type] || MATERIAL_TYPE_CONFIG.document;
              const IconComponent = typeConfig.icon;

              return (
                <Card
                  key={material._id}
                  className={`bg-slate-800 border-slate-700 cursor-move ${draggedItem?.material._id === material._id ? "opacity-50" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, material, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Drag Handle */}
                      <div className="text-slate-500 hover:text-slate-300 cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Position */}
                      <div className="w-8 text-center">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>

                      {/* Type Icon */}
                      <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-slate-400" />
                      </div>

                      {/* Material Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{material.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${typeConfig.color}`}>{typeConfig.label}</Badge>
                          {material.chapter && (
                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                              {material.chapter}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => moveItem(index, 0)} disabled={index === 0} className="text-slate-400 hover:text-white p-1 h-6 w-6" title="Move to top">
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, reorderedMaterials.length - 1)}
                          disabled={index === reorderedMaterials.length - 1}
                          className="text-slate-400 hover:text-white p-1 h-6 w-6"
                          title="Move to bottom"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-700 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Saving..." : "Save Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
