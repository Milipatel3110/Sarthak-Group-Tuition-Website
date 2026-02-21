'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Bell, Shield, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ firstName: 'Admin', lastName: 'User', email: 'admin@sarthakgroup.com', phone: '9876543210' })
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: false })
  const [institute, setInstitute] = useState({ name: 'Sarthak Group Tuition', address: '12, Janakpuri Society, Nigam Smruti Mandir Road, Ghodasar, Ahmedabad, Gujarat 380050', phone: '9876543210', email: 'info@sarthakgroup.com' })

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
  }, [router])

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); alert('Settings saved successfully!') }, 1000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'institute', label: 'Institute', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/portal/admin" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b">
            <div className="flex">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ' + (activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">A</div>
                  <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Change Photo</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value="********" className="w-full px-3 py-2 border rounded-lg" /><p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p></div>
              </div>
            )}
            {activeTab === 'institute' && (
              <div className="space-y-6 max-w-lg">
                <div><label className="block text-sm font-medium mb-1">Institute Name</label><input type="text" value={institute.name} onChange={e => setInstitute({...institute, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Address</label><textarea rows={3} value={institute.address} onChange={e => setInstitute({...institute, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={institute.phone} onChange={e => setInstitute({...institute, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={institute.email} onChange={e => setInstitute({...institute, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-lg">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive email for new enrollments and messages</p></div><input type="checkbox" checked={notifications.email} onChange={e => setNotifications({...notifications, email: e.target.checked})} className="w-5 h-5" /></label>
                  <label className="flex items-center justify-between p-4 border rounded-lg"><div><p className="font-medium">SMS Notifications</p><p className="text-sm text-gray-500">Receive SMS for important updates</p></div><input type="checkbox" checked={notifications.sms} onChange={e => setNotifications({...notifications, sms: e.target.checked})} className="w-5 h-5" /></label>
                  <label className="flex items-center justify-between p-4 border rounded-lg"><div><p className="font-medium">Push Notifications</p><p className="text-sm text-gray-500">Receive push notifications in browser</p></div><input type="checkbox" checked={notifications.push} onChange={e => setNotifications({...notifications, push: e.target.checked})} className="w-5 h-5" /></label>
                </div>
              </div>
            )}
            <div className="mt-6 pt-6 border-t">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
