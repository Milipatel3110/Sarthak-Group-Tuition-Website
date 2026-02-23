'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarCheck2,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MonitorPlay,
  Plus,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'

type TabKey =
  | 'dashboard'
  | 'assignments'
  | 'attendance'
  | 'grades'
  | 'materials'
  | 'sessions'
  | 'announcements'

interface PortalUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  facultyProfile?: { id: string } | null
}

interface CourseItem {
  id: string
  name: string
  targetClass: string
  isActive: boolean
}

interface AssignmentItem {
  id: string
  title: string
  description: string
  dueDate: string | null
  maxMarks: number
  course: CourseItem
  _count?: { submissions: number }
}

interface StudentItem {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface MaterialItem {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileType: string
  course: CourseItem
}

interface SessionItem {
  id: string
  title: string
  description: string | null
  sessionType: string
  scheduledAt: string
  durationMinutes: number
  status: string
  meetingLink: string | null
  course: CourseItem | null
}

interface AnnouncementItem {
  id: string
  title: string
  content: string
  targetRole: string
  isPinned: boolean
  createdAt: string
}

interface GradeItem {
  id: string
  examName: string
  marks: number
  maxMarks: number
  grade: string | null
  remarks: string | null
  student: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

function toDateInputValue(date = new Date()) {
  return date.toISOString().split('T')[0]
}

function computeGrade(marks: number, maxMarks: number) {
  if (!maxMarks || maxMarks <= 0) return 'F'
  const percent = (marks / maxMarks) * 100
  if (percent >= 90) return 'A+'
  if (percent >= 80) return 'A'
  if (percent >= 70) return 'B+'
  if (percent >= 60) return 'B'
  if (percent >= 50) return 'C'
  return 'F'
}

export default function FacultyDashboard() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [currentUser, setCurrentUser] = useState<PortalUser | null>(null)
  const [facultyId, setFacultyId] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [courseStudents, setCourseStudents] = useState<StudentItem[]>([])
  const [attendanceDate, setAttendanceDate] = useState(toDateInputValue())
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, string>>({})
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [grades, setGrades] = useState<GradeItem[]>([])

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  })

  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
  })

  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    sessionType: 'LIVE_CLASS',
    scheduledAt: '',
    durationMinutes: 60,
    meetingLink: '',
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    targetRole: 'all',
    isPinned: false,
  })

  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    examName: '',
    marks: '',
    maxMarks: '100',
    remarks: '',
  })

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      router.push('/portal/login')
      return
    }

    const parsedUser = JSON.parse(rawUser) as PortalUser
    if (!['FACULTY', 'ADMIN'].includes(parsedUser.role)) {
      router.push('/portal/login')
      return
    }

    setCurrentUser(parsedUser)
    if (parsedUser.facultyProfile?.id) {
      setFacultyId(parsedUser.facultyProfile.id)
    } else {
      setError('No faculty profile is linked to this account.')
      setLoading(false)
    }
  }, [router])

  const loadMainData = async () => {
    if (!facultyId) return
    setLoading(true)
    setError('')
    try {
      const [coursesRes, assignmentsRes, materialsRes, sessionsRes, announcementsRes] =
        await Promise.all([
          fetch(`/api/courses?facultyId=${facultyId}&isActive=true`),
          fetch(`/api/assignments?facultyId=${facultyId}`),
          fetch(`/api/materials?facultyId=${facultyId}`),
          fetch(`/api/sessions?facultyId=${facultyId}`),
          fetch(`/api/announcements?facultyId=${facultyId}`),
        ])

      const coursesData = await coursesRes.json()
      let loadedCourses: CourseItem[] = coursesData.courses || []
      if (loadedCourses.length === 0) {
        const fallbackRes = await fetch('/api/courses?isActive=true')
        const fallbackData = await fallbackRes.json()
        loadedCourses = fallbackData.courses || []
      }

      const assignmentsData = await assignmentsRes.json()
      const materialsData = await materialsRes.json()
      const sessionsData = await sessionsRes.json()
      const announcementsData = await announcementsRes.json()

      setCourses(loadedCourses)
      setAssignments(assignmentsData.assignments || [])
      setMaterials(materialsData.materials || [])
      setSessions(sessionsData.sessions || [])
      setAnnouncements(announcementsData.announcements || [])
      setSelectedCourseId((prev) => prev || loadedCourses[0]?.id || '')
    } catch (err) {
      console.error(err)
      setError('Failed to load faculty data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMainData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId])

  const loadCourseScopedData = async () => {
    if (!selectedCourseId) return
    try {
      const [enrollmentsRes, attendanceRes, gradesRes] = await Promise.all([
        fetch(`/api/course-enrollments?courseId=${selectedCourseId}&status=ACTIVE`),
        fetch(`/api/attendance?courseId=${selectedCourseId}&date=${attendanceDate}`),
        fetch(`/api/grades?courseId=${selectedCourseId}`),
      ])

      const enrollmentsData = await enrollmentsRes.json()
      const attendanceData = await attendanceRes.json()
      const gradesData = await gradesRes.json()

      const students: StudentItem[] = (enrollmentsData.enrollments || []).map(
        (item: any) => item.student
      )
      setCourseStudents(students)
      setGrades(gradesData.grades || [])

      const draft: Record<string, string> = {}
      for (const student of students) {
        draft[student.id] = 'PRESENT'
      }
      for (const row of attendanceData.attendance || []) {
        draft[row.studentId] = row.status
      }
      setAttendanceDraft(draft)
      setGradeForm((prev) => ({ ...prev, studentId: prev.studentId || students[0]?.id || '' }))
    } catch (err) {
      console.error(err)
      setError('Failed to load selected course details.')
    }
  }

  useEffect(() => {
    void loadCourseScopedData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, attendanceDate])

  const activeCourses = useMemo(
    () => courses.filter((course) => course.isActive !== false),
    [courses]
  )

  const pendingSessions = sessions.filter((session) => session.status === 'SCHEDULED').length
  const pendingAssignments = assignments.filter((assignment) => {
    if (!assignment.dueDate) return true
    return new Date(assignment.dueDate) >= new Date(new Date().toDateString())
  }).length

  const notify = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !facultyId) return
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignmentForm,
          courseId: selectedCourseId,
          facultyId,
          maxMarks: Number(assignmentForm.maxMarks),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to create assignment')
        return
      }
      setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 })
      await loadMainData()
      notify('Assignment created')
    } catch (err) {
      console.error(err)
      alert('Failed to create assignment')
    }
  }

  const deleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete assignment')
        return
      }
      await loadMainData()
      notify('Assignment deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete assignment')
    }
  }

  const saveAttendance = async () => {
    if (!selectedCourseId) return
    try {
      await Promise.all(
        courseStudents.map((student) =>
          fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: student.id,
              courseId: selectedCourseId,
              date: attendanceDate,
              status: attendanceDraft[student.id] || 'PRESENT',
            }),
          })
        )
      )
      notify('Attendance saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save attendance')
    }
  }

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !gradeForm.studentId) return
    const marks = Number(gradeForm.marks)
    const maxMarks = Number(gradeForm.maxMarks)
    if (!Number.isFinite(marks) || !Number.isFinite(maxMarks) || maxMarks <= 0) {
      alert('Please enter valid marks')
      return
    }
    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: gradeForm.studentId,
          courseId: selectedCourseId,
          examName: gradeForm.examName,
          marks,
          maxMarks,
          grade: computeGrade(marks, maxMarks),
          remarks: gradeForm.remarks || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to add grade')
        return
      }
      setGradeForm((prev) => ({ ...prev, examName: '', marks: '', remarks: '' }))
      await loadCourseScopedData()
      notify('Grade saved')
    } catch (err) {
      console.error(err)
      alert('Failed to add grade')
    }
  }

  const uploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !facultyId) return
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...materialForm,
          courseId: selectedCourseId,
          facultyId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to upload material')
        return
      }
      setMaterialForm({ title: '', description: '', fileUrl: '', fileType: 'pdf' })
      await loadMainData()
      notify('Material uploaded')
    } catch (err) {
      console.error(err)
      alert('Failed to upload material')
    }
  }

  const deleteMaterial = async (id: string) => {
    if (!confirm('Delete this material?')) return
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete material')
        return
      }
      await loadMainData()
      notify('Material deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete material')
    }
  }

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facultyId) return
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionForm,
          courseId: selectedCourseId || null,
          facultyId,
          scheduledAt: new Date(sessionForm.scheduledAt).toISOString(),
          durationMinutes: Number(sessionForm.durationMinutes),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to create session')
        return
      }
      setSessionForm({
        title: '',
        description: '',
        sessionType: 'LIVE_CLASS',
        scheduledAt: '',
        durationMinutes: 60,
        meetingLink: '',
      })
      await loadMainData()
      notify('Session scheduled')
    } catch (err) {
      console.error(err)
      alert('Failed to create session')
    }
  }

  const updateSessionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/sessions?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to update session')
        return
      }
      await loadMainData()
      notify('Session updated')
    } catch (err) {
      console.error(err)
      alert('Failed to update session')
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Delete this session?')) return
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete session')
        return
      }
      await loadMainData()
      notify('Session deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete session')
    }
  }

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facultyId) return
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcementForm,
          facultyId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to publish announcement')
        return
      }
      setAnnouncementForm({ title: '', content: '', targetRole: 'all', isPinned: false })
      await loadMainData()
      notify('Announcement posted')
    } catch (err) {
      console.error(err)
      alert('Failed to post announcement')
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete announcement')
        return
      }
      await loadMainData()
      notify('Announcement deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete announcement')
    }
  }

  const tabItems: Array<{ id: TabKey; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'grades', label: 'Grades', icon: GraduationCap },
    { id: 'materials', label: 'Materials', icon: FolderOpen },
    { id: 'sessions', label: 'Live Sessions', icon: MonitorPlay },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white border-r p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </Link>
          <div>
            <p className="font-semibold text-gray-900">Sarthak Group</p>
            <p className="text-xs text-gray-500">Faculty Portal</p>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <p className="font-medium text-sm text-gray-900">
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Faculty'}
          </p>
          <p className="text-xs text-gray-500">{currentUser?.email}</p>
        </div>

        <div className="space-y-1">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === tab.id
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 space-y-4">
        <div className="bg-white rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Faculty Workspace</h1>
            <p className="text-sm text-gray-500">
              Integrated operations for assignments, attendance, grades, resources, and announcements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {activeCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.targetClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && <div className="rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">{message}</div>}
        {error && <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}
        {loading && <div className="rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm">Loading data...</div>}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold">{activeCourses.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Assignments</p>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Pending Sessions</p>
              <p className="text-2xl font-bold">{pendingSessions}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">Due Assignments</p>
              <p className="text-2xl font-bold">{pendingAssignments}</p>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <form onSubmit={createAssignment} className="bg-white rounded-xl border p-4 grid md:grid-cols-2 gap-3">
              <h2 className="md:col-span-2 font-semibold">Create Assignment</h2>
              <input className="border rounded-lg px-3 py-2" placeholder="Title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
              <input className="border rounded-lg px-3 py-2" type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} />
              <textarea className="md:col-span-2 border rounded-lg px-3 py-2" placeholder="Description" value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} required />
              <input className="border rounded-lg px-3 py-2" type="number" min={1} placeholder="Max Marks" value={assignmentForm.maxMarks} onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: Number(e.target.value) })} />
              <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Create</button>
            </form>

            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Course</th>
                    <th className="text-left px-4 py-3">Due</th>
                    <th className="text-left px-4 py-3">Submissions</th>
                    <th className="text-right px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-t">
                      <td className="px-4 py-3">{assignment.title}</td>
                      <td className="px-4 py-3">{assignment.course?.name || '-'}</td>
                      <td className="px-4 py-3">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">{assignment._count?.submissions ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteAssignment(assignment.id)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"><Trash2 className="h-4 w-4" />Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Date</label>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
              </div>
              <button onClick={saveAttendance} className="bg-green-600 text-white rounded-lg px-4 py-2">
                Save Attendance
              </button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Student</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="px-4 py-3">{student.user.firstName} {student.user.lastName}</td>
                      <td className="px-4 py-3">{student.user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={attendanceDraft[student.id] || 'PRESENT'}
                          onChange={(e) =>
                            setAttendanceDraft((prev) => ({ ...prev, [student.id]: e.target.value }))
                          }
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <form onSubmit={addGrade} className="bg-white rounded-xl border p-4 grid md:grid-cols-3 gap-3">
              <h2 className="md:col-span-3 font-semibold">Add Grade</h2>
              <select value={gradeForm.studentId} onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })} className="border rounded-lg px-3 py-2" required>
                <option value="">Select student</option>
                {courseStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName}
                  </option>
                ))}
              </select>
              <input value={gradeForm.examName} onChange={(e) => setGradeForm({ ...gradeForm, examName: e.target.value })} className="border rounded-lg px-3 py-2" placeholder="Exam name" required />
              <input type="number" value={gradeForm.marks} onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })} className="border rounded-lg px-3 py-2" placeholder="Marks" required />
              <input type="number" value={gradeForm.maxMarks} onChange={(e) => setGradeForm({ ...gradeForm, maxMarks: e.target.value })} className="border rounded-lg px-3 py-2" placeholder="Max marks" required />
              <input value={gradeForm.remarks} onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Remarks (optional)" />
              <button className="bg-green-600 text-white rounded-lg px-4 py-2">Save Grade</button>
            </form>

            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Student</th>
                    <th className="text-left px-4 py-3">Exam</th>
                    <th className="text-left px-4 py-3">Marks</th>
                    <th className="text-left px-4 py-3">Grade</th>
                    <th className="text-left px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-t">
                      <td className="px-4 py-3">{grade.student.user.firstName} {grade.student.user.lastName}</td>
                      <td className="px-4 py-3">{grade.examName}</td>
                      <td className="px-4 py-3">{grade.marks}/{grade.maxMarks}</td>
                      <td className="px-4 py-3">{grade.grade || '-'}</td>
                      <td className="px-4 py-3">{grade.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            <form onSubmit={uploadMaterial} className="bg-white rounded-xl border p-4 grid md:grid-cols-2 gap-3">
              <h2 className="md:col-span-2 font-semibold">Upload Material</h2>
              <input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} className="border rounded-lg px-3 py-2" placeholder="Title" required />
              <select value={materialForm.fileType} onChange={(e) => setMaterialForm({ ...materialForm, fileType: e.target.value })} className="border rounded-lg px-3 py-2">
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="link">Link</option>
                <option value="video">Video</option>
              </select>
              <input value={materialForm.fileUrl} onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="File URL" required />
              <textarea value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" />
              <button className="bg-green-600 text-white rounded-lg px-4 py-2 md:col-span-2 flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Upload</button>
            </form>

            <div className="bg-white rounded-xl border divide-y">
              {materials.map((material) => (
                <div key={material.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{material.title}</p>
                    <p className="text-sm text-gray-500">
                      {material.course?.name || '-'} • {material.fileType.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={material.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                      Open
                    </a>
                    <button onClick={() => deleteMaterial(material.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <form onSubmit={createSession} className="bg-white rounded-xl border p-4 grid md:grid-cols-2 gap-3">
              <h2 className="md:col-span-2 font-semibold">Schedule Live Session</h2>
              <input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} className="border rounded-lg px-3 py-2" placeholder="Session title" required />
              <select value={sessionForm.sessionType} onChange={(e) => setSessionForm({ ...sessionForm, sessionType: e.target.value })} className="border rounded-lg px-3 py-2">
                <option value="LIVE_CLASS">Live Class</option>
                <option value="DOUBT_SESSION">Doubt Session</option>
                <option value="PTM">PTM</option>
              </select>
              <input type="datetime-local" value={sessionForm.scheduledAt} onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="number" min={15} value={sessionForm.durationMinutes} onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: Number(e.target.value) })} className="border rounded-lg px-3 py-2" placeholder="Duration (minutes)" required />
              <input value={sessionForm.meetingLink} onChange={(e) => setSessionForm({ ...sessionForm, meetingLink: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Meeting link (optional)" />
              <textarea value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" />
              <button className="bg-green-600 text-white rounded-lg px-4 py-2 md:col-span-2">Schedule Session</button>
            </form>

            <div className="bg-white rounded-xl border divide-y">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.scheduledAt).toLocaleString()} • {session.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={session.status}
                      onChange={(e) => updateSessionStatus(session.id, e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="LIVE">Live</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button onClick={() => deleteSession(session.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <form onSubmit={createAnnouncement} className="bg-white rounded-xl border p-4 grid md:grid-cols-2 gap-3">
              <h2 className="md:col-span-2 font-semibold">Post Announcement</h2>
              <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Title" required />
              <select value={announcementForm.targetRole} onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value })} className="border rounded-lg px-3 py-2">
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="parents">Parents</option>
              </select>
              <label className="border rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <input type="checkbox" checked={announcementForm.isPinned} onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })} />
                Pin announcement
              </label>
              <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Announcement content" required />
              <button className="bg-green-600 text-white rounded-lg px-4 py-2 md:col-span-2">Post Announcement</button>
            </form>

            <div className="bg-white rounded-xl border divide-y">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {announcement.title}
                      {announcement.isPinned && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          PINNED
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(announcement.createdAt).toLocaleString()} • Target: {announcement.targetRole}
                    </p>
                  </div>
                  <button onClick={() => deleteAnnouncement(announcement.id)} className="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && selectedCourseId === '' && (
          <div className="rounded-lg bg-yellow-50 text-yellow-700 px-4 py-3 text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            No course is selected. Assign or create courses from admin portal to enable full faculty workflows.
          </div>
        )}
      </main>
    </div>
  )
}
