'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Mail, Phone, Check, X, Send, User } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone: string
  message: string
  isResolved: boolean
  date: string
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
    fetchMessages()
  }, [router])

  const fetchMessages = async () => {
    setLoading(true)
    setMessages([
      { id: '1', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', message: 'I want to know about fee structure for Class 10 science batch.', isResolved: false, date: '2024-01-15' },
      { id: '2', name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', message: 'What is the timing for weekend classes?', isResolved: true, date: '2024-01-14' },
      { id: '3', name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', message: 'Do you provide online classes for outstation students?', isResolved: false, date: '2024-01-13' },
    ])
    setLoading(false)
  }

  const handleResolve = (id: string, resolved: boolean) => {
    setMessages(messages.map(m => m.id === id ? { ...m, isResolved: resolved } : m))
    setSelectedMessage(null)
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'resolved' && m.isResolved) || (filter === 'unresolved' && !m.isResolved)
    return matchesSearch && matchesFilter
  })

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
            {loading ? <div className="px-6 py-8 text-center">Loading...</div> : filteredMessages.length === 0 ? <div className="px-6 py-8 text-center">No messages</div> : filteredMessages.map(m => (
              <div key={m.id} onClick={() => setSelectedMessage(m)} className={'p-4 hover:bg-gray-50 cursor-pointer ' + (selectedMessage?.id === m.id ? 'bg-blue-50' : '')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-5 w-5 text-gray-500" /></div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-medium">{m.name}</h3><span className={m.isResolved ? 'text-green-600 text-xs' : 'text-orange-600 text-xs'}>{m.isResolved ? 'Resolved' : 'Pending'}</span></div>
                      <p className="text-sm text-gray-600 truncate max-w-md">{m.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{m.date}</p>
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
              <div className="flex gap-4"><div className="flex-1"><label className="text-sm text-gray-500">Email</label><p className="text-sm">{selectedMessage.email}</p></div><div className="flex-1"><label className="text-sm text-gray-500">Phone</label><p className="text-sm">{selectedMessage.phone}</p></div></div>
              <div><label className="text-sm text-gray-500">Message</label><p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedMessage.message}</p></div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => handleResolve(selectedMessage.id, true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Check className="h-4 w-4" /> Mark Resolved</button>
                <button onClick={() => setSelectedMessage(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
