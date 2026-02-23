'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Check, X, User } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  isResolved: boolean
  createdAt: string
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchMessages('', 'all')
  }, [router])

  const fetchMessages = async (searchValue = search, filterValue = filter) => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchValue.trim()) query.set('search', searchValue.trim())
      if (filterValue === 'resolved') query.set('status', 'resolved')
      if (filterValue === 'unresolved') query.set('status', 'unresolved')
      const res = await fetch(`/api/contact?${query.toString()}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id: string, resolved: boolean) => {
    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: resolved }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to update message status')
        return
      }
      setSelectedMessage(null)
      fetchMessages()
    } catch (err) {
      console.error(err)
      alert('Failed to update message status')
    }
  }

  useEffect(() => {
    fetchMessages(search, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
        </div>
      </header>
      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Messages</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {loading ? <div className="px-6 py-8 text-center">Loading...</div> : messages.length === 0 ? <div className="px-6 py-8 text-center">No messages</div> : messages.map(m => (
              <div key={m.id} onClick={() => setSelectedMessage(m)} className={'p-4 hover:bg-gray-50 cursor-pointer ' + (selectedMessage?.id === m.id ? 'bg-blue-50' : '')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-5 w-5 text-gray-500" /></div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-medium">{m.name}</h3><span className={m.isResolved ? 'text-green-600 text-xs' : 'text-orange-600 text-xs'}>{m.isResolved ? 'Resolved' : 'Pending'}</span></div>
                      <p className="text-sm text-gray-600 truncate max-w-md">{m.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Message Details</h2>
              <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-gray-500">From</label><p className="font-medium">{selectedMessage.name}</p></div>
              <div className="flex gap-4"><div className="flex-1"><label className="text-sm text-gray-500">Email</label><p className="text-sm">{selectedMessage.email}</p></div><div className="flex-1"><label className="text-sm text-gray-500">Phone</label><p className="text-sm">{selectedMessage.phone || '-'}</p></div></div>
              <div><label className="text-sm text-gray-500">Message</label><p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedMessage.message}</p></div>
              <div className="flex gap-3 pt-4">
                {!selectedMessage.isResolved ? (
                  <button onClick={() => handleResolve(selectedMessage.id, true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Check className="h-4 w-4" /> Mark Resolved</button>
                ) : (
                  <button onClick={() => handleResolve(selectedMessage.id, false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><X className="h-4 w-4" /> Mark Pending</button>
                )}
                <button onClick={() => setSelectedMessage(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
