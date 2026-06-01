'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, Calendar, FileText, TrendingUp,
  Bell, LogOut, CheckCircle, Download, Home, Menu,
  AlertTriangle, Pin, Wallet, X, ChevronDown, ChevronRight,
  Play, File, Video, Clock, ClipboardList
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface User { id: string; firstName: string; lastName: string; email: string; role: string; studentProfile?: { id: string } }
interface Course { id: string; name: string; description: string; targetClass: string; isActive: boolean; subjects: string; fee: number }
interface Enrollment { id: string; courseId: string; status: string; course: Course }
interface Assignment { id: string; title: string; description: string; dueDate: string | null; maxMarks: number; course: { name: string }; submissions?: { id: string }[] }
interface AttendanceRecord { id: string; date: string; status: string; course: { name: string } }
interface Grade { id: string; examName: string; marks: number; maxMarks: number; grade: string | null; course: { name: string }; createdAt: string }
interface Announcement { id: string; title: string; content: string; isPinned: boolean; targetRole: string; createdAt: string; faculty: { user: { firstName: string; lastName: string } } }
interface FeePayment { id: string; amountPaid: number; paymentDate: string; status: string; feeStructure: { amount: number; course: { name: string } } }
interface Material { id: string; title: string; description: string | null; fileUrl: string; fileType: string; createdAt: string }
interface VideoLecture { id: string; title: string; description: string | null; videoUrl: string; duration: number | null; topic: string | null }
interface Notification { id: string; title: string; message: string; isRead: boolean; createdAt: string }
interface Exam { id: string; subject: string; date: string; time: string; room: string | null; maxMarks: number; syllabus: string | null; batchId: string }

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <CheckCircle className="h-5 w-5" />{msg}
      <button onClick={onClose} className="ml-2"><X className="h-4 w-4" /></button>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

