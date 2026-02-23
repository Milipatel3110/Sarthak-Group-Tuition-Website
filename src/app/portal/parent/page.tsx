'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react'

type TabKey = 'dashboard' | 'progress' | 'attendance' | 'assignments' | 'schedule' | 'announcements'

interface PortalUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  parentProfile?: { id: string } | null
}

interface ChildUser {
  id: string
  firstName: string
  lastName: string
  email: string
  studentProfile: {
    id: string
    class: string
    parentId: string | null
  } | null
}

interface EnrollmentItem {
  id: string
  courseId: string
  status: string
  course: {
    id: string
    name: string
    targetClass: string
  }
}

interface AssignmentItem {
  id: string
  title: string
  description: string
  dueDate: string | null
  maxMarks: number
  courseId: string
  course: {
    name: string
  }
}

interface SubmissionItem {
  id: string
  assignmentId: string
  submittedAt: string
  marks: number | null
  feedback: string | null
}

interface GradeItem {
  id: string
  examName: string
  marks: number
  maxMarks: number
  grade: string | null
  remarks: string | null
  course: {
    name: string
  }
}

interface AttendanceItem {
  id: string
  status: string
  date: string
}

interface ScheduleItem {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  subject: string
  roomNumber: string | null
  courseId: string
  course: {
    name: string
  }
}

interface AnnouncementItem {
  id: string
  title: string
  content: string
  targetRole: string
  isPinned: boolean
  createdAt: string
}

