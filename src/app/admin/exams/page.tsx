"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Upload,
  Info,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
  standard: string;
}

interface FacultyOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface Exam {
  id: string;
  subject: string;
  examDate: string;
  dayOfWeek: string;
  time: string;
  room: string | null;
  maxMarks: number;
  syllabus: string | null;
  batch: { id: string; name: string; standard: string };
  _count?: { papers: number };
}

interface Paper {
  id: string;
  fileName: string;
  fileUrl: string;
  faculty: { user: { firstName: string; lastName: string } };
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDayFromDate(dateStr: string): string {
  if (!dateStr) return "";
  return DAYS[new Date(dateStr).getDay()] ?? "";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Empty form ──────────────────────────────────────────────────────────────

const EMPTY_EXAM_FORM = {
  subject: "",
  batchId: "",
  examDate: "",
  dayOfWeek: "",
  time: "",
  room: "",
  maxMarks: "100",
  syllabus: "",
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  // Data
  const [batches, setBatches] = useState<Batch[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  // Filters
  const [filterBatchId, setFilterBatchId] = useState("");

  // Loading
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);

  // Create/Edit modal
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({ ...EMPTY_EXAM_FORM });
  const [savingExam, setSavingExam] = useState(false);

  // Papers modal
  const [papersModalExam, setPapersModalExam] = useState<Exam | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [uploadFacultyId, setUploadFacultyId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Toast helper ──────────────────────────────────────────────────────────

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Fetch batches & faculty on mount ──────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const [bRes, fRes] = await Promise.all([
          fetch("/api/admin/batches"),
          fetch("/api/auth/register?role=FACULTY"),
        ]);
        const bData = await bRes.json();
        const fData = await fRes.json();
        if (bData.success) setBatches(bData.batches ?? []);
        if (fData.success && Array.isArray(fData.users)) {
          setFacultyList(
            fData.users.map((u: { id: string; firstName: string; lastName: string }) => ({
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
            }))
          );
        }
      } catch {
        showToast("error", "Failed to load initial data");
      } finally {
        setLoadingBatches(false);
      }
    }
    init();
  }, []);

  // ── Fetch exams ───────────────────────────────────────────────────────────

  const fetchExams = useCallback(async (batchId: string) => {
    setLoadingExams(true);
    try {
      const params = batchId ? `?batchId=${batchId}` : "";
      const res = await fetch(`/api/admin/exams${params}`);
      const data = await res.json();
      if (data.success) setExams(data.exams ?? []);
      else showToast("error", data.error || "Failed to load exams");
    } catch {
      showToast("error", "Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    fetchExams(filterBatchId);
  }, [filterBatchId, fetchExams]);

  // ── Exam form helpers ─────────────────────────────────────────────────────

  function openCreateModal() {
    setEditExam(null);
    setExamForm({ ...EMPTY_EXAM_FORM });
    setExamModalOpen(true);
  }

  function openEditModal(exam: Exam) {
    setEditExam(exam);
    const dateOnly = exam.examDate ? exam.examDate.split("T")[0] : "";
    setExamForm({
      subject: exam.subject,
      batchId: exam.batch.id,
      examDate: dateOnly,
      dayOfWeek: exam.dayOfWeek,
      time: exam.time ?? "",
      room: exam.room ?? "",
      maxMarks: String(exam.maxMarks),
      syllabus: exam.syllabus ?? "",
    });
    setExamModalOpen(true);
  }

  function closeExamModal() {
    setExamModalOpen(false);
    setEditExam(null);
    setExamForm({ ...EMPTY_EXAM_FORM });
  }

  function handleDateChange(dateStr: string) {
    setExamForm((f) => ({ ...f, examDate: dateStr, dayOfWeek: getDayFromDate(dateStr) }));
  }

  // ── Save exam ─────────────────────────────────────────────────────────────

  async function handleSaveExam() {
    if (!examForm.subject || !examForm.batchId || !examForm.examDate || !examForm.time) {
      showToast("error", "Please fill in all required fields");
      return;
    }
    setSavingExam(true);
    try {
      const isEdit = !!editExam;
      const body = isEdit
        ? { id: editExam!.id, ...examForm, maxMarks: parseInt(examForm.maxMarks) || 100 }
        : { ...examForm, maxMarks: parseInt(examForm.maxMarks) || 100 };

      const res = await fetch("/api/admin/exams", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to save exam");
        return;
      }
      const notifMsg = isEdit
        ? "Exam updated."
        : `Exam created. ${data.studentsNotified ?? 0} students and ${data.facultyNotified ?? 0} faculty notified.`;
      showToast("success", notifMsg);
      closeExamModal();
      fetchExams(filterBatchId);
    } catch {
      showToast("error", "Failed to save exam");
    } finally {
      setSavingExam(false);
    }
  }

  // ── Delete exam ───────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to delete exam");
        return;
      }
      showToast("success", "Exam deleted");
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch {
      showToast("error", "Failed to delete exam");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  // ── Papers modal ──────────────────────────────────────────────────────────

  async function openPapersModal(exam: Exam) {
    setPapersModalExam(exam);
    setUploadFacultyId("");
    setUploadFile(null);
    setLoadingPapers(true);
    try {
      const res = await fetch(`/api/admin/exams/paper?examId=${exam.id}`);
      const data = await res.json();
      if (data.success) setPapers(data.papers ?? []);
      else setPapers([]);
    } catch {
      setPapers([]);
    } finally {
      setLoadingPapers(false);
    }
  }

  function closePapersModal() {
    setPapersModalExam(null);
    setPapers([]);
    setUploadFacultyId("");
    setUploadFile(null);
  }

  async function handleUploadPaper() {
    if (!papersModalExam || !uploadFile || !uploadFacultyId) {
      showToast("error", "Please select a faculty member and file");
      return;
    }
    setUploadingPaper(true);
    try {
      const fd = new FormData();
      fd.append("files", uploadFile);
      fd.append("examId", papersModalExam.id);
      fd.append("facultyId", uploadFacultyId);

      const res = await fetch("/api/admin/exams/paper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Upload failed");
        return;
      }
      showToast("success", "Paper uploaded successfully");
      setUploadFacultyId("");
      setUploadFile(null);
      // Refresh papers list
      const refreshRes = await fetch(`/api/admin/exams/paper?examId=${papersModalExam.id}`);
      const refreshData = await refreshRes.json();
      if (refreshData.success) setPapers(refreshData.papers ?? []);
    } catch {
      showToast("error", "Upload failed");
    } finally {
      setUploadingPaper(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Exam
        </button>
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

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Batch</label>
        {loadingBatches ? (
          <div className="h-9 w-48 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <select
            value={filterBatchId}
            onChange={(e) => setFilterBatchId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.standard} — {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Exam Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loadingExams ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-700 font-medium">No exams found</p>
            <p className="text-gray-400 text-sm mt-1">Create one using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Exam Name / Subject</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Max Marks</th>
                  <th className="px-4 py-3 font-medium">Papers</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.subject}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.batch.standard} — {exam.batch.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{formatDate(exam.examDate)}</div>
                      <div className="text-xs text-gray-400">{exam.dayOfWeek}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exam.time || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.room || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.maxMarks}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                        {exam._count?.papers ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPapersModal(exam)}
                          title="View Papers"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(exam)}
                          title="Edit"
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(exam.id)}
                          title="Delete"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* ── Create / Edit Exam Modal ──────────────────────────────────────── */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-900">
                {editExam ? "Edit Exam" : "Create Exam"}
              </h3>
              <button
                onClick={closeExamModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examForm.subject}
                  onChange={(e) => setExamForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Batch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={examForm.batchId}
                  onChange={(e) => setExamForm((f) => ({ ...f, batchId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select batch --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.standard} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={examForm.examDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Day of Week</label>
                  <input
                    type="text"
                    value={examForm.dayOfWeek}
                    readOnly
                    placeholder="Auto-filled"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Time + Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={examForm.time}
                    onChange={(e) => setExamForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Room <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={examForm.room}
                    onChange={(e) => setExamForm((f) => ({ ...f, room: e.target.value }))}
                    placeholder="e.g. Room A"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Max Marks */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Marks</label>
                <input
                  type="number"
                  min={1}
                  value={examForm.maxMarks}
                  onChange={(e) => setExamForm((f) => ({ ...f, maxMarks: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Syllabus */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Syllabus <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={examForm.syllabus}
                  onChange={(e) => setExamForm((f) => ({ ...f, syllabus: e.target.value }))}
                  placeholder="Topics covered..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
              <button
                onClick={closeExamModal}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExam}
                disabled={savingExam}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingExam && <Loader2 className="w-4 h-4 animate-spin" />}
                {editExam ? "Update Exam" : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Papers Modal ──────────────────────────────────────────────────── */}
      {papersModalExam && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Exam Papers</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {papersModalExam.subject} — {papersModalExam.batch.standard} {papersModalExam.batch.name}
                </p>
              </div>
              <button
                onClick={closePapersModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-6">
              {/* Admin-only note */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Papers are visible to admin only — not to students.
                </p>
              </div>

              {/* Existing papers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Uploaded Papers</h4>
                {loadingPapers ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : papers.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No papers uploaded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-left">
                        <tr>
                          <th className="px-3 py-2.5 font-medium">Faculty</th>
                          <th className="px-3 py-2.5 font-medium">File Name</th>
                          <th className="px-3 py-2.5 font-medium">Upload Date</th>
                          <th className="px-3 py-2.5 font-medium">Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {papers.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-gray-700">
                              {p.faculty.user.firstName} {p.faculty.user.lastName}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 max-w-[180px] truncate">
                              {p.fileName}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500">
                              {new Date(p.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-3 py-2.5">
                              <a
                                href={p.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upload section */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-800">Upload Paper</h4>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadFacultyId}
                    onChange={(e) => setUploadFacultyId(e.target.value)}
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

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">Accepted: .pdf, .doc, .docx, .jpg, .png</p>
                </div>

                <button
                  onClick={handleUploadPaper}
                  disabled={uploadingPaper || !uploadFile || !uploadFacultyId}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingPaper ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Paper
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={closePapersModal}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Exam?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently remove this exam and all associated papers.
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
