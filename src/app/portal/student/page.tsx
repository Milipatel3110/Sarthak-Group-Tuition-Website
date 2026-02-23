'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  NotebookTabs,
  TrendingUp,
} from 'lucide-react'

type TabKey = 'dashboard' | 'assignments' | 'materials' | 'grades' | 'schedule' | 'announcements'

interface PortalUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  studentProfile?: { id: string } | null
}

interface CourseEnrollmentItem {
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
  submissionText: string | null
  submittedAt: string
  marks: number | null
  feedback: string | null
}

interface MaterialItem {
  id: string
  title: string
  description: string | null
  fileType: string
  fileUrl: string
  courseId: string
  course: {
    name: string
  }
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

interface AttendanceItem {
  id: string
  status: string
  date: string
}

interface AnnouncementItem {
  id: string
  title: string
  content: string
  targetRole: string
  isPinned: boolean
  createdAt: string
}

export default function StudentDashboard() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [user, setUser] = useState<PortalUser | null>(null)
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [grades, setGrades] = useState<GradeItem[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceItem[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])

  const [expandedAssignmentId, setExpandedAssignmentId] = useState('')
  const [submissionText, setSubmissionText] = useState('')

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      router.push('/portal/login')
      return
    }

    const parsedUser = JSON.parse(rawUser) as PortalUser
    if (!['STUDENT', 'ADMIN'].includes(parsedUser.role)) {
      router.push('/portal/login')
      return
    }

    setUser(parsedUser)
    if (!parsedUser.studentProfile?.id) {
      setError('No student profile is linked to this account.')
      setLoading(false)
      return
    }
    setStudentId(parsedUser.studentProfile.id)
  }, [router])

  const refreshData = async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const [
        enrollmentsRes,
        assignmentsRes,
        submissionsRes,
        materialsRes,
        gradesRes,
        scheduleRes,
        attendanceRes,
        announcementsRes,
      ] = await Promise.all([
        fetch(`/api/course-enrollments?studentId=${studentId}&status=ACTIVE`),
        fetch('/api/assignments'),
        fetch(`/api/assignment-submissions?studentId=${studentId}`),
        fetch('/api/materials'),
        fetch(`/api/grades?studentId=${studentId}`),
        fetch('/api/schedule'),
        fetch(`/api/attendance?studentId=${studentId}`),
        fetch('/api/announcements?targetRole=students'),
      ])

      const enrollmentsData = await enrollmentsRes.json()
      const assignmentsData = await assignmentsRes.json()
      const submissionsData = await submissionsRes.json()
      const materialsData = await materialsRes.json()
      const gradesData = await gradesRes.json()
      const scheduleData = await scheduleRes.json()
      const attendanceData = await attendanceRes.json()
      const announcementsData = await announcementsRes.json()

      setEnrollments(enrollmentsData.enrollments || [])
      setAssignments(assignmentsData.assignments || [])
      setSubmissions(submissionsData.submissions || [])
      setMaterials(materialsData.materials || [])
      setGrades(gradesData.grades || [])
      setSchedule(scheduleData.schedule || [])
      setAttendance(attendanceData.attendance || [])
      setAnnouncements(announcementsData.announcements || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load student data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((enrollment) => enrollment.courseId))
  }, [enrollments])

  const myAssignments = useMemo(
    () => assignments.filter((assignment) => enrolledCourseIds.has(assignment.courseId)),
    [assignments, enrolledCourseIds]
  )

  const myMaterials = useMemo(
    () => materials.filter((material) => enrolledCourseIds.has(material.courseId)),
    [materials, enrolledCourseIds]
  )

  const mySchedule = useMemo(
    () => schedule.filter((entry) => enrolledCourseIds.has(entry.courseId)),
    [schedule, enrolledCourseIds]
  )

  const submissionByAssignment = useMemo(() => {
    const map = new Map<string, SubmissionItem>()
    submissions.forEach((submission) => map.set(submission.assignmentId, submission))
    return map
  }, [submissions])

  const pendingAssignments = myAssignments.filter(
    (assignment) => !submissionByAssignment.get(assignment.id)
  )
  const gradedAssignments = submissions.filter((submission) => submission.marks !== null)

  const attendancePercentage = useMemo(() => {
    if (!attendance.length) return 0
    const presentCount = attendance.filter((entry) => entry.status === 'PRESENT').length
    return Math.round((presentCount / attendance.length) * 100)
  }, [attendance])

  const averageGrade = useMemo(() => {
    if (!grades.length) return '-'
    const total = grades.reduce((sum, grade) => sum + (grade.marks / grade.maxMarks) * 100, 0)
    const average = total / grades.length
    if (average >= 90) return 'A+'
    if (average >= 80) return 'A'
    if (average >= 70) return 'B+'
    if (average >= 60) return 'B'
    if (average >= 50) return 'C'
    return 'F'
  }, [grades])

  const submitAssignment = async (assignmentId: string) => {
    if (!studentId) return
    if (!submissionText.trim()) {
      alert('Please write your submission before sending.')
      return
    }

    try {
      const res = await fetch('/api/assignment-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId,
          submissionText: submissionText.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to submit assignment')
        return
      }

      setSubmissionText('')
      setExpandedAssignmentId('')
      setNotice('Assignment submitted successfully')
      setTimeout(() => setNotice(''), 3000)
      await refreshData()
    } catch (err) {
      console.error(err)
      alert('Failed to submit assignment')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const tabs: Array<{ id: TabKey; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'materials', label: 'Materials', icon: NotebookTabs },
    { id: 'grades', label: 'Grades', icon: TrendingUp },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white border-r p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </Link>
          <div>
            <p className="font-semibold text-gray-900">Sarthak Group</p>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <p className="font-medium text-sm text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Student'}
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
                  ? 'bg-blue-50 text-blue-700'
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
        <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Student Workspace</h1>
            <p className="text-sm text-gray-500">
              Track courses, submissions, grades, timetable, and important updates.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            {enrollments.length} active course(s)
          </div>
        </div>

        {notice && <div className="rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">{notice}</div>}
        {error && <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}
        {loading && <div className="rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm">Loading data...</div>}

        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Courses</p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Pending Assignments</p>
                <p className="text-2xl font-bold">{pendingAssignments.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500">Average Grade</p>
                <p className="text-2xl font-bold">{averageGrade}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <h2 className="font-semibold mb-3">Upcoming Classes</h2>
                <div className="space-y-3">
                  {mySchedule.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3">
                      <p className="font-medium">{entry.subject}</p>
                      <p className="text-sm text-gray-500">
                        {entry.dayOfWeek} • {entry.startTime} - {entry.endTime}
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.course?.name} {entry.roomNumber ? `• Room ${entry.roomNumber}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border p-4">
                <h2 className="font-semibold mb-3">Latest Announcements</h2>
                <div className="space-y-3">
                  {announcements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-3">
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-gray-500">{announcement.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {myAssignments.map((assignment) => {
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
                      <p className="font-semibold text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-500">{assignment.course?.name}</p>
                      <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
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
                      <p>
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      {submission.marks !== null && (
                        <p>
                          Score: <strong>{submission.marks}/{assignment.maxMarks}</strong>
                        </p>
                      )}
                      {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                    </div>
                  )}

                  {!submission && (
                    <div className="mt-3">
                      {expandedAssignmentId === assignment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            rows={4}
                            placeholder="Write your assignment response here..."
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => submitAssignment(assignment.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setExpandedAssignmentId('')
                                setSubmissionText('')
                              }}
                              className="border px-4 py-2 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedAssignmentId(assignment.id)}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Submit assignment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl border divide-y">
            {myMaterials.map((material) => (
              <div key={material.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{material.title}</p>
                  <p className="text-sm text-gray-500">
                    {material.course?.name} • {material.fileType.toUpperCase()}
                  </p>
                  {material.description && <p className="text-sm text-gray-600 mt-1">{material.description}</p>}
                </div>
                <a href={material.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                  Open
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
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
                {mySchedule.map((entry) => (
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
                <div className="flex items-start justify-between gap-3">
                  <div>
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
                      {new Date(announcement.createdAt).toLocaleString()} • Target: {announcement.targetRole}
                    </p>
                  </div>
                  <Bell className="h-4 w-4 text-gray-400 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
