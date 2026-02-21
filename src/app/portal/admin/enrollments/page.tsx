'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Check, X, User, Loader2 } from 'lucide-react'

interface Enrollment {
  id: string
  studentName: string
  parentName: string
  email: string
  phone: string
  class: string
  medium: string
  course: string
  status: string
  createdAt: string
}

export default function AdminEnrollmentsPage() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchEnrollments()
  }, [router])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/enrollments')
      const data = await res.json()
      if (data.enrollments) setEnrollments(data.enrollments)
    } catch (err) {
      console.error('Error fetching enrollments:', err)
    }
    setLoading(false)
  }

  const handleStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/enrollments?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Enrollment ${newStatus.toLowerCase()} successfully!`)
        fetchEnrollments()
      } else {
        alert(data.error || 'Error updating status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error updating status')
    }
    setUpdatingId(null)
  }

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.studentName.toLowerCase().includes(search.toLowerCase()) || e.parentName.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || e.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">Enrollment Management</h1>
          </div>
        </div>
      </header>
      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search enrollments..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Student</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Class</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Course</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">No enrollments found</td></tr>
              ) : (
                filteredEnrollments.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User className="h-5 w-5 text-blue-600" /></div>
                        <div><p className="font-medium">{e.studentName}</p><p className="text-sm text-gray-500">{e.parentName}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{e.class} ({e.medium})</td>
                    <td className="px-6 py-4">{e.course}</td>
                    <td className="px-6 py-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 
                        e.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 
                        'bg-red-100 text-red-600'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {e.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleStatus(e.id, 'ACTIVE')} 
                              disabled={updatingId === e.id}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600 disabled:opacity-50"
                            >
                              {updatingId === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button 
                              onClick={() => handleStatus(e.id, 'REJECTED')}
                              disabled={updatingId === e.id}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

