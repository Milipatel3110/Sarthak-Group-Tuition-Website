"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart2,
  Save,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Batch {
  id: string;
  name: string;
  standard: string;
}

interface Exam {
  id: string;
  subject: string;
  examDate: string;
  maxMarks: number;
}

interface StudentProfile {
  id: string;
  class: string;
}

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  studentProfile: StudentProfile | null;
}

interface GradeRow {
  studentId: string; // studentProfile.id
  userId: string;
  firstName: string;
  lastName: string;
  studentClass: string;
  marks: string;
}

interface GradeRecord {
  id: string;
  examName: string;
  marks: number;
  maxMarks: number;
  grade: string | null;
  createdAt: string;
  student: {
    id: string;
    class: string;
    user: { firstName: string; lastName: string };
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function computeGrade(marks: number, maxMarks: number): string {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  return "F";
}

function pctColor(pct: number): string {
  if (pct >= 75) return "text-green-600 font-semibold";
  if (pct >= 50) return "text-yellow-600 font-semibold";
  return "text-red-600 font-semibold";
}

function gradeBadgeColor(grade: string | null): string {
  if (!grade) return "bg-gray-100 text-gray-500";
  if (grade === "A+" || grade === "A") return "bg-green-100 text-green-700";
  if (grade === "B+" || grade === "B") return "bg-blue-100 text-blue-700";
  if (grade === "C") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateRangeFilter(range: string): Date {
  const now = new Date();
  if (range === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  if (range === "6months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 6);
    return d;
  }
  // "year"
  return new Date(now.getFullYear(), 0, 1);
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState<"enter" | "view">("enter");

  // Shared
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Tab 1: Enter Grades ─────────────────────────────────────────────────
  const [enterBatchId, setEnterBatchId] = useState("");
  const [enterExamId, setEnterExamId] = useState("");
  const [customExamName, setCustomExamName] = useState("");
  const [examsForBatch, setExamsForBatch] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentsForBatch, setStudentsForBatch] = useState<StudentUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);

  // ── Tab 2: View Grades ──────────────────────────────────────────────────
  const [viewBatchId, setViewBatchId] = useState("");
  const [viewExamId, setViewExamId] = useState("");
  const [viewExamsForBatch, setViewExamsForBatch] = useState<Exam[]>([]);
  const [loadingViewExams, setLoadingViewExams] = useState(false);
  const [allGrades, setAllGrades] = useState<GradeRecord[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [dateRange, setDateRange] = useState("year");

  // ── Load batches on mount ───────────────────────────────────────────────

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/admin/batches");
        const data = await res.json();
        if (data.success) setBatches(data.batches ?? []);
      } catch {
        showToast("error", "Failed to load batches");
      } finally {
        setLoadingBatches(false);
      }
    }
    fetchBatches();
  }, []);

  // ── Tab 1: fetch exams when batch changes ───────────────────────────────

  useEffect(() => {
    if (!enterBatchId) {
      setExamsForBatch([]);
      setEnterExamId("");
      setStudentsForBatch([]);
      setGradeRows([]);
      return;
    }
    async function load() {
      setLoadingExams(true);
      setEnterExamId("");
      setGradeRows([]);
      try {
        const res = await fetch(`/api/admin/exams?batchId=${enterBatchId}`);
        const data = await res.json();
        if (data.success) setExamsForBatch(data.exams ?? []);
      } catch {
        // non-critical
      } finally {
        setLoadingExams(false);
      }
      // Also load students in this batch
      setLoadingStudents(true);
      try {
        const res = await fetch(`/api/admin/users?role=STUDENT&batchId=${enterBatchId}`);
        const data = await res.json();
        const users: StudentUser[] = data.users ?? [];
        setStudentsForBatch(users);
        setGradeRows(
          users
            .filter((u) => u.studentProfile)
            .map((u) => ({
              studentId: u.studentProfile!.id,
              userId: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              studentClass: u.studentProfile!.class,
              marks: "",
            }))
        );
      } catch {
        showToast("error", "Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    }
    load();
  }, [enterBatchId]);

  // ── Selected exam details ───────────────────────────────────────────────

  const selectedExam = examsForBatch.find((e) => e.id === enterExamId);
  const effectiveMaxMarks = selectedExam ? selectedExam.maxMarks : 100;
  const effectiveExamName = enterExamId
    ? selectedExam?.subject ?? ""
    : customExamName;

  // ── Save all grades ─────────────────────────────────────────────────────

  async function handleSaveGrades() {
    if (!enterBatchId || (!enterExamId && !customExamName.trim())) {
      showToast("error", "Please select a batch and exam (or enter a custom name)");
      return;
    }
    const toSave = gradeRows.filter((r) => r.marks !== "" && !isNaN(Number(r.marks)));
    if (toSave.length === 0) {
      showToast("error", "Please enter marks for at least one student");
      return;
    }
    setSavingGrades(true);
    try {
      const results = await Promise.allSettled(
        toSave.map((row) => {
          const marksNum = parseFloat(row.marks);
          return fetch("/api/grades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: row.studentId,
              courseId: "batch",
              examId: enterExamId || undefined,
              examName: effectiveExamName,
              marks: marksNum,
              maxMarks: effectiveMaxMarks,
              grade: computeGrade(marksNum, effectiveMaxMarks),
            }),
          });
        })
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        showToast("error", `${toSave.length - failed} saved, ${failed} failed.`);
      } else {
        showToast("success", `Grades saved for ${toSave.length} student(s).`);
        // Clear marks
        setGradeRows((prev) => prev.map((r) => ({ ...r, marks: "" })));
      }
    } catch {
      showToast("error", "Failed to save grades");
    } finally {
      setSavingGrades(false);
    }
  }

  // ── Tab 2: fetch exams when view batch changes ──────────────────────────

  useEffect(() => {
    if (!viewBatchId) {
      setViewExamsForBatch([]);
      setViewExamId("");
      return;
    }
    async function load() {
      setLoadingViewExams(true);
      setViewExamId("");
      try {
        const res = await fetch(`/api/admin/exams?batchId=${viewBatchId}`);
        const data = await res.json();
        if (data.success) setViewExamsForBatch(data.exams ?? []);
      } catch {
        // non-critical
      } finally {
        setLoadingViewExams(false);
      }
    }
    load();
  }, [viewBatchId]);

  // ── Tab 2: load grades ──────────────────────────────────────────────────

  const fetchGrades = useCallback(async (batchId: string, examId: string) => {
    setLoadingGrades(true);
    try {
      const params = new URLSearchParams();
      if (batchId) params.set("batchId", batchId);
      if (examId) params.set("examId", examId);
      const res = await fetch(`/api/grades?${params.toString()}`);
      const data = await res.json();
      setAllGrades(data.grades ?? []);
    } catch {
      showToast("error", "Failed to load grades");
    } finally {
      setLoadingGrades(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "view") {
      fetchGrades(viewBatchId, viewExamId);
    }
  }, [activeTab, viewBatchId, viewExamId, fetchGrades]);

  // ── Filter grades by date range ─────────────────────────────────────────

  const cutoff = getDateRangeFilter(dateRange);
  const filteredGrades = allGrades.filter(
    (g) => new Date(g.createdAt) >= cutoff
  );

  // ── Stats ───────────────────────────────────────────────────────────────

  const statsGrades = filteredGrades.filter((g) => g.maxMarks > 0);
  const pcts = statsGrades.map((g) => (g.marks / g.maxMarks) * 100);
  const avg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
  const highest = pcts.length ? Math.max(...pcts) : null;
  const lowest = pcts.length ? Math.min(...pcts) : null;

  // ── Export CSV ──────────────────────────────────────────────────────────

  function handleExportCSV() {
    if (filteredGrades.length === 0) {
      showToast("error", "No grades to export");
      return;
    }
    const header = ["Student", "Class", "Exam", "Marks", "Max Marks", "Percentage", "Grade", "Date"];
    const rows = filteredGrades.map((g) => {
      const pct = g.maxMarks > 0 ? ((g.marks / g.maxMarks) * 100).toFixed(1) : "—";
      return [
        `${g.student.user.firstName} ${g.student.user.lastName}`,
        g.student.class,
        g.examName,
        g.marks,
        g.maxMarks,
        `${pct}%`,
        g.grade ?? "—",
        formatDate(g.createdAt),
      ].join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("enter")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "enter"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Enter Grades
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "view"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          View Grades &amp; Reports
        </button>
      </div>

      {/* ── Tab 1: Enter Grades ──────────────────────────────────────────── */}
      {activeTab === "enter" && (
        <div className="space-y-5">
          {/* Selection row */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">Select Batch &amp; Exam</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                {loadingBatches ? (
                  <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={enterBatchId}
                    onChange={(e) => setEnterBatchId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select batch --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.standard} — {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Exam */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Exam (or enter custom name below)
                </label>
                {loadingExams ? (
                  <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={enterExamId}
                    onChange={(e) => {
                      setEnterExamId(e.target.value);
                      if (e.target.value) setCustomExamName("");
                    }}
                    disabled={!enterBatchId}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">-- Select exam --</option>
                    {examsForBatch.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.subject} ({formatDate(e.examDate)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Custom exam name */}
            {!enterExamId && enterBatchId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Custom Exam Name{" "}
                  <span className="text-gray-400 font-normal">(if not from list above)</span>
                </label>
                <input
                  type="text"
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  placeholder="e.g. Unit Test 1, Mid Term"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Students table */}
          {enterBatchId && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Enter Marks</h2>
                  {selectedExam && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Max Marks: {selectedExam.maxMarks}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSaveGrades}
                  disabled={savingGrades || (!enterExamId && !customExamName.trim())}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingGrades ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save All Grades
                </button>
              </div>

              {loadingStudents ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : gradeRows.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm italic">
                  No students found in this batch.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Class</th>
                        <th className="px-4 py-3 font-medium">
                          Marks{" "}
                          <span className="text-gray-400 font-normal">
                            (0–{effectiveMaxMarks})
                          </span>
                        </th>
                        <th className="px-4 py-3 font-medium">Auto Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gradeRows.map((row, idx) => {
                        const marksNum = parseFloat(row.marks);
                        const autoGrade =
                          row.marks !== "" && !isNaN(marksNum)
                            ? computeGrade(marksNum, effectiveMaxMarks)
                            : "—";
                        return (
                          <tr key={row.studentId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                              {row.firstName} {row.lastName}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs">{row.studentClass}</td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                min={0}
                                max={effectiveMaxMarks}
                                step="0.5"
                                value={row.marks}
                                onChange={(e) =>
                                  setGradeRows((prev) =>
                                    prev.map((r) =>
                                      r.studentId === row.studentId
                                        ? { ...r, marks: e.target.value }
                                        : r
                                    )
                                  )
                                }
                                placeholder="—"
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${gradeBadgeColor(
                                  autoGrade === "—" ? null : autoGrade
                                )}`}
                              >
                                {autoGrade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: View Grades & Reports ────────────────────────────────── */}
      {activeTab === "view" && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Batch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
                {loadingBatches ? (
                  <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={viewBatchId}
                    onChange={(e) => setViewBatchId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Exam */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Exam</label>
                {loadingViewExams ? (
                  <div className="h-9 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={viewExamId}
                    onChange={(e) => setViewExamId(e.target.value)}
                    disabled={!viewBatchId}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">All Exams</option>
                    {viewExamsForBatch.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.subject} ({formatDate(e.examDate)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date range */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="month">Last Month</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats + Export */}
          {filteredGrades.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {avg !== null ? `${avg.toFixed(1)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Class Average</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {highest !== null ? `${highest.toFixed(1)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Highest</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {lowest !== null ? `${lowest.toFixed(1)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Lowest</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-center">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {/* Grades Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loadingGrades ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-11 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <BarChart2 className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-gray-700 font-medium">No grades found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting the filters or enter grades in the other tab.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Exam</th>
                      <th className="px-4 py-3 font-medium">Marks</th>
                      <th className="px-4 py-3 font-medium">Max</th>
                      <th className="px-4 py-3 font-medium">%</th>
                      <th className="px-4 py-3 font-medium">Grade</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGrades.map((g) => {
                      const pct = g.maxMarks > 0 ? (g.marks / g.maxMarks) * 100 : 0;
                      return (
                        <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800">
                              {g.student.user.firstName} {g.student.user.lastName}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400">{g.student.class}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{g.examName}</td>
                          <td className="px-4 py-3 text-gray-700">{g.marks}</td>
                          <td className="px-4 py-3 text-gray-500">{g.maxMarks}</td>
                          <td className={`px-4 py-3 ${pctColor(pct)}`}>
                            {pct.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${gradeBadgeColor(
                                g.grade
                              )}`}
                            >
                              {g.grade ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {formatDate(g.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export button (bottom, if no stats row) */}
          {filteredGrades.length === 0 && allGrades.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
