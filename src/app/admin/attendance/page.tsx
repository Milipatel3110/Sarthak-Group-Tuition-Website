"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Save, RefreshCw, AlertCircle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface StudentProfile {
  id: string;
  class: string;
  medium: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentProfile: StudentProfile | null;
}

interface Course {
  id: string;
  name: string;
  targetClass: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  student: {
    id: string;
    class: string;
    user: { firstName: string; lastName: string };
  };
  course: { id: string; name: string };
}

interface StudentAttendanceRow {
  userId: string;
  studentProfileId: string;
  firstName: string;
  lastName: string;
  studentClass: string;
  status: AttendanceStatus;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
];

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-700",
  EXCUSED: "bg-blue-100 text-blue-700",
};

const BTN_ACTIVE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-500 text-white",
  ABSENT: "bg-red-500 text-white",
  LATE: "bg-yellow-500 text-white",
  EXCUSED: "bg-blue-500 text-white",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  // --- Section 1 state ---
  const [date, setDate] = useState(todayString());
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [noProfileMsg, setNoProfileMsg] = useState(false);

  // --- Section 2 state ---
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Load courses + students on mount
  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => d.courses && setCourses(d.courses));

    fetch("/api/admin/users?role=STUDENT")
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setAllStudents(d.users);
      });
  }, []);

  // Load students for marking
  async function loadStudents() {
    setLoadingStudents(true);
    setSaveMsg("");
    setSaveError("");
    setNoProfileMsg(false);
    try {
      const res = await fetch("/api/admin/users?role=STUDENT");
      const data = await res.json();
      const users: User[] = data.users || [];
      const withProfile = users.filter((u) => u.studentProfile);
      if (withProfile.length === 0) {
        setNoProfileMsg(true);
        setRows([]);
        return;
      }
      setRows(
        withProfile.map((u) => ({
          userId: u.id,
          studentProfileId: u.studentProfile!.id,
          firstName: u.firstName,
          lastName: u.lastName,
          studentClass: u.studentProfile!.class,
          status: "PRESENT",
        }))
      );
    } finally {
      setLoadingStudents(false);
    }
  }

  function updateStatus(profileId: string, status: AttendanceStatus) {
    setRows((prev) =>
      prev.map((r) =>
        r.studentProfileId === profileId ? { ...r, status } : r
      )
    );
  }

  async function saveAttendance() {
    if (!selectedCourseId) {
      setSaveError("Please select a course before saving.");
      return;
    }
    if (rows.length === 0) {
      setSaveError("No students loaded.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      await Promise.all(
        rows.map((r) =>
          fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: r.studentProfileId,
              courseId: selectedCourseId,
              date,
              status: r.status,
            }),
          })
        )
      );
      setSaveMsg(`Attendance saved for ${date}`);
    } catch {
      setSaveError("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Load attendance records
  async function loadRecords() {
    setLoadingRecords(true);
    try {
      const params = new URLSearchParams();
      if (filterCourseId) params.set("courseId", filterCourseId);
      if (filterStudentId) params.set("studentId", filterStudentId);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      const all: AttendanceRecord[] = data.attendance || [];
      setRecords(all.slice(0, 50));
    } finally {
      setLoadingRecords(false);
    }
  }

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourseId, filterStudentId]);

  const studentsWithProfile = allStudents.filter((u) => u.studentProfile);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <CalendarCheck className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      </div>

      {/* ── Section 1: Mark Attendance ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Mark Attendance
        </h2>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
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
          <button
            onClick={loadStudents}
            disabled={loadingStudents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {loadingStudents ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Load Students
          </button>
        </div>

        {/* No profile message */}
        {noProfileMsg && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            No registered students found. Students must register via the portal
            first.
          </div>
        )}

        {/* Attendance table */}
        {rows.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student Name</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr
                      key={row.studentProfileId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {row.studentClass}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                updateStatus(row.studentProfileId, s)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                row.status === s
                                  ? BTN_ACTIVE[s]
                                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Attendance
              </button>
              {saveMsg && (
                <span className="text-green-600 text-sm font-medium">
                  {saveMsg}
                </span>
              )}
              {saveError && (
                <span className="text-red-600 text-sm">{saveError}</span>
              )}
            </div>
          </>
        )}

        {rows.length === 0 && !noProfileMsg && (
          <p className="text-gray-400 text-sm italic">
            Click &quot;Load Students&quot; to begin marking attendance.
          </p>
        )}
      </div>

      {/* ── Section 2: View Records ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Attendance Records
          <span className="ml-2 text-xs font-normal text-gray-400">
            (last 50)
          </span>
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-5">
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Students</option>
            {studentsWithProfile.map((u) => (
              <option key={u.studentProfile!.id} value={u.studentProfile!.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
        </div>

        {loadingRecords ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-8">
            No attendance records found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(rec.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {rec.student.user.firstName} {rec.student.user.lastName}
                      <span className="ml-2 text-xs text-gray-400">
                        {rec.student.class}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {rec.course.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rec.status]}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
