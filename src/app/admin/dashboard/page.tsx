"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  CalendarCheck,
  Bell,
  RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Stats {
  totalEnrollments: number;
  pendingEnrollments: number;
  activeStudents: number;
  unresolvedMessages: number;
}

interface Enrollment {
  id: string;
  studentName: string;
  course: string;
  class: string;
  createdAt: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "COMPLETED";
}

interface ContactMessage {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
}

interface DashboardData {
  stats: Stats;
  recentEnrollments: Enrollment[];
  recentMessages: ContactMessage[];
}

// ── Status badge helper ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Enrollment["status"] }) {
  const map: Record<Enrollment["status"], string> = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    ACTIVE:    "bg-green-100  text-green-700",
    REJECTED:  "bg-red-100    text-red-700",
    COMPLETED: "bg-blue-100   text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-7 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Format date helper ─────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData({
        stats: json.stats,
        recentEnrollments: json.recentEnrollments,
        recentMessages: json.recentMessages,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ── Stats card config ────────────────────────────────────────────────────
  const statCards = data
    ? [
        {
          label: "Total Enrollments",
          value: data.stats.totalEnrollments,
          icon: Users,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          label: "Pending Approvals",
          value: data.stats.pendingEnrollments,
          icon: ClipboardList,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
        },
        {
          label: "Active Students",
          value: data.stats.activeStudents,
          icon: GraduationCap,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
        },
        {
          label: "Unresolved Messages",
          value: data.stats.unresolvedMessages,
          icon: MessageSquare,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
        },
      ]
    : [];

  // ── Quick actions ────────────────────────────────────────────────────────
  const quickActions = [
    { label: "Review Enrollments", href: "/admin/enrollments", icon: ClipboardList },
    { label: "Mark Attendance",    href: "/admin/attendance",  icon: CalendarCheck  },
    { label: "Post Announcement",  href: "/admin/announcements", icon: Bell         },
    { label: "View Messages",      href: "/admin/messages",    icon: MessageSquare  },
  ];

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 text-sm">Failed to load dashboard data</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of institute operations
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <Icon className="w-4 h-4 text-gray-500" />
            {label}
          </Link>
        ))}
      </div>

      {/* Bottom grid: recent enrollments + recent messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollment Requests */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Enrollment Requests
            </h2>
            <Link
              href="/admin/enrollments"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          ) : !data || data.recentEnrollments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No enrollment requests yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Student
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Course
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                      Class
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentEnrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {e.studentName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">
                        {e.course}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell whitespace-nowrap">
                        {e.class}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {fmtDate(e.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Messages
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          ) : !data || data.recentMessages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No messages yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Message
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentMessages.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                        <span title={m.message}>
                          {m.message.length > 60
                            ? m.message.slice(0, 60) + "…"
                            : m.message}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {fmtDate(m.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.isResolved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {m.isResolved ? "Resolved" : "Pending"}
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
    </div>
  );
}
