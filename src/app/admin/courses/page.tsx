"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle,
  XCircle,
  X,
  Tag,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  subjects: string; // JSON string
  targetClass: string;
  fee: number;
  duration: string;
  features: string; // JSON string
  isActive: boolean;
  createdAt: string;
}

interface ParsedCourse extends Course {
  subjectsList: string[];
  featuresList: string[];
}

function parseCourse(c: Course): ParsedCourse {
  let subjectsList: string[] = [];
  let featuresList: string[] = [];
  try {
    subjectsList = JSON.parse(c.subjects);
  } catch {
    subjectsList = c.subjects
      ? c.subjects.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  }
  try {
    featuresList = JSON.parse(c.features);
  } catch {
    featuresList = c.features
      ? c.features.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  }
  return { ...c, subjectsList, featuresList };
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface CourseFormData {
  name: string;
  description: string;
  targetClass: string;
  fee: string;
  duration: string;
  subjects: string;
  features: string;
  isActive: boolean;
}

const EMPTY_FORM: CourseFormData = {
  name: "",
  description: "",
  targetClass: "",
  fee: "",
  duration: "",
  subjects: "",
  features: "",
  isActive: true,
};

function courseToForm(c: ParsedCourse): CourseFormData {
  return {
    name: c.name,
    description: c.description,
    targetClass: c.targetClass,
    fee: String(c.fee),
    duration: c.duration,
    subjects: c.subjectsList.join(", "),
    features: c.featuresList.join(", "),
    isActive: c.isActive,
  };
}

interface CourseModalProps {
  course: ParsedCourse | null;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

function CourseModal({ course, onClose, onSuccess, onToast }: CourseModalProps) {
  const isEdit = course !== null;
  const [form, setForm] = useState<CourseFormData>(
    isEdit ? courseToForm(course) : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  function validate(): boolean {
    const e: Partial<Record<keyof CourseFormData, string>> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.targetClass.trim()) e.targetClass = "Required";
    if (!form.fee || isNaN(Number(form.fee))) e.fee = "Valid fee required";
    if (!form.duration.trim()) e.duration = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      targetClass: form.targetClass.trim(),
      fee: Number(form.fee),
      duration: form.duration.trim(),
      subjects: JSON.stringify(
        form.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      features: JSON.stringify(
        form.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      isActive: form.isActive,
    };

    try {
      const url = isEdit
        ? `/api/courses?id=${course.id}`
        : "/api/courses";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save course");
      }
      onToast(
        isEdit ? "Course updated successfully" : "Course created successfully",
        "success"
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      onToast(
        err instanceof Error ? err.message : "Failed to save course",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function textInput(
    id: keyof CourseFormData,
    label: string,
    type: string = "text",
    required: boolean = false,
    placeholder?: string
  ) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[id] as string}
          placeholder={placeholder}
          onChange={(e) =>
            setForm((f) => ({ ...f, [id]: e.target.value }))
          }
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[id] ? "border-red-300 bg-red-50" : "border-gray-200"
          }`}
        />
        {errors[id] && (
          <p className="text-xs text-red-500 mt-0.5">{errors[id]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Course" : "Add New Course"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5 flex-1 space-y-4"
        >
          {textInput("name", "Course Name", "text", true, "e.g. Foundation Batch")}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {textInput("targetClass", "Target Class", "text", true, "e.g. Class 9-10")}
            {textInput("duration", "Duration", "text", true, "e.g. 1 year")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fee */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fee (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.fee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fee: e.target.value }))
                  }
                  className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fee ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.fee && (
                <p className="text-xs text-red-500 mt-0.5">{errors.fee}</p>
              )}
            </div>

            {/* Status toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, isActive: !f.isActive }))
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition w-full ${
                  form.isActive
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full ${
                    form.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          {textInput(
            "subjects",
            "Subjects (comma-separated)",
            "text",
            false,
            "e.g. Mathematics, Physics, Chemistry"
          )}
          {textInput(
            "features",
            "Key Features (comma-separated)",
            "text",
            false,
            "e.g. Daily tests, Doubt sessions"
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition font-medium"
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  courseName,
  onConfirm,
  onClose,
  loading,
}: {
  courseName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Delete Course
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-1">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{courseName}</span>?
        </p>
        <p className="text-xs text-red-600 mb-6">
          This will permanently delete the course and all related data.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition font-medium"
          >
            {loading ? "Deleting..." : "Delete Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  course: ParsedCourse;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
      {/* Blue top border */}
      <div className="h-0.5 bg-blue-600" />

      <div className="p-5 flex flex-col flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              {course.name}
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
              {course.targetClass}
            </span>
          </div>
          {/* Active toggle */}
          <button
            onClick={onToggleActive}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition ${
              course.isActive
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {course.isActive ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {course.description}
        </p>

        {/* Fee */}
        <p className="text-sm font-semibold text-gray-900 mb-3">
          ₹{course.fee.toLocaleString("en-IN")}{" "}
          <span className="text-xs font-normal text-gray-400">
            per {course.duration}
          </span>
        </p>

        {/* Subjects */}
        {course.subjectsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.subjectsList.slice(0, 4).map((subj) => (
              <span
                key={subj}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-2.5 h-2.5" />
                {subj}
              </span>
            ))}
            {course.subjectsList.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">
                +{course.subjectsList.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<ParsedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<ParsedCourse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ParsedCourse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses((data.courses || []).map(parseCourse));
    } catch {
      showToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/courses?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      showToast("Course deleted successfully", "success");
      await fetchCourses();
    } catch {
      showToast("Failed to delete course", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  async function toggleActive(course: ParsedCourse) {
    try {
      const res = await fetch(`/api/courses?id=${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: course.name,
          description: course.description,
          subjects: course.subjects,
          targetClass: course.targetClass,
          fee: course.fee,
          duration: course.duration,
          features: course.features,
          isActive: !course.isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed to update course");
      showToast(
        `Course ${!course.isActive ? "activated" : "deactivated"}`,
        "success"
      );
      await fetchCourses();
    } catch {
      showToast("Failed to update course", "error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {courses.length}
          </span>
        </div>
        <button
          onClick={() => {
            setEditCourse(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-64 bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No courses added yet
          </h3>
          <p className="text-xs text-gray-400 mb-5 max-w-xs">
            Create your first course to start managing enrollments and student learning
          </p>
          <button
            onClick={() => {
              setEditCourse(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => {
                setEditCourse(course);
                setShowModal(true);
              }}
              onDelete={() => setDeleteTarget(course)}
              onToggleActive={() => toggleActive(course)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <CourseModal
          course={editCourse}
          onClose={() => {
            setShowModal(false);
            setEditCourse(null);
          }}
          onSuccess={fetchCourses}
          onToast={showToast}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          courseName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
