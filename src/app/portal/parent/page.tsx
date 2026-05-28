'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, TrendingUp, CheckCircle, FileText,
  Wallet, Bell, LogOut, Menu, X, AlertTriangle, Pin, Send, Home
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface User { id: string; firstName: string; lastName: string; email: string; role: string; parentProfile?: { id: string; children?: { id: string; user: { firstName: string; lastName: string } }[] } }
interface AttendanceRecord { id: string; date: string; status: string; course: { name: string } }
interface Grade { id: string; examName: string; marks: number; maxMarks: number; grade: string | null; course: { name: string }; createdAt: string }
interface Assignment { id: string; title: string; dueDate: string | null; course: { name: string }; submissions?: unknown[] }
interface Announcement { id: string; title: string; content: string; isPinned: boolean; createdAt: string; faculty: { user: { firstName: string; lastName: string } } }
interface FeePayment { id: string; amountPaid: number; paymentDate: string; status: string; feeStructure: { amount: number; course: { name: string } } }

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type?: 'success' | 'error'; onClose: () => void }) {
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

export default function ParentPortal() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')

  // Data
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [fees, setFees] = useState<FeePayment[]>([])

  // Contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  // Auth guard
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) { router.push('/portal/login'); return }
    const u: User = JSON.parse(raw)
    if (u.role !== 'PARENT') { router.push('/portal/login'); return }
    setUser(u)
    setContactForm(prev => ({ ...prev, name: `${u.firstName} ${u.lastName}`, email: u.email }))

    // Get child student ID from parentProfile.children
    const child = u.parentProfile?.children?.[0]
    if (child) {
      setStudentId(child.id)
      setStudentName(`${child.user?.firstName || ''} ${child.user?.lastName || ''}`.trim())
    }
  }, [router])

  // Fetch child's data
  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [attRes, grdRes, asnRes, annRes, feeRes] = await Promise.all([
          fetch(`/api/attendance?studentId=${studentId}`),
          fetch(`/api/grades?studentId=${studentId}`),
          fetch(`/api/assignments?studentId=${studentId}`),
          fetch('/api/announcements?targetRole=all'),
          fetch(`/api/fees?type=payments&studentId=${studentId}`),
        ])
        const [attData, grdData, asnData, annData, feeData] = await Promise.all([
          attRes.json(), grdRes.json(), asnRes.json(), annRes.json(), feeRes.json()
        ])
        if (attData.success) setAttendance(attData.attendance || [])
        if (grdData.success) setGrades(grdData.grades || [])
        if (asnData.success) setAssignments(asnData.assignments || [])
        if (annData.success) setAnnouncements(annData.announcements || [])
        if (feeData.success) setFees(feeData.payments || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [studentId])

  // Computed
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0
  const pendingCount = assignments.filter(a => !a.submissions?.length).length
  const totalPaid = fees.filter(f => f.status === 'COMPLETED').reduce((s, f) => s + f.amountPaid, 0)
  const avgPct = grades.length ? Math.round(grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length) : 0

  // Group grades by subject for progress bars
  const subjectGrades: Record<string, { marks: number; maxMarks: number; count: number }> = {}
  grades.forEach(g => {
    const k = g.course?.name || 'Unknown'
    if (!subjectGrades[k]) subjectGrades[k] = { marks: 0, maxMarks: 0, count: 0 }
    subjectGrades[k].marks += g.marks
    subjectGrades[k].maxMarks += g.maxMarks
    subjectGrades[k].count++
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, phone: '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast('Message sent successfully!')
      setToastType('success')
      setContactForm(prev => ({ ...prev, message: '' }))
    } catch (err: any) {
      setToast(err.message || 'Failed to send message')
      setToastType('error')
    } finally { setSubmitting(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'attendance', icon: CheckCircle, label: 'Attendance' },
    { id: 'grades', icon: TrendingUp, label: 'Grades & Performance' },
    { id: 'fees', icon: Wallet, label: 'Fee Payments' },
    { id: 'announcements', icon: Bell, label: 'Announcements' },
    { id: 'contact', icon: Send, label: 'Contact Faculty' },
  ]

  // ── No child linked state ─────────────────────────────────────────────────
  const noChildState = (
    <div className="bg-white rounded-xl p-10 text-center shadow-sm">
      <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800">No child linked to your account</h3>
      <p className="text-gray-500 mt-2">Please contact admin to link your child profile.</p>
    </div>
  )

  const renderContent = () => {
    if (loading) return (
      <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
    )

    switch (activeTab) {
      // ── Dashboard ──────────────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
              <p className="text-purple-100 mt-1">Monitor your child&apos;s academic progress.</p>
            </div>
            {!studentId ? noChildState : (
              <>
                {/* Child info */}
                <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl shrink-0">
                    {studentName?.[0] || 'S'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{studentName || 'Child'}</h2>
                    <p className="text-sm text-gray-500">Student ID: {studentId}</p>
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Attendance', value: `${attendancePct}%`, icon: CheckCircle, color: 'green' },
                    { label: 'Avg Score', value: `${avgPct}%`, icon: TrendingUp, color: 'blue' },
                    { label: 'Pending Assignments', value: pendingCount, icon: FileText, color: 'orange' },
                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: Wallet, color: 'purple' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
                      <div className={`w-11 h-11 bg-${s.color}-100 rounded-lg flex items-center justify-center shrink-0`}>
                        <s.icon className={`h-5 w-5 text-${s.color}-600`} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Recent grades */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Recent Grades</h2>
                    <button onClick={() => setActiveTab('grades')} className="text-purple-600 text-sm">View All</button>
                  </div>
                  <div className="p-5">
                    {grades.length === 0 && <p className="text-gray-500">No grades yet.</p>}
                    <div className="space-y-2">
                      {grades.slice(0, 5).map(g => {
                        const pct = Math.round((g.marks / g.maxMarks) * 100)
                        return (
                          <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{g.examName}</p>
                              <p className="text-xs text-gray-500">{g.course?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{g.marks}/{g.maxMarks}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {/* Recent announcements */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Recent Announcements</h2></div>
                  <div className="p-5 space-y-3">
                    {announcements.length === 0 && <p className="text-gray-500">No announcements.</p>}
                    {announcements.slice(0, 3).map(a => (
                      <div key={a.id} className="flex items-start gap-2">
                        {a.isPinned && <Pin className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                          <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      // ── Attendance ────────────────────────────────────────────────────────
      case 'attendance':
        if (!studentId) return noChildState
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Attendance Records</h2></div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-6 p-4 bg-green-50 rounded-xl">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16a34a" strokeWidth="3"
                      strokeDasharray={`${attendancePct} ${100 - attendancePct}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">{attendancePct}%</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Overall Attendance</p>
                  <p className="text-sm text-gray-600">Present: {presentCount} / {attendance.length}</p>
                  <p className="text-sm text-gray-600">Absent: {attendance.filter(a => a.status === 'ABSENT').length}</p>
                  <p className="text-sm text-gray-600">Late: {attendance.filter(a => a.status === 'LATE').length}</p>
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
                    {attendance.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-500">No attendance records.</td></tr>}
                    {attendance.map(a => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-900">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 text-gray-600">{a.course?.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                            a.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                            a.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                          }`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      // ── Grades & Performance ──────────────────────────────────────────────
      case 'grades':
        if (!studentId) return noChildState
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Grades &amp; Performance</h2>
                {grades.length > 0 && <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Avg: {avgPct}%</span>}
              </div>
              <div className="p-5">
                {/* Per-subject progress bars */}
                {Object.keys(subjectGrades).length > 0 && (
                  <div className="mb-6 space-y-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Performance by Subject</p>
                    {Object.entries(subjectGrades).map(([subj, data]) => {
                      const pct = Math.round((data.marks / data.maxMarks) * 100)
                      return (
                        <div key={subj}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{subj}</span>
                            <span className="font-medium text-gray-900">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-500'}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Exam</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Marks</th>
                      <th className="pb-3 font-medium">Grade</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {grades.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No grades recorded.</td></tr>}
                      {grades.map(g => {
                        const pct = Math.round((g.marks / g.maxMarks) * 100)
                        return (
                          <tr key={g.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">{g.examName}</td>
                            <td className="py-3 text-gray-600">{g.course?.name}</td>
                            <td className="py-3 text-gray-600">{g.marks}/{g.maxMarks}</td>
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
          </div>
        )

      // ── Fee Payments ──────────────────────────────────────────────────────
      case 'fees':
        if (!studentId) return noChildState
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Fee Payments</h2></div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-green-700">&#8377;{totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-orange-700">{fees.filter(f => f.status === 'PENDING').length}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {fees.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No fee records.</td></tr>}
                    {fees.map(f => (
                      <tr key={f.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{f.feeStructure?.course?.name || '—'}</td>
                        <td className="py-3 text-gray-900">&#8377;{f.amountPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-gray-500">{new Date(f.paymentDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            f.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            f.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                          }`}>{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      // ── Announcements ─────────────────────────────────────────────────────
      case 'announcements':
        return (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Announcements</h2></div>
            <div className="p-5 space-y-4">
              {announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements.</p>}
              {announcements.map(a => (
                <div key={a.id} className={`border rounded-xl p-4 ${a.isPinned ? 'border-purple-200 bg-purple-50' : ''}`}>
                  <div className="flex items-start gap-2">
                    {a.isPinned && <Pin className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />}
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
        )

      // ── Contact Faculty ───────────────────────────────────────────────────
      case 'contact':
        return (
          <div className="bg-white rounded-xl shadow-sm max-w-lg">
            <div className="p-5 border-b"><h2 className="font-semibold text-gray-900">Contact Faculty / Admin</h2></div>
            <form onSubmit={handleContactSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" value={contactForm.name} readOnly
                  className="w-full border rounded-lg px-4 py-2 bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={contactForm.email} readOnly
                  className="w-full border rounded-lg px-4 py-2 bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={5} value={contactForm.message} required
                  onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message or query here..."
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                <Send className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )

      default: return null
    }
  }

  const handleLogout2 = handleLogout

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && <Toast msg={toast} type={toastType} onClose={() => setToast('')} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <div><p className="font-bold text-sm">Sarthak Group</p><p className="text-xs text-slate-400">Parent Portal</p></div>}
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'} ${activeTab === item.id ? 'bg-purple-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout2}
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
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-700 font-semibold text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Parent{studentName ? ` of ${studentName}` : ''}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
