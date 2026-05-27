"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
} from "lucide-react";

type EnrollmentStatus = "PENDING" | "ACTIVE" | "REJECTED" | "COMPLETED";

interface Enrollment {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  class: string;
  medium: string;
  course: string;
  status: EnrollmentStatus;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  ACTIVE: {
    label: "Active",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-100",
    text: "text-red-700",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Completed", value: "COMPLETED" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
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

function DetailModal({
  enrollment,
  onClose,
  onStatusUpdate,
}: {
  enrollment: Enrollment;
  onClose: () => void;
  onStatusUpdate: (id: string, status: EnrollmentStatus) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  async function handleAction(status: EnrollmentStatus) {
    setLoading(true);
    try {
      await onStatusUpdate(enrollment.id, status);
      onClose();
    } finally {
      setLoading(false);
      setConfirmReject(false);
    }
  }

  const fields = [
    { label: "Student Name", value: enrollment.studentName },
    { label: "Parent Name", value: enrollment.parentName },
    { label: "Email", value: enrollment.email },
    { label: "Phone", value: enrollment.phone },
    { label: "Class", value: enrollment.class },
    { label: "Medium", value: enrollment.medium },
    { label: "Course", value: enrollment.course },
    { label: "Applied On", value: formatDate(enrollment.createdAt) },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Enrollment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current Status:</span>
            <StatusBadge status={enrollment.status} />
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  {f.label}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {f.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
          {confirmReject ? (
            <>
              <p className="w-full text-sm text-red-600 mb-1">
                Are you sure you want to reject this enrollment?
              </p>
              <button
                onClick={() => setConfirmReject(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("REJECTED")}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition"
              >
                {loading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </>
          ) : (
            <>
              {enrollment.status !== "ACTIVE" &&
                enrollment.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleAction("ACTIVE")}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
              {enrollment.status !== "REJECTED" &&
                enrollment.status !== "COMPLETED" && (
                  <button
                    onClick={() => setConfirmReject(true)}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-60 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
              {enrollment.status === "ACTIVE" && (
                <button
                  onClick={() => handleAction("COMPLETED")}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Mark Complete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      const res = await fetch("/api/enrollments");
      const data = await res.json();
      setEnrollments(data.enrollments || []);
    } catch {
      setToast({ message: "Failed to load enrollments", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  async function updateStatus(id: string, status: EnrollmentStatus) {
    const res = await fetch(`/api/enrollments?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    await fetchEnrollments();
    setToast({
      message: `Enrollment ${status.toLowerCase()} successfully`,
      type: "success",
    });
  }

  const filtered = enrollments.filter((e) => {
    const matchesFilter =
      activeFilter === "ALL" || e.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.studentName.toLowerCase().includes(q) ||
      e.course.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab.value] =
      tab.value === "ALL"
        ? enrollments.length
        : enrollments.filter((e) => e.status === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Enrollment Requests
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {enrollments.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
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
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            Loading enrollments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400 gap-2">
            <Clock className="w-8 h-8 text-gray-300" />
            <p>No enrollment requests found</p>
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
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Course / Class
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.studentName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {enrollment.parentName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {enrollment.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {enrollment.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.course}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {enrollment.class} · {enrollment.medium}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(enrollment.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enrollment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEnrollment(enrollment)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionDropdown(
                                actionDropdown === enrollment.id
                                  ? null
                                  : enrollment.id
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                          >
                            Actions
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {actionDropdown === enrollment.id && (
                            <div
                              className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg z-10 py-1 overflow-hidden"
                              onMouseLeave={() => setActionDropdown(null)}
                            >
                              {enrollment.status !== "ACTIVE" &&
                                enrollment.status !== "COMPLETED" && (
                                  <button
                                    onClick={async () => {
                                      setActionDropdown(null);
                                      try {
                                        await updateStatus(
                                          enrollment.id,
                                          "ACTIVE"
                                        );
                                      } catch {
                                        setToast({
                                          message: "Failed to update status",
                                          type: "error",
                                        });
                                      }
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                  </button>
                                )}
                              {enrollment.status === "ACTIVE" && (
                                <button
                                  onClick={async () => {
                                    setActionDropdown(null);
                                    try {
                                      await updateStatus(
                                        enrollment.id,
                                        "COMPLETED"
                                      );
                                    } catch {
                                      setToast({
                                        message: "Failed to update status",
                                        type: "error",
                                      });
                                    }
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Mark Complete
                                </button>
                              )}
                              {enrollment.status !== "REJECTED" &&
                                enrollment.status !== "COMPLETED" && (
                                  <button
                                    onClick={async () => {
                                      setActionDropdown(null);
                                      if (
                                        window.confirm(
                                          "Are you sure you want to reject this enrollment?"
                                        )
                                      ) {
                                        try {
                                          await updateStatus(
                                            enrollment.id,
                                            "REJECTED"
                                          );
                                        } catch {
                                          setToast({
                                            message: "Failed to update status",
                                            type: "error",
                                          });
                                        }
                                      }
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedEnrollment && (
        <DetailModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
          onStatusUpdate={async (id, status) => {
            await updateStatus(id, status);
          }}
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