export default function ParentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [user, setUser] = useState<PortalUser | null>(null)
  const [parentProfileId, setParentProfileId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [children, setChildren] = useState<ChildUser[]>([])
  const [activeChildStudentId, setActiveChildStudentId] = useState('')

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [grades, setGrades] = useState<GradeItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceItem[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      router.push('/portal/login')
      return
    }

    const parsedUser = JSON.parse(rawUser) as PortalUser
    if (!['PARENT', 'ADMIN'].includes(parsedUser.role)) {
      router.push('/portal/login')
      return
    }

    setUser(parsedUser)
    if (!parsedUser.parentProfile?.id) {
      setError('No parent profile is linked to this account.')
      setLoading(false)
      return
    }
    setParentProfileId(parsedUser.parentProfile.id)
  }, [router])

  const loadChildren = async () => {
    if (!parentProfileId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register?role=STUDENT&isActive=true')
      const data = await res.json()
      const allStudents: ChildUser[] = (data.users || []).filter(
        (student: ChildUser) => student.studentProfile?.parentId === parentProfileId
      )
      setChildren(allStudents)
      setActiveChildStudentId((prev) => prev || allStudents[0]?.studentProfile?.id || '')
    } catch (err) {
      console.error(err)
      setError('Failed to load linked children.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadChildren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentProfileId])

  const refreshChildData = async () => {
    if (!activeChildStudentId) return
    setLoading(true)
    setError('')
    try {
      const [
        enrollmentsRes,
        assignmentsRes,
        submissionsRes,
        gradesRes,
        attendanceRes,
        scheduleRes,
        announcementsRes,
      ] = await Promise.all([
        fetch(`/api/course-enrollments?studentId=${activeChildStudentId}&status=ACTIVE`),
        fetch('/api/assignments'),
        fetch(`/api/assignment-submissions?studentId=${activeChildStudentId}`),
        fetch(`/api/grades?studentId=${activeChildStudentId}`),
        fetch(`/api/attendance?studentId=${activeChildStudentId}`),
        fetch('/api/schedule'),
        fetch('/api/announcements?targetRole=parents'),
      ])

      const enrollmentsData = await enrollmentsRes.json()
      const assignmentsData = await assignmentsRes.json()
      const submissionsData = await submissionsRes.json()
      const gradesData = await gradesRes.json()
      const attendanceData = await attendanceRes.json()
      const scheduleData = await scheduleRes.json()
      const announcementsData = await announcementsRes.json()

      setEnrollments(enrollmentsData.enrollments || [])
      setAssignments(assignmentsData.assignments || [])
      setSubmissions(submissionsData.submissions || [])
      setGrades(gradesData.grades || [])
      setAttendance(attendanceData.attendance || [])
      setSchedule(scheduleData.schedule || [])
      setAnnouncements(announcementsData.announcements || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load child data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshChildData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildStudentId])

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((enrollment) => enrollment.courseId))
  }, [enrollments])

  const childAssignments = useMemo(
    () => assignments.filter((assignment) => enrolledCourseIds.has(assignment.courseId)),
    [assignments, enrolledCourseIds]
  )

  const submissionByAssignment = useMemo(() => {
    const map = new Map<string, SubmissionItem>()
    submissions.forEach((submission) => map.set(submission.assignmentId, submission))
    return map
  }, [submissions])

  const childSchedule = useMemo(
    () => schedule.filter((entry) => enrolledCourseIds.has(entry.courseId)),
    [schedule, enrolledCourseIds]
  )

  const attendanceStats = useMemo(() => {
    if (!attendance.length) return { percentage: 0, present: 0, absent: 0, total: 0 }
    const present = attendance.filter((item) => item.status === 'PRESENT').length
    const absent = attendance.filter((item) => item.status === 'ABSENT').length
    const total = attendance.length
    return {
      percentage: Math.round((present / total) * 100),
      present,
      absent,
      total,
    }
  }, [attendance])

  const averageMarks = useMemo(() => {
    if (!grades.length) return 0
    const totalPercent = grades.reduce((sum, grade) => sum + (grade.marks / grade.maxMarks) * 100, 0)
    return Math.round(totalPercent / grades.length)
  }, [grades])

  const activeChild = children.find((child) => child.studentProfile?.id === activeChildStudentId)

  const tabs: Array<{ id: TabKey; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: "Child's Progress", icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: ShieldCheck },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white border-r p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </Link>
          <div>
            <p className="font-semibold text-gray-900">Sarthak Group</p>
            <p className="text-xs text-gray-500">Parent Portal</p>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <p className="font-medium text-sm text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Parent'}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700'
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
            <h1 className="text-xl font-semibold text-gray-900">Parent Workspace</h1>
            <p className="text-sm text-gray-500">
              Monitor your child's academics using live data from courses, attendance, grades, and assignments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-gray-500" />
            <select
              value={activeChildStudentId}
              onChange={(e) => {
                const selectedStudentId = e.target.value
                setActiveChildStudentId(selectedStudentId)
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select Child</option>
              {children.map((child) => (
                <option key={child.id} value={child.studentProfile?.id || ''}>
                  {child.firstName} {child.lastName} ({child.studentProfile?.class || 'Student'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}
        {loading && <div className="rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm">Loading data...</div>}

        {!loading && children.length === 0 && (
          <div className="rounded-lg bg-yellow-50 text-yellow-700 px-4 py-3 text-sm">
            No children are linked to this parent account yet. Ask admin to link a student profile.
          </div>
        )}

        {!loading && activeChild && (
          <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3 text-sm text-purple-800">
            Viewing: <strong>{activeChild.firstName} {activeChild.lastName}</strong> • Class {activeChild.studentProfile?.class || '-'}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold">{attendanceStats.percentage}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Average Marks</p>
                <p className="text-2xl font-bold">{averageMarks}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Pending Assignments</p>
                <p className="text-2xl font-bold">
                  {childAssignments.filter((assignment) => !submissionByAssignment.get(assignment.id)).length}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <h2 className="font-semibold mb-3">Recent Results</h2>
                <div className="space-y-3">
                  {grades.slice(0, 6).map((grade) => (
                    <div key={grade.id} className="border rounded-lg p-3">
                      <p className="font-medium">{grade.course?.name}</p>
                      <p className="text-sm text-gray-500">{grade.examName}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {grade.marks}/{grade.maxMarks} {grade.grade ? `• ${grade.grade}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border p-4">
                <h2 className="font-semibold mb-3">Upcoming Classes</h2>
                <div className="space-y-3">
                  {childSchedule.slice(0, 6).map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3">
                      <p className="font-medium">{entry.subject}</p>
                      <p className="text-sm text-gray-500">
                        {entry.dayOfWeek} • {entry.startTime} - {entry.endTime}
                      </p>
                      <p className="text-xs text-gray-400">{entry.course?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Exam</th>
                  <th className="text-left px-4 py-3">Marks</th>
                  <th className="text-left px-4 py-3">Grade</th>
                  <th className="text-left px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id} className="border-t">
                    <td className="px-4 py-3">{grade.course?.name}</td>
                    <td className="px-4 py-3">{grade.examName}</td>
                    <td className="px-4 py-3">{grade.marks}/{grade.maxMarks}</td>
                    <td className="px-4 py-3">{grade.grade || '-'}</td>
                    <td className="px-4 py-3">{grade.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold">{attendanceStats.total}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold">{attendanceStats.present}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold">{attendanceStats.absent}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Attendance %</p>
                <p className="text-2xl font-bold">{attendanceStats.percentage}%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {childAssignments.map((assignment) => {
              const submission = submissionByAssignment.get(assignment.id)
              const status = submission
                ? submission.marks !== null
                  ? 'graded'
                  : 'submitted'
                : 'pending'
              return (
                <div key={assignment.id} className="bg-white rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{assignment.title}</p>
                      <p className="text-sm text-gray-500">{assignment.course?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : status === 'submitted'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {status.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  {submission && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                      <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                      {submission.marks !== null && (
                        <p>Score: <strong>{submission.marks}/{assignment.maxMarks}</strong></p>
                      )}
                      {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Day</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Subject</th>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {childSchedule.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="px-4 py-3">{entry.dayOfWeek}</td>
                    <td className="px-4 py-3">{entry.startTime} - {entry.endTime}</td>
                    <td className="px-4 py-3">{entry.subject}</td>
                    <td className="px-4 py-3">{entry.course?.name}</td>
                    <td className="px-4 py-3">{entry.roomNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-xl border p-4">
                <p className="font-semibold text-gray-900">
                  {announcement.title}
                  {announcement.isPinned && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                      PINNED
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
