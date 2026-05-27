"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  X,
  RefreshCw,
  Mail,
  Phone,
  BadgeCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface FacultyProfile {
  id: string;
  qualification: string;
  subjects: string; // JSON string
  experienceYears: number;
  bio: string | null;
  isOwner: boolean;
}

interface FacultyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  facultyProfile: FacultyProfile | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSubjects(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [String(parsed)];
  } catch {
    return raw ? [raw] : [];
  }
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-rose-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    qualification: "",
    subjects: "",
    experienceYears: "",
    bio: "",
    isOwner: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitError, setSubmitError] = useState("");

  async function loadFaculty() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=FACULTY");
      const data = await res.json();
      setFaculty(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  function setField(key: keyof typeof form, value: string | boolean) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMsg("");
    setSubmitError("");

    const subjectsArray = form.subjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.qualification || subjectsArray.length === 0) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: "FACULTY",
          qualification: form.qualification,
          subjects: subjectsArray,
          experienceYears: form.experienceYears
            ? parseInt(form.experienceYears)
            : 0,
          bio: form.bio || undefined,
          isOwner: form.isOwner,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to add faculty.");
        return;
      }
      setSubmitMsg("Faculty member added successfully.");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        qualification: "",
        subjects: "",
        experienceYears: "",
        bio: "",
        isOwner: false,
      });
      loadFaculty();
      setTimeout(() => {
        setShowModal(false);
        setSubmitMsg("");
      }, 1500);
    } catch {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(user: FacultyUser) {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setFaculty((prev) =>
          prev.map((f) => (f.id === user.id ? { ...f, isActive: data.user.isActive } : f))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setSubmitMsg("");
            setSubmitError("");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
        </div>
      ) : faculty.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm italic">
          No faculty members found. Add one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {faculty.map((f) => {
            const profile = f.facultyProfile;
            const subjects = profile ? parseSubjects(profile.subjects) : [];
            const color = avatarColor(f.firstName + f.lastName);

            return (
              <div
                key={f.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4"
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}
                  >
                    <span className="text-white font-bold text-sm">
                      {initials(f.firstName, f.lastName)}
                    </span>
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">
                        {f.firstName} {f.lastName}
                      </span>
                      {profile?.isOwner && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex-shrink-0">
                          <BadgeCheck className="w-3 h-3" />
                          Owner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{f.email}</span>
                    </div>
                    {f.phone && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {f.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile details */}
                {profile && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Qualification:</span>{" "}
                      {profile.qualification}
                    </p>
                    {profile.experienceYears > 0 && (
                      <p className="text-xs text-gray-500">
                        {profile.experienceYears} year
                        {profile.experienceYears !== 1 ? "s" : ""} experience
                      </p>
                    )}
                    {subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status + toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {f.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleActive(f)}
                    disabled={togglingId === f.id}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                    title={f.isActive ? "Deactivate" : "Activate"}
                  >
                    {togglingId === f.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : f.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                    {f.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Faculty Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">
                Add Faculty Member
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ravi"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sharma"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="faculty@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Experience Years */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="5"
                    value={form.experienceYears}
                    onChange={(e) =>
                      setField("experienceYears", e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="M.Sc. Mathematics"
                  value={form.qualification}
                  onChange={(e) => setField("qualification", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subjects */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Subjects (comma-separated){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Mathematics, Physics, Chemistry"
                  value={form.subjects}
                  onChange={(e) => setField("subjects", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Bio (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description about the faculty member..."
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Is Owner */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOwner}
                  onChange={(e) => setField("isOwner", e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-600">
                  Mark as institute owner
                </span>
              </label>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  {submitMsg && (
                    <span className="text-green-600 text-sm font-medium">
                      {submitMsg}
                    </span>
                  )}
                  {submitError && (
                    <span className="text-red-600 text-sm">{submitError}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Faculty
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
