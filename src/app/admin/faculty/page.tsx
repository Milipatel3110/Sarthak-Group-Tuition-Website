"use client";

import { useEffect, useState, useCallback } from "react";
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
  Edit2,
  Eye,
  Key,
  EyeOff,
  CheckCircle,
  XCircle,
  BookOpen,
  Briefcase,
  GraduationCap,
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

type ToastState = { message: string; type: "success" | "error" } | null;

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

// ── Module-level components (never defined inside other components) ────────────

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
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
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

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-40" />
        <div className="flex gap-1">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="h-5 bg-gray-100 rounded-full w-14" />
        <div className="h-5 bg-gray-100 rounded w-20" />
      </div>
    </div>
  );
}

// Subject tag chip with optional remove
function SubjectChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-blue-400 hover:text-blue-600 leading-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// Detail row used in the View modal
function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value || "—"}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-gray-50 px-3 py-1.5 rounded-lg mb-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
    </div>
  );
}

// ── View Detail Modal ─────────────────────────────────────────────────────────

interface ViewModalProps {
  faculty: FacultyUser;
  onClose: () => void;
  onEdit: () => void;
}

function ViewFacultyModal({ faculty, onClose, onEdit }: ViewModalProps) {
  const profile = faculty.facultyProfile;
  const subjects = profile ? parseSubjects(profile.subjects) : [];
  const color = avatarColor(faculty.firstName + faculty.lastName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}
            >
              <span className="text-white font-bold text-sm">
                {initials(faculty.firstName, faculty.lastName)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {faculty.firstName} {faculty.lastName}
                </p>
                {profile?.isOwner && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{faculty.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Personal */}
          <div>
            <SectionHeader title="Personal Details" />
            <div className="space-y-2">
              <DetailRow label="Full Name" value={`${faculty.firstName} ${faculty.lastName}`} />
              <DetailRow label="Email (Login)" value={faculty.email} />
              <DetailRow label="Phone" value={faculty.phone} />
              <DetailRow
                label="Status"
                value={faculty.isActive ? "Active" : "Inactive"}
              />
            </div>
          </div>

          {/* Professional */}
          {profile && (
            <div>
              <SectionHeader title="Professional Details" />
              <div className="space-y-2">
                <DetailRow label="Qualification" value={profile.qualification} />
                <DetailRow
                  label="Experience"
                  value={
                    profile.experienceYears > 0
                      ? `${profile.experienceYears} year${profile.experienceYears !== 1 ? "s" : ""}`
                      : undefined
                  }
                />
                {profile.bio && (
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">Bio</span>
                    <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <SectionHeader title="Subjects Taught" />
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <SubjectChip key={s} label={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit Faculty Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  faculty: FacultyUser;
  onClose: () => void;
  onSuccess: (updated: FacultyUser) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function EditFacultyModal({ faculty, onClose, onSuccess, onToast }: EditModalProps) {
  const profile = faculty.facultyProfile;
  const initialSubjects = profile ? parseSubjects(profile.subjects) : [];

  const [firstName, setFirstName] = useState(faculty.firstName);
  const [lastName, setLastName] = useState(faculty.lastName);
  const [phone, setPhone] = useState(faculty.phone ?? "");
  const [qualification, setQualification] = useState(profile?.qualification ?? "");
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [subjectInput, setSubjectInput] = useState("");
  const [experienceYears, setExperienceYears] = useState(
    String(profile?.experienceYears ?? "")
  );
  const [bio, setBio] = useState(profile?.bio ?? "");

  // Reset password section
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  function addSubject() {
    const val = subjectInput.trim();
    if (val && !subjects.includes(val)) {
      setSubjects((prev) => [...prev, val]);
    }
    setSubjectInput("");
  }

  function handleSubjectKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !qualification.trim()) {
      onToast("First name, last name, and qualification are required.", "error");
      return;
    }
    if (subjects.length === 0) {
      onToast("Add at least one subject.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: faculty.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          qualification: qualification.trim(),
          subjects,
          experienceYears: experienceYears ? parseInt(experienceYears) : 0,
          bio: bio.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update faculty.");
      onToast("Faculty updated successfully.", "success");
      onSuccess(data.user as FacultyUser);
      onClose();
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "An error occurred.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword.trim()) {
      onToast("Enter a new password.", "error");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/students/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: faculty.id,
          email: faculty.email,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");
      onToast("Password reset successfully.", "success");
      setNewPassword("");
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "An error occurred.", "error");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Edit Faculty Member</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Personal */}
          <div>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email{" "}
                  <span className="text-gray-400 font-normal">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={faculty.email}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <SectionHeader title="Professional Details" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="M.Sc. Mathematics"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Subjects tag input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subjects <span className="text-red-500">*</span>
                </label>
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {subjects.map((s) => (
                      <SubjectChip key={s} label={s} onRemove={() => removeSubject(s)} />
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={handleSubjectKeyDown}
                    placeholder="Type a subject and press Enter or Add"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Bio{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description about this faculty member..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Reset Password */}
          <div>
            <SectionHeader title="Reset Password" />
            <p className="text-xs text-gray-500 mb-3">
              Set a new login password for this faculty member.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={pwLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-60 font-medium transition"
              >
                <Key className="w-3.5 h-3.5" />
                {pwLoading ? "Saving..." : "Reset"}
              </button>
            </div>
          </div>
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
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium transition"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Faculty Modal ─────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function AddFacultyModal({ onClose, onSuccess, onToast }: AddModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addSubject() {
    const val = subjectInput.trim();
    if (val && !subjects.includes(val)) {
      setSubjects((prev) => [...prev, val]);
    }
    setSubjectInput("");
  }

  function handleSubjectKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !qualification.trim()) {
      onToast("Please fill in all required fields.", "error");
      return;
    }
    if (subjects.length === 0) {
      onToast("Add at least one subject.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role: "FACULTY",
          qualification: qualification.trim(),
          subjects,
          experienceYears: experienceYears ? parseInt(experienceYears) : 0,
          bio: bio.trim() || undefined,
          isOwner,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add faculty.");
      onToast("Faculty member added successfully.", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "An error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Add Faculty Member</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Personal */}
          <div>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ravi"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <SectionHeader title="Professional Details" />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="M.Sc. Mathematics"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subjects tag input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subjects <span className="text-red-500">*</span>
                </label>
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {subjects.map((s) => (
                      <SubjectChip key={s} label={s} onRemove={() => removeSubject(s)} />
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={handleSubjectKeyDown}
                    placeholder="Type a subject and press Enter or Add"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Bio{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description about the faculty member..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Is Owner */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-600">Mark as institute owner</span>
              </label>
            </div>
          </div>
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
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium transition"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? "Adding..." : "Add Faculty"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Faculty Card ──────────────────────────────────────────────────────────────

interface FacultyCardProps {
  f: FacultyUser;
  togglingId: string | null;
  onToggle: (f: FacultyUser) => void;
  onView: (f: FacultyUser) => void;
  onEdit: (f: FacultyUser) => void;
}

function FacultyCard({ f, togglingId, onToggle, onView, onEdit }: FacultyCardProps) {
  const profile = f.facultyProfile;
  const subjects = profile ? parseSubjects(profile.subjects) : [];
  const color = avatarColor(f.firstName + f.lastName);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}
        >
          <span className="text-white font-bold text-sm">
            {initials(f.firstName, f.lastName)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onView(f)}
              className="font-semibold text-gray-900 hover:text-blue-600 transition truncate text-left"
            >
              {f.firstName} {f.lastName}
            </button>
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
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{profile.qualification}</span>
          </div>
          {profile.experienceYears > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>
                {profile.experienceYears} year{profile.experienceYears !== 1 ? "s" : ""} experience
              </span>
            </div>
          )}
          {subjects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
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
            </div>
          )}
        </div>
      )}

      {/* Actions + status */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 gap-2">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            f.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {f.isActive ? "Active" : "Inactive"}
        </span>

        <div className="flex items-center gap-1">
          {/* View button */}
          <button
            onClick={() => onView(f)}
            title="View details"
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          {/* Edit button */}
          <button
            onClick={() => onEdit(f)}
            title="Edit"
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {/* Toggle active */}
          <button
            onClick={() => onToggle(f)}
            disabled={togglingId === f.id}
            title={f.isActive ? "Deactivate" : "Activate"}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition px-1.5 py-1 rounded-lg hover:bg-gray-50"
          >
            {togglingId === f.id ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : f.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-500" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [viewingFaculty, setViewingFaculty] = useState<FacultyUser | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<FacultyUser | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => setToast({ message, type }),
    []
  );

  const loadFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=FACULTY");
      const data = await res.json();
      setFaculty(data.users || []);
    } catch {
      showToast("Failed to load faculty members.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

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
        showToast(
          data.user.isActive ? "Faculty activated." : "Faculty deactivated.",
          "success"
        );
      } else {
        showToast(data.error || "Failed to update status.", "error");
      }
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  function handleEditSuccess(updated: FacultyUser) {
    setFaculty((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
          {!loading && (
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              {faculty.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : faculty.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm italic">
            No faculty members found. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {faculty.map((f) => (
            <FacultyCard
              key={f.id}
              f={f}
              togglingId={togglingId}
              onToggle={toggleActive}
              onView={setViewingFaculty}
              onEdit={setEditingFaculty}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <AddFacultyModal
          onClose={() => setShowAdd(false)}
          onSuccess={loadFaculty}
          onToast={showToast}
        />
      )}

      {viewingFaculty && (
        <ViewFacultyModal
          faculty={viewingFaculty}
          onClose={() => setViewingFaculty(null)}
          onEdit={() => {
            setEditingFaculty(viewingFaculty);
            setViewingFaculty(null);
          }}
        />
      )}

      {editingFaculty && (
        <EditFacultyModal
          faculty={editingFaculty}
          onClose={() => setEditingFaculty(null)}
          onSuccess={handleEditSuccess}
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
