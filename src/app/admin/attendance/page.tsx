"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarCheck,
  Save,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
type Tab = "mark" | "reports";
type Preset = "month" | "6months" | "year" | "custom";

interface Batch {
  id: string;
  name: string;
  standard: string;
  medium: string;
  _count: { students: number };
}

interface Course {
  id: string;
  name: string;
  targetClass: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentProfile: { id: string } | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: Status;
  student: { id: string; user: { firstName: string; lastName: string } };
  course: { id: string; name: string };
}

interface MarkRow {
  userId: string;
  profileId: string;
  firstName: string;
  lastName: string;
  status: Status;
}

interface ReportStudent {
  profileId: string;
  name: string;
  records: { date: string; status: Status }[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  PRESENT: "P",
  ABSENT: "A",
  LATE: "L",
  EXCUSED: "E",
};

const STATUS_ACTIVE: Record<Status, string> = {
  PRESENT: "bg-green-500 text-white border-green-500",
  ABSENT: "bg-red-500 text-white border-red-500",
  LATE: "bg-yellow-500 text-white border-yellow-500",
  EXCUSED: "bg-gray-400 text-white border-gray-400",
};

const STATUS_INACTIVE =
  "bg-white text-gray-500 border-gray-200 hover:border-gray-400";

const STATUS_BADGE: Record<Status, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  EXCUSED: "bg-gray-100 text-gray-600",
};