// ── Time ago helper ───────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentPortal() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toast, setToast] = useState('')

  // Data state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [fees, setFees] = useState<FeePayment[]>([])
  const [materials, setMaterials] = useState<Record<string, Material[]>>({})
  const [videos, setVideos] = useState<Record<string, VideoLecture[]>>({})
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [timetable, setTimetable] = useState<{ id: string; subject: string; dayOfWeek: string; startTime: string; endTime: string; room: string | null; faculty: { user: { firstName: string; lastName: string } } }[]>([])

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Exams state
  const [exams, setExams] = useState<Exam[]>([])
  const [examsLoading, setExamsLoading] = useState(false)
  const [examsError, setExamsError] = useState('')

  // Loading state
  const [loading, setLoading] = useState(true)
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  // Auth guard
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) { router.push('/portal/login'); return }
    const u: User = JSON.parse(raw)
    if (u.role !== 'STUDENT') { router.push('/portal/login'); return }
    setUser(u)
  }, [router])

  // Fetch notifications on mount when user is set
  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      setNotifLoading(true)
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}`)
        const data = await res.json()
        if (data.success) setNotifications(data.notifications || [])
      } catch (e) { console.error(e) }
      finally { setNotifLoading(false) }
    }
    fetchNotifications()
  }, [user])

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch data once user is set
  useEffect(() => {
    if (!user) return
    const sid = user.studentProfile?.id
    if (!sid) { setLoading(false); return }

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [enrRes, asnRes, attRes, grdRes, annRes, feeRes] = await Promise.all([
          fetch(`/api/course-enrollments?studentId=${sid}`),
          fetch(`/api/assignments?studentId=${sid}`),
          fetch(`/api/attendance?studentId=${sid}`),
          fetch(`/api/grades?studentId=${sid}`),
          fetch('/api/announcements?targetRole=all'),
          fetch(`/api/fees?type=payments&studentId=${sid}`),
        ])
        const [enrData, asnData, attData, grdData, annData, feeData] = await Promise.all([
          enrRes.json(), asnRes.json(), attRes.json(), grdRes.json(), annRes.json(), feeRes.json()
        ])
        if (enrData.success) setEnrollments(enrData.enrollments || [])
        if (asnData.success) setAssignments(asnData.assignments || [])
        if (attData.success) setAttendance(attData.attendance || [])
        if (grdData.success) setGrades(grdData.grades || [])
        if (annData.success) setAnnouncements(annData.announcements || [])
        if (feeData.success) setFees(feeData.payments || [])
        // Fetch timetable if batchId is available
        const batchId = (user as any)?.studentProfile?.batchId
        if (batchId) {
          const ttRes = await fetch(`/api/timetable?batchId=${batchId}`)
          const ttData = await ttRes.json()
          if (ttData.success) setTimetable(ttData.timetable || [])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [user])

  // Fetch exams when Exams tab is active
  useEffect(() => {
    if (activeTab !== 'exams' || !user) return
    const batchId = (user as any)?.studentProfile?.batchId
    if (!batchId) return
    const fetchExams = async () => {
      setExamsLoading(true)
      setExamsError('')
      try {
        const res = await fetch(`/api/admin/exams?batchId=${batchId}`)
        const data = await res.json()
        if (data.success) {
          const sorted = (data.exams || []).sort((a: Exam, b: Exam) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          setExams(sorted)
        } else {
          setExamsError('Failed to load exams.')
        }
      } catch (e) {
        setExamsError('Error loading exams.')
        console.error(e)
      }
      finally { setExamsLoading(false) }
    }
    fetchExams()
  }, [activeTab, user])

  const fetchCourseContent = async (courseId: string) => {
    if (materials[courseId] !== undefined) return
    try {
      const [matRes, vidRes] = await Promise.all([
        fetch(`/api/materials?courseId=${courseId}`),
        fetch(`/api/videos?courseId=${courseId}`),
      ])
      const [matData, vidData] = await Promise.all([matRes.json(), vidRes.json()])
      setMaterials(prev => ({ ...prev, [courseId]: matData.materials || [] }))
      setVideos(prev => ({ ...prev, [courseId]: vidData.videos || [] }))
    } catch (e) { console.error(e) }
  }

  const toggleCourse = (courseId: string) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return }
    setExpandedCourse(courseId)
    fetchCourseContent(courseId)
  }

  // Mark single notification as read
  const markNotifRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (e) { console.error(e) }
  }

  // Mark all notifications as read
  const markAllNotifRead = async () => {
    if (!user) return
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) { console.error(e) }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Computed stats
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0
  const pendingCount = assignments.filter(a => !a.submissions?.length).length
  const totalPaid = fees.filter(f => f.status === 'COMPLETED').reduce((s, f) => s + f.amountPaid, 0)
  const avgGrade = grades.length
    ? Math.round(grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length)
    : 0

  const getStatusBadge = (a: Assignment) => {
    if (!a.submissions?.length) return { label: 'Pending', cls: 'text-orange-600 bg-orange-50' }
    const s = a.submissions[0] as any
    if (s?.marks !== undefined && s?.marks !== null) return { label: 'Graded', cls: 'text-green-600 bg-green-50' }
    return { label: 'Submitted', cls: 'text-blue-600 bg-blue-50' }
  }

  const filteredAssignments = assignments.filter(a => {
    if (assignmentFilter === 'all') return true
    const badge = getStatusBadge(a).label.toLowerCase()
    return badge === assignmentFilter
  })

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'courses', icon: BookOpen, label: 'My Courses' },
    { id: 'assignments', icon: FileText, label: 'Assignments' },
    { id: 'attendance', icon: CheckCircle, label: 'Attendance' },
    { id: 'grades', icon: TrendingUp, label: 'Grades' },
    { id: 'announcements', icon: Bell, label: 'Announcements' },
    { id: 'fees', icon: Wallet, label: 'Fee Status' },
    { id: 'timetable', icon: Clock, label: 'Timetable' },
    { id: 'exams', icon: ClipboardList, label: 'Exams' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  // ── Render tabs ───────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div className="space-y-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )

    if (!user?.studentProfile?.id) return (
      <div className="bg-white rounded-xl p-10 text-center shadow-sm">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No student profile linked</h3>
        <p className="text-gray-500 mt-2">Contact admin to set up your profile.</p>
      </div>
    )

    switch (activeTab) {
      // ── Dashboard ──────────────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-blue-100 mt-1">Here is what is happening with your studies today.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'blue' },
                { label: 'Pending Assignments', value: pendingCount, icon: FileText, color: 'orange' },
                { label: 'Attendance', value: `${attendancePct}%`, icon: CheckCircle, color: 'green' },
                { label: 'Avg Score', value: `${avgGrade}%`, icon: TrendingUp, color: 'purple' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${s.color}-100 rounded-lg flex items-center justify-center shrink-0`}>
                    <s.icon className={`h-6 w-6 text-${s.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Enrolled courses mini list */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Enrolled Courses</h2>
                <button onClick={() => setActiveTab('courses')} className="text-blue-600 text-sm">View All</button>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.length === 0 && <p className="text-gray-500 col-span-2">No courses enrolled yet.</p>}
                {enrollments.slice(0, 4).map(e => (
                  <div key={e.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{e.course.name}</h3>
                    <p className="text-sm text-gray-500">{e.course.targetClass}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent announcements */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Recent Announcements</h2></div>
              <div className="p-5 space-y-3">
                {announcements.length === 0 && <p className="text-gray-500">No announcements.</p>}
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-start gap-3">
                    {a.isPinned && <Pin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── My Courses ────────────────────────────────────────────────────────
      case 'courses':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            {enrollments.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You are not enrolled in any courses yet.</p>
              </div>
            )}
            {enrollments.map(e => (
              <div key={e.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleCourse(e.course.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{e.course.name}</h3>
                      <p className="text-sm text-gray-500">{e.course.targetClass} &bull; {e.course.description?.slice(0, 60)}{e.course.description?.length > 60 ? '...' : ''}</p>
                    </div>
                  </div>
                  {expandedCourse === e.course.id ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                </button>
                {expandedCourse === e.course.id && (
                  <div className="border-t p-5 space-y-5">
                    {/* Materials */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2"><File className="h-4 w-4" /> Study Materials</h4>
                      {materials[e.course.id] === undefined ? (
                        <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                      ) : materials[e.course.id].length === 0 ? (
                        <p className="text-sm text-gray-500">No materials uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {materials[e.course.id].map(m => (
                            <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <Download className="h-4 w-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{m.title}</p>
                                <p className="text-xs text-gray-500 uppercase">{m.fileType}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Videos */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2"><Video className="h-4 w-4" /> Video Lectures</h4>
                      {videos[e.course.id] === undefined ? (
                        <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                      ) : videos[e.course.id].length === 0 ? (
                        <p className="text-sm text-gray-500">No videos uploaded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {videos[e.course.id].map(v => (
                            <a key={v.id} href={v.videoUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <Play className="h-4 w-4 text-green-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{v.title}</p>
                                {v.topic && <p className="text-xs text-gray-500">{v.topic}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Assignments for this course */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Assignments</h4>
                      {assignments.filter(a => (a as any).courseId === e.course.id || a.course?.name === e.course.name).length === 0
                        ? <p className="text-sm text-gray-500">No assignments for this course.</p>
                        : assignments.filter(a => (a as any).courseId === e.course.id || a.course?.name === e.course.name).map(a => {
                          const badge = getStatusBadge(a)
                          return (
                            <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                              <span className="font-medium text-gray-900 text-sm">{a.title}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )

      // ── Assignments ───────────────────────────────────────────────────────
      case 'assignments':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">Assignments</h2>
                <div className="flex gap-2">
                  {(['all', 'pending', 'submitted', 'graded'] as const).map(f => (
                    <button key={f} onClick={() => setAssignmentFilter(f)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${assignmentFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                {filteredAssignments.length === 0 && <p className="text-gray-500 text-center py-8">No assignments found.</p>}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Max Marks</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {filteredAssignments.map(a => {
                        const badge = getStatusBadge(a)
                        return (
                          <tr key={a.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">{a.title}</td>
                            <td className="py-3 text-gray-600">{a.course?.name}</td>
                            <td className="py-3 text-gray-600">{a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="py-3 text-gray-600">{a.maxMarks}</td>
                            <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${badge.cls}`}>{badge.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      // ── Attendance ────────────────────────────────────────────────────────
      case 'attendance':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Attendance</h2></div>
              <div className="p-5">
                {/* Circular progress */}
                <div className="flex items-center gap-6 mb-6 p-4 bg-green-50 rounded-xl">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16a34a" strokeWidth="3"
                        strokeDasharray={`${attendancePct} ${100 - attendancePct}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-700">{attendancePct}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Overall Attendance</p>
                    <p className="text-sm text-gray-600">Present: {presentCount} / {attendance.length} sessions</p>
                    <p className="text-sm text-gray-600">Absent: {attendance.filter(a => a.status === 'ABSENT').length}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {attendance.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-500">No attendance records found.</td></tr>}
                      {attendance.map(a => (
                        <tr key={a.id} className="border-b last:border-0">
                          <td className="py-3 text-gray-900">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 text-gray-600">{a.course?.name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                              a.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                              a.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {a.status === 'PRESENT' ? 'P' : a.status === 'ABSENT' ? 'A' : a.status === 'LATE' ? 'L' : 'E'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      // ── Grades ────────────────────────────────────────────────────────────
      case 'grades':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Grades &amp; Performance</h2>
                {grades.length > 0 && (
                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                    Average: <span className="font-semibold text-blue-700">{avgGrade}%</span>
                  </div>
                )}
              </div>
              <div className="p-5 overflow-x-auto">
                {grades.length === 0 && <p className="text-gray-500 text-center py-8">No grades recorded yet.</p>}
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Exam</th>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Marks</th>
                    <th className="pb-3 font-medium">%</th>
                    <th className="pb-3 font-medium">Grade</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {grades.map(g => {
                      const pct = Math.round((g.marks / g.maxMarks) * 100)
                      return (
                        <tr key={g.id} className="border-b last:border-0">
                          <td className="py-3 font-medium text-gray-900">{g.examName}</td>
                          <td className="py-3 text-gray-600">{g.course?.name}</td>
                          <td className="py-3 text-gray-600">{g.marks}/{g.maxMarks}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-600">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {g.grade || `${pct}%`}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">{new Date(g.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      // ── Announcements ─────────────────────────────────────────────────────
      case 'announcements':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Announcements</h2></div>
              <div className="p-5 space-y-4">
                {announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements.</p>}
                {announcements.map(a => (
                  <div key={a.id} className={`border rounded-xl p-4 ${a.isPinned ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      {a.isPinned && <Pin className="h-4 w-4 text-blue-500 mt-1 shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{a.title}</h3>
                          <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                        <p className="text-xs text-gray-400 mt-2">By {a.faculty?.user?.firstName} {a.faculty?.user?.lastName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── Fee Status ────────────────────────────────────────────────────────
      case 'fees':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Fee Status</h2></div>
              <div className="p-5">
                {fees.length === 0 && <p className="text-gray-500 text-center py-8">No fee records found.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-blue-700">&#8377;{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-2xl font-bold text-green-700">{fees.filter(f => f.status === 'COMPLETED').length}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-orange-700">{fees.filter(f => f.status === 'PENDING').length}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Amount Paid</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {fees.map(f => (
                        <tr key={f.id} className="border-b last:border-0">
                          <td className="py-3 font-medium text-gray-900">{f.feeStructure?.course?.name || '—'}</td>
                          <td className="py-3 text-gray-900">&#8377;{f.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="py-3 text-gray-500">{new Date(f.paymentDate).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 text-gray-500">{(f as any).paymentMethod || '—'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              f.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              f.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                            }`}>{f.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      // ── Timetable ─────────────────────────────────────────────────────────
      case 'timetable': {
        const fmt12 = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const batchId = (user as any)?.studentProfile?.batchId
        if (!batchId) return (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No batch assigned yet. Contact admin.</p>
          </div>
        )
        if (timetable.length === 0) return (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No timetable yet for your batch.</p>
          </div>
        )
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Timetable</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map(day => {
                const dayItems = timetable
                  .filter(e => e.dayOfWeek === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                return (
                  <div key={day} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-blue-50 border-b">
                      <h3 className="font-semibold text-blue-800 text-sm">{day}</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {dayItems.length === 0
                        ? <p className="text-xs text-gray-400 py-2 text-center">No classes</p>
                        : dayItems.map(e => (
                          <div key={e.id} className="border rounded-lg p-3">
                            <p className="text-xs text-gray-500">{fmt12(e.startTime)} – {fmt12(e.endTime)}</p>
                            <p className="font-semibold text-gray-900 text-sm mt-0.5">{e.subject}</p>
                            <p className="text-xs text-gray-500">by {e.faculty?.user?.firstName} {e.faculty?.user?.lastName}</p>
                            {e.room && <p className="text-xs text-gray-400 mt-0.5">Room {e.room}</p>}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      // ── Exams ─────────────────────────────────────────────────────────────
      case 'exams': {
        const batchId = (user as any)?.studentProfile?.batchId
        if (!batchId) return (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No batch assigned. Contact admin.</p>
          </div>
        )
        if (examsLoading) return (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>
        )
        if (examsError) return (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-500">{examsError}</p>
          </div>
        )
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Exams</h2>
            {exams.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming exams.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map(exam => (
                  <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 text-base">{exam.subject}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {new Date(exam.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{exam.time || '—'}</span>
                      </div>
                      {exam.room && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-gray-400 text-xs font-medium">Room</span>
                          <span>{exam.room}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-gray-400 text-xs font-medium">Max Marks</span>
                        <span className="font-semibold text-gray-800">{exam.maxMarks}</span>
                      </div>
                    </div>
                    {exam.syllabus && (
                      <div className="border-t pt-2">
                        <p className="text-xs text-gray-500 font-medium mb-1">Syllabus</p>
                        <p className="text-sm text-gray-700">{exam.syllabus}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <div><p className="font-bold text-sm">Sarthak Group</p><p className="text-xs text-slate-400">Student Portal</p></div>}
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'} ${activeTab === item.id ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
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
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-4 space-y-3">
                        {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-sm">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => markNotifRead(n.id)}
                          className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 truncate ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
