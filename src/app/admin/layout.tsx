"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  BarChart2,
  IndianRupee,
  Bell,
  MessageSquare,
  Users,
  Images,
  Clock,
  FileText,
  LogOut,
  Loader2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// ── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard",     href: "/admin/dashboard",     icon: LayoutDashboard },
  { label: "Enrollments",   href: "/admin/enrollments",   icon: ClipboardList   },
  { label: "Students",      href: "/admin/students",      icon: GraduationCap   },
  { label: "Courses",       href: "/admin/courses",       icon: BookOpen        },
  { label: "Attendance",    href: "/admin/attendance",    icon: CalendarCheck   },
  { label: "Grades",        href: "/admin/grades",        icon: BarChart2       },
  { label: "Fees",          href: "/admin/fees",          icon: IndianRupee     },
  { label: "Announcements", href: "/admin/announcements", icon: Bell            },
  { label: "Messages",      href: "/admin/messages",      icon: MessageSquare   },
  { label: "Faculty",       href: "/admin/faculty",       icon: Users           },
  { label: "Gallery",       href: "/admin/gallery",       icon: Images          },
  { label: "Timetable",    href: "/admin/timetable",    icon: Clock           },
  { label: "Exams",       href: "/admin/exams",        icon: FileText        },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({
  admin,
  onLogout,
}: {
  admin: AdminUser;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 flex flex-col z-30">
      {/* Logo / Institute name */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              Sarthak Group Tuition
            </p>
            <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="px-3 py-2 mb-3">
          <p className="text-slate-400 text-xs truncate">
            {admin.firstName} {admin.lastName}
          </p>
          <p className="text-slate-500 text-xs truncate">{admin.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── TopBar ─────────────────────────────────────────────────────────────────
function TopBar({ admin }: { admin: AdminUser }) {
  const now = new Date();
  const formatted = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <p className="text-sm font-medium text-gray-700">
        Welcome,{" "}
        <span className="text-gray-900 font-semibold">{admin.firstName}</span>
      </p>
      <p className="text-sm text-gray-500">{formatted}</p>
    </header>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    try {
      const raw = localStorage.getItem("sarthak_admin");
      if (!raw) throw new Error("no session");
      const parsed: AdminUser = JSON.parse(raw);
      if (parsed.role !== "ADMIN") throw new Error("not admin");
      setAdmin(parsed);
    } catch {
      router.replace("/admin/login");
      return;
    } finally {
      setChecking(false);
    }
  }, [router, isLoginPage]);

  function handleLogout() {
    localStorage.removeItem("sarthak_admin");
    router.push("/admin/login");
  }

  // Auth check loading screen
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Login page — render without sidebar/topbar
  if (isLoginPage) return <>{children}</>;

  // Guard: if auth failed, router.replace was already called
  if (!admin) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar admin={admin} onLogout={handleLogout} />
      <div className="flex-1 overflow-y-auto flex flex-col ml-64">
        <TopBar admin={admin} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
