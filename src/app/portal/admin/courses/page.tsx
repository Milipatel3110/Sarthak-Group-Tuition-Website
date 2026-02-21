'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Edit, Trash2, BookOpen, X } from 'lucide-react'

interface Course {
  id: string
  name: string
  description: string
  subjects: string
  targetClass: string
  fee: number
  duration: string
  features: string
  isActive: boolean
}

function CourseModal({ isOpen, onClose, course, onSave }: { isOpen: boolean; onClose: () => void; course?: Course | null; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ name: '', description: '', subjects: '', targetClass: '', fee: 0, duration: '', features: '', isActive: true })

  useEffect(() => {
    if (course) {
      const s = JSON.parse(course.subjects || '[]')
      const f = JSON.parse(course.features || '[]')
      setFormData({ name: course.name, description: course.description, subjects: s.join(', '), targetClass: course.targetClass, fee: course.fee, duration: course.duration, features: f.join(', '), isActive: course.isActive })
    }
  }, [course])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{course ? 'Edit' : 'Add New'} Course</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, subjects: formData.subjects.split(',').map((s: string) => s.trim()), features: formData.features.split(',').map((s: string) => s.trim())}) }} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Course Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Target Class</label><input type="text" required value={formData.targetClass} onChange={e => setFormData({...formData, targetClass: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Fee</label><input type="number" required value={formData.fee} onChange={e => setFormData({...formData, fee: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Duration</label><input type="text" required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Subjects</label><input type="text" required value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Features</label><input type="text" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Active</span></label>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{course ? 'Update' : 'Create'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchCourses()
  }, [router])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (data.courses) setCourses(data.courses)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleSave = async (formData: any) => {
    try {
      if (editingCourse) {
        const res = await fetch('/api/courses?id=' + editingCourse.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        const data = await res.json()
        if (data.success) { alert('Course updated!'); setIsModalOpen(false); fetchCourses() }
      } else {
        const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        const data = await res.json()
        if (data.success) { alert('Course created!'); setIsModalOpen(false); fetchCourses() }
      }
    } catch (err) { console.error(err) }
    setEditingCourse(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    try {
      await fetch('/api/courses?id=' + id, { method: 'DELETE' })
      fetchCourses()
    } catch (err) { console.error(err) }
  }

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">Course Management</h1>
          </div>
          <button onClick={() => { setEditingCourse(null); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Course</button>
        </div>
      </header>
      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Course</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Class</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fee</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Duration</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th><th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th></tr></thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr> : filteredCourses.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center">No courses</td></tr> : filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><BookOpen className="h-5 w-5 text-orange-600" /></div><span className="font-medium">{course.name}</span></div></td>
                  <td className="px-6 py-4">{course.targetClass}</td>
                  <td className="px-6 py-4">₹{course.fee}</td>
                  <td className="px-6 py-4">{course.duration}</td>
                  <td className="px-6 py-4"><span className={course.isActive ? 'text-green-600' : 'text-red-600'}>{course.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => { setEditingCourse(course); setIsModalOpen(true) }} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 className="h-4 w-4 text-red-600" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CourseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingCourse(null) }} course={editingCourse} onSave={handleSave} />
    </div>
  )
}
