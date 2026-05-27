"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  ImageIcon,
  Building2,
  Users,
  Calendar,
  Plane,
  PartyPopper,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type GalleryCategory = "BUILDING" | "CLASSROOM" | "EVENTS" | "TRIPS" | "PARTIES";

interface GalleryImage {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  description: string | null;
  date: string;
  createdAt: string;
}

interface PreviewFile {
  file: File;
  previewUrl: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: { id: GalleryCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: "BUILDING",  label: "Building",  icon: Building2,    color: "text-blue-600"   },
  { id: "CLASSROOM", label: "Classroom", icon: Users,        color: "text-green-600"  },
  { id: "EVENTS",    label: "Events",    icon: Calendar,     color: "text-purple-600" },
  { id: "TRIPS",     label: "Trips",     icon: Plane,        color: "text-orange-600" },
  { id: "PARTIES",   label: "Parties",   icon: PartyPopper,  color: "text-pink-600"   },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("BUILDING");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [dragging, setDragging] = useState(false);

  // Feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // image id to confirm delete

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  async function fetchImages(category: GalleryCategory) {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?category=${category}`);
      const data = await res.json();
      if (data.success) setImages(data.gallery);
    } catch {
      showToast("error", "Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchImages(activeCategory);
    // Revoke old preview URLs to avoid memory leaks
    return () => previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // ── Toast helper ─────────────────────────────────────────────────────────

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // ── File selection ────────────────────────────────────────────────────────

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      showToast("error", "Please select image files only (JPG, PNG, WebP, etc.)");
      return;
    }
    const newPreviews: PreviewFile[] = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave() {
    setDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (previews.length === 0) {
      showToast("error", "Please select at least one image to upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      previews.forEach((p) => formData.append("files", p.file));
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", activeCategory);
      formData.append("date", uploadDate);

      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Upload failed");
        return;
      }

      showToast("success", data.message);

      // Clear form
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPreviews([]);
      setTitle("");
      setDescription("");
      setUploadDate(new Date().toISOString().split("T")[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh gallery
      fetchImages(activeCategory);
    } catch {
      showToast("error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        showToast("success", "Image deleted");
      } else {
        showToast("error", data.error || "Delete failed");
      }
    } catch {
      showToast("error", "Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload and manage photos for each category. Images are stored on Cloudinary.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setPreviews([]);
                setTitle("");
                setDescription("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Upload to {activeCat.label}
        </h2>

        {/* Drag & drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            Drag & drop images here, or <span className="text-blue-600">click to browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, HEIC · Multiple files allowed</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={p.previewUrl}
                  alt={`preview ${i}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs mt-1">Add more</span>
            </button>
          </div>
        )}

        {/* Form fields */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Function 2025"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {previews.length > 1 && title && (
              <p className="text-xs text-gray-400 mt-1">Will append 1, 2, 3… for multiple files</p>
            )}
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading || previews.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading {previews.length} image{previews.length > 1 ? "s" : ""}…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {previews.length > 0 ? `${previews.length} ` : ""}
                Image{previews.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
          {previews.length > 0 && (
            <button
              onClick={() => {
                previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                setPreviews([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {previews.length} file{previews.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      </div>

      {/* Existing images grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <activeCat.icon className={`w-4 h-4 ${activeCat.color}`} />
            {activeCat.label} Photos
            {!loading && (
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                {images.length}
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No photos in {activeCat.label} yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload images above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100">
                  {/* Delete button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteConfirm(img.id)}
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Image info */}
                  <div>
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{img.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {new Date(img.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Image?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently remove the image from the gallery. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
