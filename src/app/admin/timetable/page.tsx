"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
  standard: string;
}

interface FacultyUser {
  firstName: string;
  lastName: string;
}

interface Faculty {
  id: string;
  user: FacultyUser;
}

interface FacultyOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface TimetableEntry {
  id: string;
  subject: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  faculty: Faculty;
  batch: { name: string; standard: string };
}

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function to12hr(time: string): string {
  // time is "HH:MM" or "HH:MM:SS"
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ── Empty modal state ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  dayOfWeek: "Monday" as DayOfWeek,
  startTime: "",
  endTime: "",
  subject: "",
  facultyId: "",
  room: "",
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  // Data
  const [batches, setBatches] = useState<Batch[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  // Selection / loading
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Fetch batches on mount ───────────────────────────────────────────────

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/admin/batches");
        const data = await res.json();
        if (data.success) setBatches(data.batches);
      } catch {
        showToast("error", "Failed to load batches");
      } finally {
        setLoadingBatches(false);
      }
    }
    fetchBatches();
  }, []);

  // ── Fetch faculty once ───────────────────────────────────────────────────

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const res = await fetch("/api/auth/register?role=FACULTY");
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setFacultyList(
            data.users.map((u: { id: string; firstName: string; lastName: string }) => ({
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
            }))
          );
        }
      } catch {
        // non-critical, modal will show empty dropdown
      }
    }
    fetchFaculty();
  }, []);

  // ── Fetch timetable when batch changes ──────────────────────────────────

  const fetchTimetable = useCallback(async (batchId: string) => {
    setLoadingTimetable(true);
    try {
      const res = await fetch(`/api/timetable?batchId=${batchId}`);
      const data = await res.json();
      if (data.success) setTimetable(data.timetable ?? []);
      else showToast("error", data.error || "Failed to load timetable");
    } catch {
      showToast("error", "Failed to load timetable");
    } finally {
      setLoadingTimetable(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBatchId) fetchTimetable(selectedBatchId);
    else setTimetable([]);
  }, [selectedBatchId, fetchTimetable]);

  // ── Modal helpers ────────────────────────────────────────────────────────

  function openAddModal() {
    setEditEntry(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEditModal(entry: TimetableEntry) {
    setEditEntry(entry);
    setForm({
      dayOfWeek: entry.dayOfWeek as DayOfWeek,
      startTime: entry.startTime.slice(0, 5), // "HH:MM"
      endTime: entry.endTime.slice(0, 5),
      subject: entry.subject,
      facultyId: entry.faculty?.id ?? "",
      room: entry.room ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditEntry(null);
    setForm({ ...EMPTY_FORM });
  }

  // ── Save (add / edit) ───────────────────────────────────────────────────

  async function handleSave() {
    if (!form.dayOfWeek || !form.startTime || !form.endTime || !form.subject || !form.facultyId) {
      showToast("error", "Please fill in all required fields");
      return;
    }
    if (form.startTime >= form.endTime) {
      showToast("error", "End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editEntry;
      const body = isEdit
        ? { id: editEntry!.id, ...form }
        : { batchId: selectedBatchId, ...form };

      const res = await fetch("/api/timetable", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to save period");
        return;
      }
      showToast("success", isEdit ? "Period updated" : "Period added");
      closeModal();
      fetchTimetable(selectedBatchId);
    } catch {
      showToast("error", "Failed to save period");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to delete period");
        return;
      }
      showToast("success", "Period deleted");
      setTimetable((prev) => prev.filter((e) => e.id !== id));
    } catch {
      showToast("error", "Failed to delete period");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  // ── Group by day ─────────────────────────────────────────────────────────

  const byDay: Record<DayOfWeek, TimetableEntry[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  timetable.forEach((e) => {
    const d = e.dayOfWeek as DayOfWeek;
    if (byDay[d]) byDay[d].push(e);
  });
  DAYS.forEach((d) => byDay[d].sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create and manage the weekly class schedule for each batch.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
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

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Select Batch
        </label>
        {loadingBatches ? (
          <div className="h-9 w-48 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">-- Choose a batch --</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.standard} — {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Empty state: no batch selected */}
      {!selectedBatchId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-700 font-medium text-base">Select a batch to view/edit its timetable</p>
          <p className="text-gray-400 text-sm mt-1">
            Choose a batch from the dropdown above to get started.
          </p>
        </div>
      )}

      {/* Weekly grid */}
      {selectedBatchId && (
        <div className="space-y-4">
          {/* Batch title + add button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Weekly Schedule
                {selectedBatch && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    — {selectedBatch.standard} · {selectedBatch.name}
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>

          {/* Grid */}
          {loadingTimetable ? (
            <div className="grid grid-cols-6 gap-3">
              {DAYS.map((d) => (
                <div key={d} className="space-y-2">
                  <div className="h-9 bg-blue-100 animate-pulse rounded-lg" />
                  <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                  <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3 min-w-0">
              {DAYS.map((day) => {
                const entries = byDay[day];
                return (
                  <div key={day} className="flex flex-col gap-2 min-w-0">
                    {/* Day header */}
                    <div className="bg-blue-600 text-white text-center text-xs font-semibold py-2 px-1 rounded-lg tracking-wide">
                      <span className="hidden lg:inline">{day}</span>
                      <span className="lg:hidden">{DAY_SHORT[day]}</span>
                    </div>

                    {/* Period cards */}
                    {entries.length === 0 ? (
                      <button
                        onClick={openAddModal}
                        className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-xs gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    ) : (
                      entries.map((entry) => (
                        <PeriodCard
                          key={entry.id}
                          entry={entry}
                          onEdit={() => openEditModal(entry)}
                          onDelete={() => setDeleteId(entry.id)}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editEntry ? "Edit Period" : "Add Period"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Day of Week */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Day of Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start / End time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.facultyId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, facultyId: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.firstName} {f.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Room{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, room: e.target.value }))
                  }
                  placeholder="e.g. Room 101"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editEntry ? "Update" : "Add Period"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Period?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently remove this period from the timetable.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PeriodCard ──────────────────────────────────────────────────────────────

function PeriodCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: TimetableEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const facultyName = entry.faculty?.user
    ? `${entry.faculty.user.firstName} ${entry.faculty.user.lastName}`
    : "—";

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      {/* Action buttons on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md flex items-center justify-center transition-colors"
          title="Edit"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-md flex items-center justify-center transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1 text-blue-600 mb-1.5">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs font-medium">
          {to12hr(entry.startTime)} – {to12hr(entry.endTime)}
        </span>
      </div>

      {/* Subject */}
      <p className="text-xs font-semibold text-gray-900 leading-snug mb-1 pr-12">
        {entry.subject}
      </p>

      {/* Faculty */}
      <p className="text-xs text-gray-500 leading-tight truncate">{facultyName}</p>

      {/* Room badge */}
      {entry.room && (
        <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
          {entry.room}
        </span>
      )}
    </div>
  );
}
