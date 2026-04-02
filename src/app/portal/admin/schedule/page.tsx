'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Edit, Trash2, X } from 'lucide-react'

interface ScheduleItem {
  id: string
  courseId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  subject: string
  roomNumber: string | null
  facultyId: string | null
  course?: {
    id: string
    name: string
    targetClass: string
  }
  faculty?: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  } | null
}

interface CourseOption {
  id: string
  name: string
  targetClass: string
}

interface FacultyOption {
  id: string
  user: {
    firstName: string
    lastName: string
  }
}

function ScheduleModal({
  isOpen,
  onClose,
  item,
  courses,
  facultyOptions,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  item?: ScheduleItem | null
  courses: CourseOption[]
  facultyOptions: FacultyOption[]
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    courseId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
    facultyId: '',
    roomNumber: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        courseId: item.courseId,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        subject: item.subject,
        facultyId: item.facultyId || '',
        roomNumber: item.roomNumber || '',
      })
    } else if (isOpen) {
      setFormData({
        courseId: '',
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        subject: '',
        facultyId: '',
        roomNumber: '',
      })
    }
  }, [item, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{item ? 'Edit' : 'Add New'} Schedule</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <select required value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.targetClass})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Day</label>
            <select required value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start Time</label><input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">End Time</label><input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Subject</label><input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Faculty</label>
            <select value={formData.facultyId} onChange={e => setFormData({ ...formData, facultyId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Unassigned</option>
              {facultyOptions.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.user.firstName} {faculty.user.lastName}
                </option>
              ))}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Room</label><input type="text" value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{item ? 'Update' : 'Create'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchInitialData()
  }, [router])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [scheduleRes, coursesRes, facultyRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/courses'),
        fetch('/api/auth/register?role=FACULTY&isActive=true'),
      ])

      const scheduleData = await scheduleRes.json()
      const coursesData = await coursesRes.json()
      const facultyData = await facultyRes.json()

      setSchedule(scheduleData.schedule || [])
      setCourses(coursesData.courses || [])
      const facultyProfiles = (facultyData.users || [])
        .map((user: any) => user.facultyProfile ? ({ ...user.facultyProfile, user: { firstName: user.firstName, lastName: user.lastName } }) : null)
        .filter(Boolean)
      setFacultyOptions(facultyProfiles)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schedule')
      const data = await res.json()
      setSchedule(data.schedule || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        courseId: formData.courseId,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subject: formData.subject,
        roomNumber: formData.roomNumber || null,
        facultyId: formData.facultyId || null,
      }

      const res = await fetch(editingItem ? `/api/schedule?id=${editingItem.id}` : '/api/schedule', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to save schedule')
        return
      }
      setIsModalOpen(false)
      setEditingItem(null)
      fetchSchedule()
    } catch (err) {
      console.error(err)
      alert('Failed to save schedule')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule?')) return
    try {
      const res = await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete schedule')
        return
      }
      fetchSchedule()
    } catch (err) {
      console.error(err)
      alert('Failed to delete schedule')
    }
  }

  const filteredSchedule = schedule.filter(s =>
    s.subject.toLowerCase().includes(search.toLowerCase()) ||
    s.dayOfWeek.toLowerCase().includes(search.toLowerCase()) ||
    (s.course?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">Class Schedule</h1>
          </div>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Schedule</button>
        </div>
      </header>
      <div className="p-6">
        <div className="mb-6"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search schedule..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-6 bg-gray-50 border-b text-sm font-medium text-gray-500">
            <div className="px-6 py-3">Day</div><div className="px-6 py-3">Time</div><div className="px-6 py-3">Course</div><div className="px-6 py-3">Subject</div><div className="px-6 py-3">Faculty</div><div className="px-6 py-3">Room</div>
          </div>
          <div className="divide-y">
            {loading ? <div className="px-6 py-8 text-center">Loading...</div> : filteredSchedule.length === 0 ? <div className="px-6 py-8 text-center">No schedule</div> : filteredSchedule.map(s => (
              <div key={s.id} className="grid grid-cols-6 items-center hover:bg-gray-50">
                <div className="px-6 py-4 font-medium">{s.dayOfWeek}</div>
                <div className="px-6 py-4 text-gray-600">{s.startTime} - {s.endTime}</div>
                <div className="px-6 py-4">{s.course?.name || '-'}</div>
                <div className="px-6 py-4">{s.subject}</div>
                <div className="px-6 py-4">{s.faculty ? `${s.faculty.user.firstName} ${s.faculty.user.lastName}` : '-'}</div>
                <div className="px-6 py-4 flex gap-2"><button onClick={() => { setEditingItem(s); setIsModalOpen(true) }} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-gray-100 rounded-lg text-red-600"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ScheduleModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null) }} item={editingItem} courses={courses} facultyOptions={facultyOptions} onSave={handleSave} />
    </div>
  )
}
