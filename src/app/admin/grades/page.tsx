"use client";

import { useEffect, useState } from "react";
import { BarChart2, PlusCircle, RefreshCw } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  class: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  studentProfile: StudentProfile | null;
}

interface Course {
  id: string;
  name: string;
}

interface GradeRecord {
  id: string;
  examName: string;
  marks: number;
  maxMarks: number;
  grade: string | null;
  remarks: string | null;
  createdAt: string;
  student: {
    id: string;
    class: string;
    user: { firstName: string; lastName: string };
  };
  course: { id: string; name: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 75) return "text-green-600 font-semibold";
  if (pct >= 50) return "text-yellow-600 font-semibold";
  return "text-red-600 font-semibold";
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GradesPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [filterCourseId, setFilterCourseId] = useState("");
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    examName: "",
    marks: "",
    maxMarks: "100",
    grade: "",
    remarks: "",
  });

  // Load reference data
  useEffect(() => {
    fetch("/api/admin/users?role=STUDENT")
      .then((r) => r.json())
      .then((d) => d.users && setStudents(d.users));

    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => d.courses && setCourses(d.courses));
  }, []);

  // Load grades
  async function loadGrades(courseId: string) {
    setLoadingGrades(true);
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("courseId", courseId);
      const res = await fetch(`/api/grades?${params.toString()}`);
      const data = await res.json();
      setGrades(data.grades || []);
    } finally {
      setLoadingGrades(false);
    }
  }

  useEffect(() => {
    loadGrades(filterCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourseId]);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMsg("");
    setSubmitError("");

    const student = students.find((u) => u.id === form.studentId);
    const profileId = student?.studentProfile?.id;
    if (!profileId) {
      setSubmitError(
        "Selected student does not have a registered student profile."
      );
      return;
    }
    if (!form.courseId || !form.examName || form.marks === "") {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profileId,
          courseId: form.courseId,
          examName: form.examName,
          marks: parseFloat(form.marks),
          maxMarks: parseFloat(form.maxMarks) || 100,
          grade: form.grade || undefined,
          remarks: form.remarks || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitMsg("Grade added successfully.");
      setForm({
        studentId: "",
        courseId: "",
        examName: "",
        marks: "",
        maxMarks: "100",
        grade: "",
        remarks: "",
      });
      loadGrades(filterCourseId);
    } catch {
      setSubmitError("Failed to add grade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const studentsWithProfile = students.filter((u) => u.studentProfile);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
      </div>

      {/* ── Add Grade Form ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Add Grade</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={form.studentId}
                onChange={(e) => setField("studentId", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student</option>
                {studentsWithProfile.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} — {u.studentProfile!.class}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={form.courseId}
                onChange={(e) => setField("courseId", e.target.value)}
                required
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

            {/* Exam Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Unit Test 1, Mid Term"
                value={form.examName}
                onChange={(e) => setField("examName", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Grade */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Grade (e.g., A, B+)
              </label>
              <input
                type="text"
                placeholder="A"
                value={form.grade}
                onChange={(e) => setField("grade", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Marks */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Marks Obtained <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="85"
                value={form.marks}
                onChange={(e) => setField("marks", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Marks */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Max Marks
              </label>
              <input
                type="number"
                min={1}
                step="0.1"
                value={form.maxMarks}
                onChange={(e) => setField("maxMarks", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Remarks (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any remarks..."
              value={form.remarks}
              onChange={(e) => setField("remarks", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Add Grade
            </button>
            {submitMsg && (
              <span className="text-green-600 text-sm font-medium">
                {submitMsg}
              </span>
            )}
            {submitError && (
              <span className="text-red-600 text-sm">{submitError}</span>
            )}
          </div>
        </form>
      </div>

      {/* ── Grades Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">All Grades</h2>
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
        </div>

        {loadingGrades ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : grades.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-8">
            No grades recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Exam</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Percentage</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((g) => {
                  const pct = (g.marks / g.maxMarks) * 100;
                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">
                          {g.student.user.firstName} {g.student.user.lastName}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">
                          {g.student.class}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {g.course.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {g.examName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {g.marks}/{g.maxMarks}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {g.grade ?? "—"}
                      </td>
                      <td className={`px-4 py-3 ${pctColor(pct)}`}>
                        {pct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                        {g.remarks ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(g.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
