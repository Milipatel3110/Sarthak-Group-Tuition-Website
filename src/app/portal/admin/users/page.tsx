'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Users, User, Plus, Search, Edit, Trash2, X, ArrowLeft } from 'lucide-react'

type UserRole = 'STUDENT' | 'PARENT' | 'FACULTY'

interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  createdAt: string
  studentProfile?: {
    class?: string
    schoolName?: string | null
    dateOfBirth?: string | null
    parentId?: string | null
  } | null
  parentProfile?: {
    occupation?: string | null
  } | null
  facultyProfile?: {
    qualification?: string
    subjects?: string
    experienceYears?: number
    bio?: string | null
    isOwner?: boolean
  } | null
}

function UserModal({ isOpen, onClose, user, role, onSave }: { isOpen: boolean; onClose: () => void; user?: User | null; role: UserRole; onSave: (data: any) => void }) {
  const emptyForm = {
    email: '', password: '', firstName: '', lastName: '', phone: '',
    class: '', schoolName: '', dateOfBirth: '', occupation: '',
    qualification: '', subjects: '', experienceYears: 0, bio: '',
  }
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (!isOpen) return

    let facultySubjects = ''
    if (user?.facultyProfile?.subjects) {
      try {
        const parsed = JSON.parse(user.facultyProfile.subjects)
        facultySubjects = Array.isArray(parsed) ? parsed.join(', ') : String(user.facultyProfile.subjects)
      } catch {
        facultySubjects = String(user.facultyProfile.subjects)
      }
    }

    if (user) {
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        class: user.studentProfile?.class || '',
        schoolName: user.studentProfile?.schoolName || '',
        dateOfBirth: user.studentProfile?.dateOfBirth ? String(user.studentProfile.dateOfBirth).split('T')[0] : '',
        occupation: user.parentProfile?.occupation || '',
        qualification: user.facultyProfile?.qualification || '',
        subjects: facultySubjects,
        experienceYears: user.facultyProfile?.experienceYears || 0,
        bio: user.facultyProfile?.bio || '',
      })
    } else {
      setFormData(emptyForm)
    }
  }, [isOpen, user, role])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{user ? 'Edit' : 'Add New'} {role === 'STUDENT' ? 'Student' : role === 'PARENT' ? 'Parent' : 'Faculty'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          {!user && <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>}
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          {role === 'STUDENT' && (
            <><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Class</label><select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="Class 11">Class 11</option><option value="Class 12">Class 12</option></select></div><div><label className="block text-sm font-medium mb-1">DOB</label><input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div></div><div><label className="block text-sm font-medium mb-1">School</label><input type="text" value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div></>
          )}
          {role === 'PARENT' && <div><label className="block text-sm font-medium mb-1">Occupation</label><input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>}
          {role === 'FACULTY' && (
            <><div><label className="block text-sm font-medium mb-1">Qualification</label><input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Subjects</label><input type="text" placeholder="Math, Physics" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Experience</label><input type="number" min="0" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Bio</label><textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div></>
          )}
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{user ? 'Update' : 'Create'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('STUDENT')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => { fetchUsers() }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/register?role=${activeTab}`)
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleSave = async (formData: any) => {
    try {
      const subjects = formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : []
      const payload = { ...formData, role: activeTab, subjects, dateOfBirth: formData.dateOfBirth || null }
      const isEditing = Boolean(editingUser)
      const res = await fetch(isEditing ? '/api/auth/register' : '/api/auth/register', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: editingUser?.id, ...payload } : payload),
      })
      const data = await res.json()
      if (data.success) {
        alert(`User ${isEditing ? 'updated' : 'created'} successfully!`)
        setIsModalOpen(false)
        setEditingUser(null)
        fetchUsers()
      } else alert(data.error || 'Error')
    } catch (err) { console.error(err); alert('Error saving') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this user?')) return
    try {
      const res = await fetch(`/api/auth/register?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete user')
        return
      }
      alert('User deactivated successfully')
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">User Management</h1>
          </div>
          <button onClick={() => { setEditingUser(null); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add {activeTab === 'STUDENT' ? 'Student' : activeTab === 'PARENT' ? 'Parent' : 'Faculty'}</button>
        </div>
      </header>
      <div className="bg-white border-b">
        <div className="px-6 flex gap-1">
          <button onClick={() => setActiveTab('STUDENT')} className={`flex items-center gap-2 px-4 py-3 border-b-2 ${activeTab === 'STUDENT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}><Users className="h-4 w-4" /> Students</button>
          <button onClick={() => setActiveTab('PARENT')} className={`flex items-center gap-2 px-4 py-3 border-b-2 ${activeTab === 'PARENT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}><User className="h-4 w-4" /> Parents</button>
          <button onClick={() => setActiveTab('FACULTY')} className={`flex items-center gap-2 px-4 py-3 border-b-2 ${activeTab === 'FACULTY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}><GraduationCap className="h-4 w-4" /> Faculty</button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Joined</th><th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td></tr> : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 font-medium">{user.firstName[0]}{user.lastName[0]}</span></div><span className="font-medium">{user.firstName} {user.lastName}</span></div></td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="px-6 py-4"><span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => { setEditingUser(user); setIsModalOpen(true) }} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="h-4 w-4 text-gray-600" /></button><button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 className="h-4 w-4 text-red-600" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={editingUser} role={activeTab} onSave={handleSave} />
    </div>
  )
}

