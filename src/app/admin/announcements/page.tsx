"use client";

import { useEffect, useState } from "react";
import { Bell, Pin, Trash2, RefreshCw, AlertCircle, Send } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type TargetRole = "all" | "STUDENT" | "PARENT";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  isPinned: boolean;
  createdAt: string;
  faculty: {
    id: string;
    user: { firstName: string; lastName: string };
  };
}

interface FacultyUser {
  id: string;
  firstName: string;
  lastName: string;
  facultyProfile: { id: string } | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const TARGET_LABELS: Record<string, string> = {
  all: "All",
  STUDENT: "Students",
  PARENT: "Parents",
};

const TARGET_BADGE: Record<string, string> = {
  all: "bg-gray-100 text-gray-600",
  STUDENT: "bg-blue-100 text-blue-700",
  PARENT: "bg-purple-100 text-purple-700",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [noFacultyMsg, setNoFacultyMsg] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<TargetRole>("all");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  /**
   * Resolve which facultyId to use for posting:
   * 1. Check if admin has a facultyProfile in localStorage (edge case).
   * 2. Otherwise fetch the first faculty member from the DB.
   * 3. If no faculty at all, show message.
   */
  async function resolveFacultyId(): Promise<string | null> {
    // Check localStorage for admin user — if they somehow have a facultyProfile
    try {
      const raw = localStorage.getItem("sarthak_admin");
      if (raw) {
        const admin = JSON.parse(raw);
        if (admin.facultyProfile?.id) return admin.facultyProfile.id;
      }
    } catch {
      // ignore
    }

    // Fetch faculty list
    const res = await fetch("/api/admin/users?role=FACULTY");
    const data = await res.json();
    const facultyUsers: FacultyUser[] = data.users || [];
    const withProfile = facultyUsers.find((u) => u.facultyProfile);
    if (withProfile?.facultyProfile?.id) {
      return withProfile.facultyProfile.id;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMsg("");
    setSubmitError("");
    setNoFacultyMsg(false);

    if (!title.trim() || !content.trim()) {
      setSubmitError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      const facultyId = await resolveFacultyId();
      if (!facultyId) {
        setNoFacultyMsg(true);
        return;
      }

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          facultyId,
          targetRole,
          isPinned,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitMsg("Announcement posted successfully.");
      setTitle("");
      setContent("");
      setTargetRole("all");
      setIsPinned(false);
      loadAnnouncements();
    } catch {
      setSubmitError("Failed to post announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      </div>

      {noFacultyMsg && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Please add at least one faculty member before posting announcements.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left 40%: New Announcement Form ─────────────────────────────── */}
        <div className="lg:w-2/5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              New Announcement
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Target Audience
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="PARENT">Parents Only</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-600">Pin this announcement</span>
              </label>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Post Announcement
                </button>
              </div>

              {submitMsg && (
                <p className="text-green-600 text-sm font-medium text-center">
                  {submitMsg}
                </p>
              )}
              {submitError && (
                <p className="text-red-600 text-sm text-center">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── Right 60%: Announcements List ────────────────────────────────── */}
        <div className="lg:w-3/5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            All Announcements
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({announcements.length})
            </span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm italic">
              No announcements yet.
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {a.isPinned && (
                        <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-gray-900 text-sm truncate">
                        {a.title}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${TARGET_BADGE[a.targetRole] ?? TARGET_BADGE.all}`}
                      >
                        {TARGET_LABELS[a.targetRole] ?? a.targetRole}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {a.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      Posted by{" "}
                      <span className="font-medium text-gray-500">
                        {a.faculty.user.firstName} {a.faculty.user.lastName}
                      </span>{" "}
                      &middot;{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete announcement"
                  >
                    {deletingId === a.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
