'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, Users, FileText, Bell,
  LogOut, Menu, X, CheckCircle, Shield, Search,
  BarChart3, MessageSquare, Image, AlertTriangle, Pin, Plus
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface User { id: string; firstName: string; lastName: string; email: string; role: string }

interface Stats {
  totalEnrollments: number; pendingEnrollments: number; activeStudents: number
  totalCourses: number; unresolvedMessages: number; totalAnnouncements: number
}
interface Enrollment {
  id: string; studentName: string; parentName: string; email: string; phone: string
  class: string; medium: string; course: string; status: string; createdAt: string
}
interface ContactMsg { id: string; name: string; email: string; phone?: string; message: string; isResolved: boolean; createdAt: string }

interface AdminUser {
  id: string; firstName: string; lastName: string; email: string; role: string
  isActive: boolean; createdAt: string
  studentProfile?: { id: string; class: string }
  facultyProfile?: { id: string; subjects: string; qualification: string }
}
interface Course {
  id: string; name: string; targetClass: string; description: string; fee: number
  duration: string; isActive: boolean; subjects: string; createdAt: string
}
interface Announcement {
  id: string; title: string; content: string; isPinned: boolean; targetRole: string
  createdAt: string; faculty: { user: { firstName: string; lastName: string } }
}
interface CourseEnrollment {
  id: string; status: string; enrollmentDate: string
  student: { id: string; user: { firstName: string; lastName: string } }
  course: { id: string; name: string }
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }: { msg: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      <CheckCircle className="h-5 w-5" />{msg}
      <button onClick={onClose} className="ml-2"><X className="h-4 w-4" /></button>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminPortal() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(true)

  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([])
  const [recentMessages, setRecentMessages] = useState<ContactMsg[]>([])

  // Students / Faculty
  const [students, setStudents] = useState<AdminUser[]>([])
  const [faculty, setFaculty] = useState<AdminUser[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [facultySearch, setFacultySearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  // Courses
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  // Enrollments
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading] = useState(false)
  const [showAnnModal, setShowAnnModal] = useState(false)
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetRole: 'all', isPinned: false })
  const [annSubmitting, setAnnSubmitting] = useState(false)

  // Messages
  const [messages, setMessages] = useState<ContactMsg[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)

  // Auth guard
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) { router.push('/portal/login'); return }
    const u: User = JSON.parse(raw)
    if (u.role !== 'ADMIN') { router.push('/portal/login'); return }
    setUser(u)
    fetchDashboard()
  }, [router])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type)
  }

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setRecentEnrollments(data.recentEnrollments || [])
        setRecentMessages(data.recentMessages || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Lazy load tabs
  useEffect(() => {
    if (activeTab === 'students' && students.length === 0) {
      setUsersLoading(true)
      fetch('/api/admin/users?role=STUDENT').then(r => r.json()).then(d => {
        if (d.success) setStudents(d.users || [])
      }).catch(console.error).finally(() => setUsersLoading(false))
    }
    if (activeTab === 'faculty' && faculty.length === 0) {
      setUsersLoading(true)
      fetch('/api/admin/users?role=FACULTY').then(r => r.json()).then(d => {
        if (d.success) setFaculty(d.users || [])
      }).catch(console.error).finally(() => setUsersLoading(false))
    }
    if (activeTab === 'courses' && courses.length === 0) {
      setCoursesLoading(true)
      fetch('/api/courses').then(r => r.json()).then(d => {
        if (d.success) setCourses(d.courses || [])
      }).catch(console.error).finally(() => setCoursesLoading(false))
    }
    if (activeTab === 'enrollments' && enrollments.length === 0) {
      setEnrollmentsLoading(true)
      fetch('/api/course-enrollments').then(r => r.json()).then(d => {
        if (d.success) setEnrollments(d.enrollments || [])
      }).catch(console.error).finally(() => setEnrollmentsLoading(false))
    }
    if (activeTab === 'announcements' && announcements.length === 0) {
      setAnnLoading(true)
      fetch('/api/announcements').then(r => r.json()).then(d => {
        if (d.success) setAnnouncements(d.announcements || [])
      }).catch(console.error).finally(() => setAnnLoading(false))
    }
    if (activeTab === 'messages' && messages.length === 0) {
      setMsgsLoading(true)
      fetch('/api/contact').then(r => r.json()).then(d => {
        if (d.success) setMessages(d.messages || [])
      }).catch(console.error).finally(() => setMsgsLoading(false))
    }
  }, [activeTab])

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStudents(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u))
      setFaculty(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u))
      showToast(`User ${!isActive ? 'activated' : 'deactivated'}!`)
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const updateEnrollmentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/course-enrollments?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e))
      showToast(`Enrollment ${status.toLowerCase()}!`)
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const createAnnouncement = async () => {
    if (!annForm.title || !annForm.content) { showToast('Fill all fields', 'error'); return }
    // Need a facultyId — use first available faculty or skip
    setAnnSubmitting(true)
    try {
      // Try to get any faculty id
      let fid = ''
      if (faculty.length === 0) {
        const r = await fetch('/api/admin/users?role=FACULTY')
        const d = await r.json()
        const f = d.users?.[0]
        if (f) fid = f.facultyProfile?.id || ''
      } else {
        fid = faculty[0]?.facultyProfile?.id || ''
      }
      if (!fid) { showToast('No faculty profile found to post as. Contact a faculty to post announcements.', 'error'); setAnnSubmitting(false); return }
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...annForm, facultyId: fid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnnouncements(prev => [data.announcement, ...prev])
      showToast('Announcement posted!')
      setShowAnnModal(false)
      setAnnForm({ title: '', content: '', targetRole: 'all', isPinned: false })
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setAnnSubmitting(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'faculty', icon: GraduationCap, label: 'Faculty' },
    { id: 'courses', icon: BookOpen, label: 'Courses' },
    { id: 'enrollments', icon: FileText, label: 'Enrollments' },
    { id: 'announcements', icon: Bell, label: 'Announcements' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'gallery', icon: Image, label: 'Gallery' },
  ]

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase())
  )
  const filteredFaculty = faculty.filter(f =>
    `${f.firstName} ${f.lastName} ${f.email}`.toLowerCase().includes(facultySearch.toLowerCase())
  )

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-orange-100 text-orange-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
    }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  const renderContent = () => {
    switch (activeTab) {
      // ── Dashboard ──────────────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-300 mt-1">Manage Sarthak Group Tuition efficiently.</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Students', value: stats?.activeStudents || 0, icon: Users, color: 'blue' },
                  { label: 'Active Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'green' },
                  { label: 'Pending Enrollments', value: stats?.pendingEnrollments || 0, icon: FileText, color: 'orange' },
                  { label: 'Unresolved Messages', value: stats?.unresolvedMessages || 0, icon: MessageSquare, color: 'red' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
                    <div className={`w-11 h-11 bg-${s.color}-100 rounded-lg flex items-center justify-center shrink-0`}>
                      <s.icon className={`h-5 w-5 text-${s.color}-600`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent enrollments */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-5 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Enrollments</h2>
                  <button onClick={() => setActiveTab('enrollments')} className="text-sm text-slate-600 hover:text-slate-800">View All</button>
                </div>
                <div className="p-5 space-y-3">
                  {loading && [1,2].map(i => <Skeleton key={i} className="h-14" />)}
                  {!loading && recentEnrollments.length === 0 && <p className="text-gray-500 text-sm">No enrollments yet.</p>}
                  {recentEnrollments.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{e.studentName}</p>
                        <p className="text-xs text-gray-500">{e.course} &bull; {e.class}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(e.status)}`}>{e.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent messages */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-5 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Messages</h2>
                  <button onClick={() => setActiveTab('messages')} className="text-sm text-slate-600 hover:text-slate-800">View All</button>
                </div>
                <div className="p-5 space-y-3">
                  {loading && [1,2].map(i => <Skeleton key={i} className="h-14" />)}
                  {!loading && recentMessages.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
                  {recentMessages.map(m => (
                    <div key={m.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${m.isResolved ? 'bg-gray-300' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{m.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      // ── Students ──────────────────────────────────────────────────────────
      case 'students':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Students</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-56" />
              </div>
            </div>
            <div className="p-5 overflow-x-auto">
              {usersLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {!usersLoading && (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Class</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredStudents.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No students found.</td></tr>}
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                        <td className="py-3 text-gray-600">{s.email}</td>
                        <td className="py-3 text-gray-500">{s.studentProfile?.class || '—'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button onClick={() => toggleUserActive(s.id, s.isActive)}
                            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${s.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )

      // ── Faculty ───────────────────────────────────────────────────────────
      case 'faculty':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Faculty</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={facultySearch}
                  onChange={e => setFacultySearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-56" />
              </div>
            </div>
            <div className="p-5 overflow-x-auto">
              {usersLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {!usersLoading && (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Subjects</th>
                    <th className="pb-3 font-medium">Qualification</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredFaculty.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No faculty found.</td></tr>}
                    {filteredFaculty.map(f => {
                      let subjectsArr: string[] = []
                      try { subjectsArr = JSON.parse(f.facultyProfile?.subjects || '[]') } catch { subjectsArr = [] }
                      return (
                        <tr key={f.id} className="border-b last:border-0">
                          <td className="py-3 font-medium text-gray-900">{f.firstName} {f.lastName}</td>
                          <td className="py-3 text-gray-600">{f.email}</td>
                          <td className="py-3 text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {subjectsArr.slice(0, 2).map((s: string, i: number) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{s}</span>
                              ))}
                              {subjectsArr.length > 2 && <span className="text-xs text-gray-400">+{subjectsArr.length - 2}</span>}
                            </div>
                          </td>
                          <td className="py-3 text-gray-500">{f.facultyProfile?.qualification || '—'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {f.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3">
                            <button onClick={() => toggleUserActive(f.id, f.isActive)}
                              className={`text-xs px-3 py-1 rounded-lg border transition-colors ${f.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                              {f.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )

      // ── Courses ───────────────────────────────────────────────────────────
      case 'courses':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Courses</h2></div>
            <div className="p-5">
              {coursesLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>}
              {!coursesLoading && courses.length === 0 && <p className="text-gray-500 text-center py-8">No courses found.</p>}
              {!coursesLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {courses.map(c => {
                    let subjectsArr: string[] = []
                    try { subjectsArr = JSON.parse(c.subjects || '[]') } catch { subjectsArr = [] }
                    return (
                      <div key={c.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{c.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{c.targetClass} &bull; {c.duration}</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">&#8377;{c.fee.toLocaleString('en-IN')}</p>
                        {subjectsArr.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {subjectsArr.slice(0, 3).map((s: string, i: number) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )

      // ── Enrollments ───────────────────────────────────────────────────────
      case 'enrollments':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Course Enrollments</h2></div>
            <div className="p-5 overflow-x-auto">
              {enrollmentsLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>}
              {!enrollmentsLoading && (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {enrollments.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No enrollments found.</td></tr>}
                    {enrollments.map(e => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{e.student?.user?.firstName} {e.student?.user?.lastName}</td>
                        <td className="py-3 text-gray-600">{e.course?.name}</td>
                        <td className="py-3 text-gray-500">{new Date(e.enrollmentDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(e.status)}`}>{e.status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {e.status !== 'ACTIVE' && (
                              <button onClick={() => updateEnrollmentStatus(e.id, 'ACTIVE')}
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100">
                                Approve
                              </button>
                            )}
                            {e.status !== 'CANCELLED' && (
                              <button onClick={() => updateEnrollmentStatus(e.id, 'CANCELLED')}
                                className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )

      // ── Announcements ─────────────────────────────────────────────────────
      case 'announcements':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Announcements</h2>
              <button onClick={() => setShowAnnModal(true)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />Post
              </button>
            </div>
            <div className="p-5 space-y-4">
              {annLoading && <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20" />)}</div>}
              {!annLoading && announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements.</p>}
              {announcements.map(a => (
                <div key={a.id} className={`border rounded-xl p-4 ${a.isPinned ? 'border-slate-300 bg-slate-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {a.isPinned && <Pin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />}
                      <div>
                        <h3 className="font-semibold text-gray-900">{a.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {a.faculty?.user?.firstName} {a.faculty?.user?.lastName} &bull; {new Date(a.createdAt).toLocaleDateString('en-IN')} &bull; {a.targetRole}
                        </p>
                      </div>
                    </div>
                    {a.isPinned && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full ml-2 shrink-0">Pinned</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      // ── Messages ──────────────────────────────────────────────────────────
      case 'messages':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Contact Messages</h2></div>
            <div className="p-5">
              {msgsLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>}
              {!msgsLoading && messages.length === 0 && <p className="text-gray-500 text-center py-8">No messages.</p>}
              <div className="space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={`border rounded-xl p-4 ${m.isResolved ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${m.isResolved ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                            {m.isResolved ? 'Resolved' : 'Open'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                        <p className="text-sm text-gray-700 mt-2">{m.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── Gallery ───────────────────────────────────────────────────────────
      case 'gallery':
        return (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Gallery Management</h3>
            <p className="text-gray-500 mt-2">Manage the gallery from the dedicated gallery page.</p>
            <a href="/admin/gallery" className="mt-4 inline-block bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 text-sm">
              Go to Gallery
            </a>
          </div>
        )

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && <Toast msg={toast} type={toastType} onClose={() => setToast('')} />}

      {/* Create Announcement Modal */}
      {showAnnModal && (
        <Modal title="Post Announcement" onClose={() => setShowAnnModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea rows={4} value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select value={annForm.targetRole} onChange={e => setAnnForm(p => ({ ...p, targetRole: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                  <option value="all">All</option>
                  <option value="STUDENT">Students</option>
                  <option value="PARENT">Parents</option>
                  <option value="FACULTY">Faculty</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={annForm.isPinned} onChange={e => setAnnForm(p => ({ ...p, isPinned: e.target.checked }))}
                    className="w-4 h-4" />
                  Pin it
                </label>
              </div>
            </div>
            <button onClick={createAnnouncement} disabled={annSubmitting}
              className="w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-700 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 text-sm">
              <Bell className="h-4 w-4" />{annSubmitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </Modal>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <div><p className="font-bold text-sm">Sarthak Group</p><p className="text-xs text-slate-400">Admin Portal</p></div>}
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'} ${activeTab === item.id ? 'bg-red-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-slate-800 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 flex flex-col min-h-screen`}>
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-700 font-semibold text-sm">A</span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
