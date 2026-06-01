'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, Calendar, FileText, Users,
  Bell, LogOut, CheckCircle, Upload, BarChart3, Video,
  Home, Plus, Edit, X, TrendingUp, FolderOpen, Menu,
  Save, AlertTriangle, Clock
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface User {
  id: string; firstName: string; lastName: string; email: string; role: string
  facultyProfile?: { id: string }
}
interface Course { id: string; name: string; targetClass: string; description: string; isActive: boolean }
interface Assignment { id: string; title: string; description: string; dueDate: string | null; maxMarks: number; course: { name: string }; submissions: unknown[] }
interface Enrollment { id: string; student: { id: string; user: { firstName: string; lastName: string } } }
interface ScheduleEntry { id: string; dayOfWeek: string; startTime: string; endTime: string; subject: string; roomNumber: string | null; course: { name: string } }
interface Announcement { id: string; title: string; content: string; isPinned: boolean; targetRole: string; createdAt: string }
interface Material { id: string; title: string; description: string | null; fileUrl: string; fileType: string; course: { name: string }; createdAt: string }

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function FacultyPortal() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(true)

  // Data
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [facultyTimetable, setFacultyTimetable] = useState<{ id: string; subject: string; dayOfWeek: string; startTime: string; endTime: string; room: string | null; batch?: { name: string; standard: string; medium: string }; faculty: { user: { firstName: string; lastName: string } } }[]>([])

  // Attendance
  const [attCourseId, setAttCourseId] = useState('')
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attStatus, setAttStatus] = useState<Record<string, string>>({})
  const [attLoading, setAttLoading] = useState(false)
  const [attSubmitting, setAttSubmitting] = useState(false)

  // Grades form
  const [grdCourseId, setGrdCourseId] = useState('')
  const [grdExam, setGrdExam] = useState('')
  const [grdEnrollments, setGrdEnrollments] = useState<Enrollment[]>([])
  const [grdMarks, setGrdMarks] = useState<Record<string, string>>({})
  const [grdMaxMarks, setGrdMaxMarks] = useState('100')
  const [grdLoading, setGrdLoading] = useState(false)
  const [grdSubmitting, setGrdSubmitting] = useState(false)

  // Modals
  const [showAsnModal, setShowAsnModal] = useState(false)
  const [showMatModal, setShowMatModal] = useState(false)
  const [showAnnModal, setShowAnnModal] = useState(false)

  // Forms
  const [asnForm, setAsnForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxMarks: '100' })
  const [matForm, setMatForm] = useState({ courseId: '', title: '', description: '', fileUrl: '', fileType: 'pdf' })
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetRole: 'all', isPinned: false })
  const [submitting, setSubmitting] = useState(false)

  // Auth guard
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) { router.push('/portal/login'); return }
    const u: User = JSON.parse(raw)
    if (u.role !== 'FACULTY') { router.push('/portal/login'); return }
    setUser(u)
    setFacultyId(u.facultyProfile?.id || null)
  }, [router])

  // Fetch data
  useEffect(() => {
    if (!facultyId) { setLoading(false); return }
    const fetch1 = async () => {
      setLoading(true)
      try {
        const [crsRes, asnRes, schRes, annRes, matRes] = await Promise.all([
          fetch(`/api/courses`),
          fetch(`/api/assignments?facultyId=${facultyId}`),
          fetch(`/api/schedule?facultyId=${facultyId}`),
          fetch(`/api/announcements?facultyId=${facultyId}`),
          fetch(`/api/materials?facultyId=${facultyId}`),
        ])
        const [crsData, asnData, schData, annData, matData] = await Promise.all([
          crsRes.json(), asnRes.json(), schRes.json(), annRes.json(), matRes.json()
        ])
        if (crsData.success) setCourses(crsData.courses || [])
        if (asnData.success) setAssignments(asnData.assignments || [])
        if (schData.success) setSchedule(schData.schedule || [])
        if (annData.success) setAnnouncements(annData.announcements || [])
        if (matData.success) setMaterials(matData.materials || [])
        // Fetch timetable for this faculty
        const ttRes = await fetch(`/api/timetable?facultyId=${facultyId}`)
        const ttData = await ttRes.json()
        if (ttData.success) setFacultyTimetable(ttData.timetable || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch1()
  }, [facultyId])

  // Load attendance students
  useEffect(() => {
    if (!attCourseId) { setEnrollments([]); setAttStatus({}); return }
    const load = async () => {
      setAttLoading(true)
      try {
        const res = await fetch(`/api/course-enrollments?courseId=${attCourseId}`)
        const data = await res.json()
        const enr: Enrollment[] = data.enrollments || []
        setEnrollments(enr)
        const init: Record<string, string> = {}
        enr.forEach(e => { init[e.student.id] = 'PRESENT' })
        setAttStatus(init)
      } catch (e) { console.error(e) }
      finally { setAttLoading(false) }
    }
    load()
  }, [attCourseId])

  // Load grade students
  useEffect(() => {
    if (!grdCourseId) { setGrdEnrollments([]); setGrdMarks({}); return }
    const load = async () => {
      setGrdLoading(true)
      try {
        const res = await fetch(`/api/course-enrollments?courseId=${grdCourseId}`)
        const data = await res.json()
        const enr: Enrollment[] = data.enrollments || []
        setGrdEnrollments(enr)
        const init: Record<string, string> = {}
        enr.forEach(e => { init[e.student.id] = '' })
        setGrdMarks(init)
      } catch (e) { console.error(e) }
      finally { setGrdLoading(false) }
    }
    load()
  }, [grdCourseId])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type)
  }

  const submitAttendance = async () => {
    if (!attCourseId || enrollments.length === 0) return
    setAttSubmitting(true)
    try {
      await Promise.all(enrollments.map(e =>
        fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: e.student.id, courseId: attCourseId, date: attDate, status: attStatus[e.student.id] || 'PRESENT' }),
        })
      ))
      showToast('Attendance marked successfully!')
    } catch { showToast('Error submitting attendance', 'error') }
    finally { setAttSubmitting(false) }
  }

  const submitGrades = async () => {
    if (!grdCourseId || !grdExam) { showToast('Please select course and enter exam name', 'error'); return }
    setGrdSubmitting(true)
    try {
      const entries = Object.entries(grdMarks).filter(([, v]) => v !== '')
      await Promise.all(entries.map(([studentId, marksStr]) => {
        const marks = parseFloat(marksStr)
        const maxMarks = parseFloat(grdMaxMarks)
        const pct = (marks / maxMarks) * 100
        const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F'
        return fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, courseId: grdCourseId, examName: grdExam, marks, maxMarks: parseFloat(grdMaxMarks), grade }),
        })
      }))
      showToast(`Grades saved for ${entries.length} students!`)
      setGrdExam(''); setGrdMarks({})
    } catch { showToast('Error saving grades', 'error') }
    finally { setGrdSubmitting(false) }
  }

  const createAssignment = async () => {
    if (!asnForm.courseId || !asnForm.title || !facultyId) { showToast('Fill required fields', 'error'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asnForm, facultyId, maxMarks: parseInt(asnForm.maxMarks) || 100 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAssignments(prev => [data.assignment, ...prev])
      showToast('Assignment created!')
      setShowAsnModal(false)
      setAsnForm({ courseId: '', title: '', description: '', dueDate: '', maxMarks: '100' })
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSubmitting(false) }
  }

  const createMaterial = async () => {
    if (!matForm.courseId || !matForm.title || !matForm.fileUrl || !facultyId) { showToast('Fill required fields', 'error'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...matForm, facultyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMaterials(prev => [data.material, ...prev])
      showToast('Material added!')
      setShowMatModal(false)
      setMatForm({ courseId: '', title: '', description: '', fileUrl: '', fileType: 'pdf' })
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSubmitting(false) }
  }

  const createAnnouncement = async () => {
    if (!annForm.title || !annForm.content || !facultyId) { showToast('Fill required fields', 'error'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...annForm, facultyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnnouncements(prev => [data.announcement, ...prev])
      showToast('Announcement posted!')
      setShowAnnModal(false)
      setAnnForm({ title: '', content: '', targetRole: 'all', isPinned: false })
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSubmitting(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'courses', icon: BookOpen, label: 'My Courses' },
    { id: 'assignments', icon: FileText, label: 'Assignments' },
    { id: 'attendance', icon: CheckCircle, label: 'Attendance' },
    { id: 'grades', icon: TrendingUp, label: 'Grades' },
    { id: 'materials', icon: FolderOpen, label: 'Materials' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'announcements', icon: Bell, label: 'Announcements' },
    { id: 'timetable', icon: Clock, label: 'My Timetable' },
  ]

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const renderContent = () => {
    if (loading) return (
      <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
    )

    if (!facultyId) return (
      <div className="bg-white rounded-xl p-10 text-center shadow-sm">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No faculty profile found</h3>
        <p className="text-gray-500 mt-2">Contact admin to set up your profile.</p>
      </div>
    )

    switch (activeTab) {
      // ── Dashboard ──────────────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-green-100 mt-1">Here is your teaching overview for today.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Courses', value: courses.length, icon: BookOpen, color: 'blue' },
                { label: 'Assignments', value: assignments.length, icon: FileText, color: 'orange' },
                { label: 'Materials', value: materials.length, icon: FolderOpen, color: 'purple' },
                { label: "Today's Classes", value: schedule.filter(s => new Date().toLocaleDateString('en-US', { weekday: 'long' }) === s.dayOfWeek).length, icon: Calendar, color: 'green' },
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
            {/* Today's schedule */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Today&apos;s Schedule</h2></div>
              <div className="p-5 space-y-3">
                {(() => {
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                  const todayItems = schedule.filter(s => s.dayOfWeek === today)
                  if (todayItems.length === 0) return <p className="text-gray-500">No classes scheduled today.</p>
                  return todayItems.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{s.subject} — {s.course?.name}</p>
                        {s.roomNumber && <p className="text-xs text-gray-500">Room {s.roomNumber}</p>}
                      </div>
                      <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
            {/* Courses mini */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">My Courses</h2>
                <button onClick={() => setActiveTab('courses')} className="text-green-600 text-sm">View All</button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courses.slice(0, 6).map(c => (
                  <div key={c.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{c.targetClass}</p>
                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── My Courses ────────────────────────────────────────────────────────
      case 'courses':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">My Courses</h2></div>
            <div className="p-5">
              {courses.length === 0 && <p className="text-gray-500 text-center py-8">No courses found.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{c.targetClass}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      // ── Assignments ───────────────────────────────────────────────────────
      case 'assignments':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Assignments</h2>
                <button onClick={() => setShowAsnModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4" />Create
                </button>
              </div>
              <div className="p-5">
                {assignments.length === 0 && <p className="text-gray-500 text-center py-8">No assignments created yet.</p>}
                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{a.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{a.course?.name} &bull; Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-IN') : 'No due date'}</p>
                        <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{a.submissions?.length || 0} submissions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      // ── Attendance ────────────────────────────────────────────────────────
      case 'attendance':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Mark Attendance</h2></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                  <select value={attCourseId} onChange={e => setAttCourseId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.targetClass})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>
              {attLoading && <Skeleton className="h-32 w-full" />}
              {!attLoading && attCourseId && enrollments.length === 0 && (
                <p className="text-gray-500 text-center py-6">No students enrolled in this course.</p>
              )}
              {!attLoading && enrollments.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr></thead>
                      <tbody>
                        {enrollments.map(e => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">{e.student.user.firstName} {e.student.user.lastName}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                {['PRESENT', 'ABSENT', 'LATE'].map(s => (
                                  <button key={s} onClick={() => setAttStatus(prev => ({ ...prev, [e.student.id]: s }))}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${attStatus[e.student.id] === s
                                      ? s === 'PRESENT' ? 'bg-green-600 text-white' : s === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s[0]}</button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={submitAttendance} disabled={attSubmitting}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                    <Save className="h-4 w-4" />{attSubmitting ? 'Submitting...' : 'Submit Attendance'}
                  </button>
                </>
              )}
            </div>
          </div>
        )

      // ── Grades ────────────────────────────────────────────────────────────
      case 'grades':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Enter Grades</h2></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select value={grdCourseId} onChange={e => setGrdCourseId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.targetClass})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                  <input type="text" value={grdExam} onChange={e => setGrdExam(e.target.value)}
                    placeholder="e.g., Unit Test 1"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                  <input type="number" value={grdMaxMarks} onChange={e => setGrdMaxMarks(e.target.value)} min="1"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>
              {grdLoading && <Skeleton className="h-32 w-full" />}
              {!grdLoading && grdCourseId && grdEnrollments.length === 0 && (
                <p className="text-gray-500 text-center py-6">No students enrolled in this course.</p>
              )}
              {!grdLoading && grdEnrollments.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Marks (out of {grdMaxMarks})</th>
                      </tr></thead>
                      <tbody>
                        {grdEnrollments.map(e => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">{e.student.user.firstName} {e.student.user.lastName}</td>
                            <td className="py-3 w-40">
                              <input type="number" min="0" max={grdMaxMarks} placeholder="—"
                                value={grdMarks[e.student.id] || ''}
                                onChange={ev => setGrdMarks(prev => ({ ...prev, [e.student.id]: ev.target.value }))}
                                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={submitGrades} disabled={grdSubmitting}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                    <Save className="h-4 w-4" />{grdSubmitting ? 'Saving...' : 'Save Grades'}
                  </button>
                </>
              )}
            </div>
          </div>
        )

      // ── Materials ─────────────────────────────────────────────────────────
      case 'materials':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Study Materials</h2>
              <button onClick={() => setShowMatModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />Add Material
              </button>
            </div>
            <div className="p-5">
              {materials.length === 0 && <p className="text-gray-500 text-center py-8">No materials uploaded yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {materials.map(m => (
                  <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                    className="block border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <FolderOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{m.title}</h3>
                        <p className="text-xs text-gray-500">{m.course?.name} &bull; {m.fileType.toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )

      // ── Schedule ──────────────────────────────────────────────────────────
      case 'schedule':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">My Schedule</h2></div>
            <div className="p-5">
              {schedule.length === 0 && <p className="text-gray-500 text-center py-8">No schedule entries found.</p>}
              <div className="space-y-6">
                {DAYS.map(day => {
                  const dayItems = schedule.filter(s => s.dayOfWeek === day)
                  if (dayItems.length === 0) return null
                  return (
                    <div key={day}>
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm">{day}</h3>
                      <div className="space-y-2">
                        {dayItems.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{s.course?.name}{s.roomNumber ? ` · Room ${s.roomNumber}` : ''}</p>
                            </div>
                            <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">{s.startTime} – {s.endTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      // ── Announcements ─────────────────────────────────────────────────────
      case 'announcements':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Announcements</h2>
              <button onClick={() => setShowAnnModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />Post
              </button>
            </div>
            <div className="p-5 space-y-4">
              {announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements yet.</p>}
              {announcements.map(a => (
                <div key={a.id} className={`border rounded-xl p-4 ${a.isPinned ? 'border-green-200 bg-green-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString('en-IN')} · {a.targetRole}</p>
                    </div>
                    {a.isPinned && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full ml-4 shrink-0">Pinned</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      // ── My Timetable ──────────────────────────────────────────────────────
      case 'timetable': {
        const fmt12 = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
        const TT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">My Weekly Timetable</h2>
            {facultyTimetable.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No timetable entries found.</p>
              </div>
            )}
            {facultyTimetable.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TT_DAYS.map(day => {
                  const dayItems = facultyTimetable
                    .filter(e => e.dayOfWeek === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  return (
                    <div key={day} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="px-4 py-3 bg-green-50 border-b">
                        <h3 className="font-semibold text-green-800 text-sm">{day}</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {dayItems.length === 0
                          ? <p className="text-xs text-gray-400 py-2 text-center">No classes</p>
                          : dayItems.map(e => {
                            const batchLabel = e.batch ? `${e.batch.standard} ${e.batch.name}` : null
                            return (
                              <div key={e.id} className="border rounded-lg p-3">
                                <p className="text-xs text-gray-500">{fmt12(e.startTime)} – {fmt12(e.endTime)}</p>
                                <p className="font-semibold text-gray-900 text-sm mt-0.5">{e.subject}</p>
                                {batchLabel && (
                                  <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{batchLabel}</span>
                                )}
                                {e.room && <p className="text-xs text-gray-400 mt-0.5">Room {e.room}</p>}
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })}
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
      {toast && <Toast msg={toast} type={toastType} onClose={() => setToast('')} />}

      {/* Create Assignment Modal */}
      {showAsnModal && (
        <Modal title="Create Assignment" onClose={() => setShowAsnModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select value={asnForm.courseId} onChange={e => setAsnForm(p => ({ ...p, courseId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Select --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.targetClass})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={asnForm.title} onChange={e => setAsnForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={asnForm.description} onChange={e => setAsnForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={asnForm.dueDate} onChange={e => setAsnForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input type="number" value={asnForm.maxMarks} onChange={e => setAsnForm(p => ({ ...p, maxMarks: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <button onClick={createAssignment} disabled={submitting}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              <Save className="h-4 w-4" />{submitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Material Modal */}
      {showMatModal && (
        <Modal title="Add Study Material" onClose={() => setShowMatModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select value={matForm.courseId} onChange={e => setMatForm(p => ({ ...p, courseId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Select --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.targetClass})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={matForm.title} onChange={e => setMatForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={matForm.description || ''} onChange={e => setMatForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
              <input type="url" value={matForm.fileUrl} onChange={e => setMatForm(p => ({ ...p, fileUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select value={matForm.fileType} onChange={e => setMatForm(p => ({ ...p, fileType: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {['pdf', 'doc', 'video', 'link', 'image'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <button onClick={createMaterial} disabled={submitting}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              <Upload className="h-4 w-4" />{submitting ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </Modal>
      )}

      {/* Post Announcement Modal */}
      {showAnnModal && (
        <Modal title="Post Announcement" onClose={() => setShowAnnModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea rows={4} value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select value={annForm.targetRole} onChange={e => setAnnForm(p => ({ ...p, targetRole: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="all">All</option>
                  <option value="STUDENT">Students</option>
                  <option value="PARENT">Parents</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={annForm.isPinned} onChange={e => setAnnForm(p => ({ ...p, isPinned: e.target.checked }))}
                    className="w-4 h-4 text-green-600" />
                  Pin announcement
                </label>
              </div>
            </div>
            <button onClick={createAnnouncement} disabled={submitting}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              <Bell className="h-4 w-4" />{submitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </Modal>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <div><p className="font-bold text-sm">Sarthak Group</p><p className="text-xs text-slate-400">Faculty Portal</p></div>}
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'} ${activeTab === item.id ? 'bg-green-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
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
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-semibold text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Faculty</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
