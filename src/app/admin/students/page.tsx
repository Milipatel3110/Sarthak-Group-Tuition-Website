"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface StudentProfile {
  class: string;
  medium: string;
  schoolName?: string;
}

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
}

const CLASS_OPTIONS = [
  "Class 9",
  "Class 10",
  "Class 11 Science",
  "Class 11 Commerce",
  "Class 12 Science",
  "Class 12 Commerce",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

function AddStudentModal({ onClose, onSuccess, onToast }: AddStudentModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    class: "",
    medium: "English",
    schoolName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate(): boolean {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.password.trim()) e.password = "Required";
    if (!form.class) e.class = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "STUDENT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      onToast("Student added successfully", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      onToast(
        err instanceof Error ? err.message : "Failed to create student",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type: string = "text",
    required: boolean = false
  ) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[id]
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
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
          <h2 className="text-lg font-semibold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5 space-y-4 flex-1"
        >
          <div className="grid grid-cols-2 gap-4">
            {field("firstName", "First Name", "text", true)}
            {field("lastName", "Last Name", "text", true)}
            {field("email", "Email", "email", true)}
            {field("password", "Password", "password", true)}
            {field("phone", "Phone")}
            {field("dateOfBirth", "Date of Birth", "date")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Class dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={form.class}
                onChange={(e) =>
                  setForm((f) => ({ ...f, class: e.target.value }))
                }
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.class
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <option value="">Select class...</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.class && (
                <p className="text-xs text-red-500 mt-0.5">{errors.class}</p>
              )}
            </div>

            {/* Medium */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Medium
              </label>
              <select
                value={form.medium}
                onChange={(e) =>
                  setForm((f) => ({ ...f, medium: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
              </select>
            </div>
          </div>

          {field("schoolName", "School Name")}
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
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

const FILTER_TABS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?role=STUDENT");
      const data = await res.json();
      setStudents(data.users || []);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  async function toggleActive(student: Student) {
    try {
      const res = await fetch(`/api/admin/users?id=${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !student.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchStudents();
      showToast(
        `Student ${!student.isActive ? "activated" : "deactivated"}`,
        "success"
      );
    } catch {
      showToast("Failed to update student status", "error");
    }
  }

  async function deleteStudent(id: string, name: string) {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete student");
      await fetchStudents();
      showToast("Student deleted successfully", "success");
    } catch {
      showToast("Failed to delete student", "error");
    }
  }

  const filtered = students.filter((s) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "ACTIVE" && s.isActive) ||
      (activeFilter === "INACTIVE" && !s.isActive);
    const q = search.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: students.length,
    ACTIVE: students.filter((s) => s.isActive).length,
    INACTIVE: students.filter((s) => !s.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {students.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeFilter === tab.value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${
                activeFilter === tab.value ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {counts[tab.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                No students registered yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Add your first student to get started
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            No students match your search
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Student
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Class / Medium
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    School
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Joined
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {student.studentProfile?.class || "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.studentProfile?.medium || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.studentProfile?.schoolName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleActive(student)}
                          title={student.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition ${
                            student.isActive
                              ? "hover:bg-amber-50 text-gray-400 hover:text-amber-600"
                              : "hover:bg-green-50 text-gray-400 hover:text-green-600"
                          }`}
                        >
                          {student.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            deleteStudent(
                              student.id,
                              `${student.firstName} ${student.lastName}`
                            )
                          }
                          title="Delete student"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add student modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchStudents}
          onToast={showToast}
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