const ALL_STATUSES: Status[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function offsetDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dayName(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
}

function pct(present: number, total: number) {
  if (total === 0) return "—";
  return ((present / total) * 100).toFixed(1) + "%";
}

// ── Toast (standalone, defined outside page) ───────────────────────────────────

interface ToastProps {
  msg: string;
  kind: "success" | "error";
}

function Toast({ msg, kind }: ToastProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
        ${kind === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
    >
      {msg}
    </div>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-200 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ── Status toggle button ───────────────────────────────────────────────────────

interface StatusBtnProps {
  s: Status;
  active: boolean;
  onClick: () => void;
}

function StatusBtn({ s, active, onClick }: StatusBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full text-xs font-bold border-2 transition-colors
        ${active ? STATUS_ACTIVE[s] : STATUS_INACTIVE}`}
    >
      {STATUS_LABEL[s]}
    </button>
  );
}

// ── Collapsible student report ─────────────────────────────────────────────────

interface StudentReportRowProps {
  student: ReportStudent;
  from: string;
  to: string;
}

function StudentReportRow({ student, from, to }: StudentReportRowProps) {
  const [open, setOpen] = useState(false);

  const inRange = student.records.filter((r) => r.date >= from && r.date <= to);
  const total = inRange.length;
  const present = inRange.filter((r) => r.status === "PRESENT").length;
  const absent = inRange.filter((r) => r.status === "ABSENT").length;
  const late = inRange.filter((r) => r.status === "LATE").length;

  return (
    <>
      <tr
        className="hover:bg-blue-50 cursor-pointer transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          {student.name}
        </td>
        <td className="px-4 py-3 text-gray-600">{total}</td>
        <td className="px-4 py-3 text-green-700 font-medium">{present}</td>
        <td className="px-4 py-3 text-red-600">{absent}</td>
        <td className="px-4 py-3 text-yellow-600">{late}</td>
        <td className="px-4 py-3 font-semibold">{pct(present, total)}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="px-4 pb-3 pt-0 bg-gray-50">
            {inRange.length === 0 ? (
              <p className="text-gray-400 text-xs italic py-2">
                No records in this range.
              </p>
            ) : (
              <table className="w-full text-xs mt-1">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-1 pr-4 text-left font-medium">Date</th>
                    <th className="py-1 pr-4 text-left font-medium">Day</th>
                    <th className="py-1 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inRange
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((r) => (
                      <tr key={r.date}>
                        <td className="py-1 pr-4 text-gray-600">
                          {fmtDate(r.date)}
                        </td>
                        <td className="py-1 pr-4 text-gray-500">
                          {dayName(r.date)}
                        </td>
                        <td className="py-1">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[r.status]}`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("mark");

  // shared data
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // toast
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Mark tab state
  const [markBatchId, setMarkBatchId] = useState("");
  const [markCourseId, setMarkCourseId] = useState("");
  const [markDate, setMarkDate] = useState(todayStr());
  const [markRows, setMarkRows] = useState<MarkRow[]>([]);
  const [loadingMark, setLoadingMark] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reports tab state
  const [rptBatchId, setRptBatchId] = useState("");
  const [rptStudentId, setRptStudentId] = useState("all");
  const [rptStudents, setRptStudents] = useState<Student[]>([]);
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState(offsetDate(30));
  const [customTo, setCustomTo] = useState(todayStr());
  const [reportData, setReportData] = useState<ReportStudent[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(false);

  // Show toast for 4s
  function showToast(msg: string, kind: "success" | "error") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4000);
  }

  // Load batches + courses on mount
  useEffect(() => {
    fetch("/api/admin/batches")
      .then((r) => r.json())
      .then((d) => d.batches && setBatches(d.batches));

    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => d.courses && setCourses(d.courses));
  }, []);

  // Load students when mark batch changes
  useEffect(() => {
    if (!markBatchId) {
      setMarkRows([]);
      return;
    }
    setLoadingMark(true);
    fetch(`/api/admin/students?batchId=${markBatchId}`)
      .then((r) => r.json())
      .then((d) => {
        const students: Student[] = d.students || [];
        setMarkRows(
          students
            .filter((s) => s.studentProfile)
            .map((s) => ({
              userId: s.id,
              profileId: s.studentProfile!.id,
              firstName: s.firstName,
              lastName: s.lastName,
              status: "PRESENT" as Status,
            }))
        );
      })
      .finally(() => setLoadingMark(false));
  }, [markBatchId]);

  // Load students for report batch
  useEffect(() => {
    if (!rptBatchId) {
      setRptStudents([]);
      setRptStudentId("all");
      return;
    }
    fetch(`/api/admin/students?batchId=${rptBatchId}`)
      .then((r) => r.json())
      .then((d) => {
        setRptStudents(d.students || []);
        setRptStudentId("all");
      });
  }, [rptBatchId]);

  function updateMarkStatus(profileId: string, status: Status) {
    setMarkRows((prev) =>
      prev.map((r) => (r.profileId === profileId ? { ...r, status } : r))
    );
  }

  async function saveAttendance() {
    if (!markCourseId) {
      showToast("Please select a course.", "error");
      return;
    }
    if (markRows.length === 0) {
      showToast("No students loaded.", "error");
      return;
    }
    setSaving(true);
    try {
      const results = await Promise.all(
        markRows.map((r) =>
          fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: r.profileId,
              courseId: markCourseId,
              date: markDate,
              status: r.status,
            }),
          }).then((res) => res.json())
        )
      );
      const anyFailed = results.some((r) => !r.success && !r.attendance);
      if (anyFailed) {
        showToast("Some records failed to save. Check console.", "error");
      } else {
        showToast(
          `Attendance saved for ${markRows.length} students on ${fmtDate(markDate)}.`,
          "success"
        );
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  // Compute date range from preset
  function getRange(): { from: string; to: string } {
    if (preset === "month") return { from: offsetDate(30), to: todayStr() };
    if (preset === "6months") return { from: offsetDate(180), to: todayStr() };
    if (preset === "year") return { from: yearStart(), to: todayStr() };
    return { from: customFrom, to: customTo };
  }

  const loadReport = useCallback(async () => {
    if (!rptBatchId) {
      showToast("Please select a batch first.", "error");
      return;
    }
    setLoadingReport(true);
    setReportLoaded(false);
    try {
      // Determine which students to load
      const studentsToFetch =
        rptStudentId === "all"
          ? rptStudents.filter((s) => s.studentProfile)
          : rptStudents.filter(
              (s) => s.studentProfile?.id === rptStudentId
            );

      const allRecords = await Promise.all(
        studentsToFetch.map(async (s) => {
          const profileId = s.studentProfile!.id;
          const res = await fetch(`/api/attendance?studentId=${profileId}`);
          const data = await res.json();
          const records: AttendanceRecord[] = data.attendance || [];
          return {
            profileId,
            name: `${s.firstName} ${s.lastName}`,
            records: records.map((r) => ({
              date: r.date.split("T")[0],
              status: r.status,
            })),
          } as ReportStudent;
        })
      );

      setReportData(allRecords);
      setReportLoaded(true);
    } catch {
      showToast("Failed to load report.", "error");
    } finally {
      setLoadingReport(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rptBatchId, rptStudentId, rptStudents]);

  function exportCsv() {
    const { from, to } = getRange();
    const headers = ["Student", "Date", "Day", "Status"];
    const rows: string[][] = [];

    for (const s of reportData) {
      const inRange = s.records.filter((r) => r.date >= from && r.date <= to);
      for (const r of inRange.sort((a, b) => (a.date < b.date ? 1 : -1))) {
        rows.push([s.name, fmtDate(r.date), dayName(r.date), r.status]);
      }
    }

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const { from: rangeFrom, to: rangeTo } = getRange();

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} kind={toast.kind} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarCheck className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["mark", "reports"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${
                activeTab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {t === "mark" ? "Mark Attendance" : "View & Reports"}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Mark Attendance ───────────────────────────────────────────── */}
      {activeTab === "mark" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            {/* Batch */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-600">Batch</label>
              <select
                value={markBatchId}
                onChange={(e) => setMarkBatchId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — Std {b.standard} ({b._count.students} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-600">Course</label>
              <select
                value={markCourseId}
                onChange={(e) => setMarkCourseId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Date</label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Skeleton */}
          {loadingMark && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonRow key={i} cols={2} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Table */}
          {!loadingMark && markRows.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">
                        Status&nbsp;
                        <span className="text-xs font-normal text-gray-400">
                          (P&nbsp;A&nbsp;L&nbsp;E)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {markRows.map((row, idx) => (
                      <tr
                        key={row.profileId}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} transition-colors`}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {ALL_STATUSES.map((s) => (
                              <StatusBtn
                                key={s}
                                s={s}
                                active={row.status === s}
                                onClick={() =>
                                  updateMarkStatus(row.profileId, s)
                                }
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save button */}
              <div className="mt-4">
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            </>
          )}

          {!loadingMark && markRows.length === 0 && !markBatchId && (
            <p className="text-gray-400 text-sm italic">
              Select a batch to load students.
            </p>
          )}

          {!loadingMark && markRows.length === 0 && markBatchId && (
            <p className="text-gray-400 text-sm italic">
              No students found in this batch.
            </p>
          )}
        </div>
      )}

      {/* ── Tab 2: View & Reports ────────────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Filters row */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Batch */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-600">Batch</label>
              <select
                value={rptBatchId}
                onChange={(e) => setRptBatchId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — Std {b.standard}
                  </option>
                ))}
              </select>
            </div>

            {/* Student */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-sm font-medium text-gray-600">
                Student
              </label>
              <select
                value={rptStudentId}
                onChange={(e) => setRptStudentId(e.target.value)}
                disabled={!rptBatchId}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="all">All Students</option>
                {rptStudents
                  .filter((s) => s.studentProfile)
                  .map((s) => (
                    <option key={s.studentProfile!.id} value={s.studentProfile!.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Date range presets */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Date Range
              </label>
              <div className="flex gap-2">
                {(["month", "6months", "year", "custom"] as Preset[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPreset(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                        ${
                          preset === p
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      {p === "month"
                        ? "Last Month"
                        : p === "6months"
                          ? "Last 6 Months"
                          : p === "year"
                            ? "This Year"
                            : "Custom"}
                    </button>
                  )
                )}
              </div>
            </div>

            {preset === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    From
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    To
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <button
              onClick={loadReport}
              disabled={loadingReport || !rptBatchId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loadingReport ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Load Report
            </button>

            {reportLoaded && reportData.length > 0 && (
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          {/* Range label */}
          {reportLoaded && (
            <p className="text-xs text-gray-400">
              Showing: {fmtDate(rangeFrom)} — {fmtDate(rangeTo)}
            </p>
          )}

          {/* Skeleton */}
          {loadingReport && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    {["Student", "Total", "Present", "Absent", "Late", "%"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 font-medium">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <SkeletonRow key={i} cols={6} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary table */}
          {!loadingReport && reportLoaded && reportData.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Total Days</th>
                    <th className="px-4 py-3 font-medium text-green-700">
                      Present
                    </th>
                    <th className="px-4 py-3 font-medium text-red-600">
                      Absent
                    </th>
                    <th className="px-4 py-3 font-medium text-yellow-600">
                      Late
                    </th>
                    <th className="px-4 py-3 font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.map((s) => (
                    <StudentReportRow
                      key={s.profileId}
                      student={s}
                      from={rangeFrom}
                      to={rangeTo}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingReport && reportLoaded && reportData.length === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-8">
              No attendance records found for the selected filters.
            </p>
          )}

          {!reportLoaded && !loadingReport && (
            <p className="text-gray-400 text-sm italic">
              Select a batch and click &quot;Load Report&quot; to view
              attendance data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
