'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Edit, Trash2, X } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  category: string
  imageUrl: string
  date: string | Date
  description?: string | null
}

function GalleryModal({ isOpen, onClose, item, onSave }: { isOpen: boolean; onClose: () => void; item?: GalleryItem | null; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({ title: '', category: 'EVENTS', imageUrl: '', description: '', date: '' })

  useEffect(() => {
    if (!isOpen) return
    if (item) {
      setFormData({
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description || '',
        date: String(item.date).split('T')[0],
      })
    } else {
      setFormData({ title: '', category: 'EVENTS', imageUrl: '', description: '', date: '' })
    }
  }, [item, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{item ? 'Edit' : 'Add New'} Image</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Category</label><select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="BUILDING">Building</option><option value="CLASSROOM">Classroom</option><option value="EVENTS">Events</option><option value="TRIPS">Trips</option><option value="PARTIES">Parties</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Image URL</label><input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{item ? 'Update' : 'Create'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchGallery('', 'all')
  }, [router])

  const fetchGallery = async (searchQuery = search, categoryFilter = filter) => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchQuery.trim()) query.set('search', searchQuery.trim())
      if (categoryFilter !== 'all') query.set('category', categoryFilter)
      const res = await fetch(`/api/gallery?${query.toString()}`)
      const data = await res.json()
      setGallery(data.gallery || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch(editingItem ? `/api/gallery?id=${editingItem.id}` : '/api/gallery', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to save image')
        return
      }
      setIsModalOpen(false)
      setEditingItem(null)
      fetchGallery()
    } catch (err) {
      console.error(err)
      alert('Failed to save image')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete image')
        return
      }
      fetchGallery()
    } catch (err) {
      console.error(err)
      alert('Failed to delete image')
    }
  }

  useEffect(() => {
    fetchGallery(search, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">Gallery Management</h1>
          </div>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Image</button>
        </div>
      </header>
      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search images..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Categories</option>
            <option value="BUILDING">Building</option>
            <option value="CLASSROOM">Classroom</option>
            <option value="EVENTS">Events</option>
            <option value="TRIPS">Trips</option>
            <option value="PARTIES">Parties</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? <div className="col-span-full text-center py-8">Loading...</div> : gallery.length === 0 ? <div className="col-span-full text-center py-8">No images</div> : gallery.map(g => (
            <div key={g.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md">
              <img src={g.imageUrl} alt={g.title} className="h-40 w-full object-cover bg-gray-200" />
              <div className="p-4"><h3 className="font-medium">{g.title}</h3><p className="text-sm text-gray-500">{g.category} - {new Date(g.date).toLocaleDateString()}</p></div>
              <div className="px-4 pb-4 flex gap-2"><button onClick={() => { setEditingItem(g); setIsModalOpen(true) }} className="flex-1 px-3 py-1 border rounded text-sm hover:bg-gray-50">Edit</button><button onClick={() => handleDelete(g.id)} className="flex-1 px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50">Delete</button></div>
            </div>
          ))}
        </div>
      </div>
      <GalleryModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null) }} item={editingItem} onSave={handleSave} />
    </div>
  )
}
