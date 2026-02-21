'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, BookOpen, Calendar, Users, MessageSquare,
  Bell, LogOut, User, Settings, BarChart, DollarSign,
  FileText, Image, Shield
} from 'lucide-react'

const adminInfo = { name: 'Admin' }

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalCourses: 0, pendingEnrollments: 0, revenueThisMonth: 0 })
  const [recentEnrollments] = useState([
    { id: 1, studentName: 'Rahul Sharma', class: 'Class 10', course: 'Science', status: 'pending' },
    { id: 2, studentName: 'Priya Patel', class: 'Class 11', course: 'Commerce', status: 'approved' },
  ])
  const [recentMessages] = useState([
    { id: 1, from: 'Rajesh Kumar', subject: 'Fee Inquiry', read: false },
    { id: 2, from: 'Priya Sharma', subject: 'Class Timing', read: true },
  ])

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/portal/login'); return }
    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') { router.push('/portal/login'); return }
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const studentsRes = await fetch('/api/auth/register?role=STUDENT')
      const studentsData = await studentsRes.json()
      const facultyRes = await fetch('/api/auth/register?role=FACULTY')
      const facultyData = await facultyRes.json()
      const coursesRes = await fetch('/api/courses')
      const coursesData = await coursesRes.json()
      
      setStats({
        totalStudents: studentsData.users?.length || 0,
        totalFaculty: facultyData.users?.length || 0,
        totalCourses: coursesData.courses?.length || 0,
        pendingEnrollments: 5,
        revenueThisMonth: 425000
      })
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/portal/login')
  }

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart, href: '/portal/admin' },
    { key: 'users', label: 'Users', icon: Users, href: '/portal/admin/users' },
    { key: 'courses', label: 'Courses', icon: BookOpen, href: '/portal/admin/courses' },
    { key: 'enrollments', label: 'Enrollments', icon: FileText, href: '/portal/admin/enrollments' },
    { key: 'schedule', label: 'Schedule', icon: Calendar, href: '/portal/admin/schedule' },
    { key: 'gallery', label: 'Gallery', icon: Image, href: '/portal/admin/gallery' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/portal/admin/messages' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/portal/admin/settings' },
  ]

  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20'
  const mainMargin = sidebarOpen ? 'ml-64' : 'ml-20'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarWidth} bg-slate-900 text-white shadow-lg transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold">Sarthak Group</h2>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            )}
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.key} href={item.href} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`${mainMargin} flex-1 transition-all duration-300`}>
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative"><Bell className="h-5 w-5 text-gray-600" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center"><span className="text-white font-medium">A</span></div>
              <div className="hidden md:block"><p className="font-medium text-gray-900">{adminInfo.name}</p><p className="text-sm text-gray-500">Administrator</p></div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-slate-300">Manage your coaching center efficiently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Link href="/portal/admin/users" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Students</p><p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div></div>
            </Link>
            <Link href="/portal/admin/users?role=faculty" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Faculty</p><p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><GraduationCap className="h-6 w-6 text-green-600" /></div></div>
            </Link>
            <Link href="/portal/admin/enrollments" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Pending Enrollments</p><p className="text-2xl font-bold text-gray-900">{stats.pendingEnrollments}</p></div><div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-orange-600" /></div></div>
            </Link>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Revenue (This Month)</p><p className="text-2xl font-bold text-gray-900">₹{stats.revenueThisMonth.toLocaleString()}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="h-6 w-6 text-green-600" /></div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">Recent Enrollments</h2><Link href="/portal/admin/enrollments" className="text-red-600 hover:text-red-700 text-sm">View All</Link></div>
              <div className="p-6"><div className="space-y-4">
                {recentEnrollments.map((enrollment) => (<div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium text-gray-900">{enrollment.studentName}</p><p className="text-sm text-gray-500">{enrollment.class} - {enrollment.course}</p></div><span className={enrollment.status === 'pending' ? 'text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600' : 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-600'}>{enrollment.status}</span></div>))}
              </div></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2><Link href="/portal/admin/messages" className="text-red-600 hover:text-red-700 text-sm">View All</Link></div>
              <div className="p-6"><div className="space-y-4">
                {recentMessages.map((message) => (<div key={message.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-start space-x-3"><div className={message.read ? 'w-2 h-2 mt-2 rounded-full bg-gray-300' : 'w-2 h-2 mt-2 rounded-full bg-red-500'}></div><div><p className="font-medium text-gray-900">{message.from}</p><p className="text-sm text-gray-500">{message.subject}</p></div></div></div>))}
              </div></div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b"><h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2></div>
            <div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link href="/portal/admin/users?role=student" className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Users className="h-8 w-8 text-blue-600 mb-2" /><span className="text-sm font-medium text-blue-600">Add Student</span></Link>
              <Link href="/portal/admin/users?role=faculty" className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"><GraduationCap className="h-8 w-8 text-green-600 mb-2" /><span className="text-sm font-medium text-green-600">Add Faculty</span></Link>
              <Link href="/portal/admin/users?role=parent" className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"><User className="h-8 w-8 text-purple-600 mb-2" /><span className="text-sm font-medium text-purple-600">Add Parent</span></Link>
              <Link href="/portal/admin/courses" className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"><BookOpen className="h-8 w-8 text-orange-600 mb-2" /><span className="text-sm font-medium text-orange-600">Add Course</span></Link>
              <Link href="/portal/admin/schedule" className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Calendar className="h-8 w-8 text-red-600 mb-2" /><span className="text-sm font-medium text-red-600">Schedule</span></Link>
              <Link href="/portal/admin/messages" className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"><Bell className="h-8 w-8 text-indigo-600 mb-2" /><span className="text-sm font-medium text-indigo-600">Post Notice</span></Link>
            </div></div>
          </div>
        </div>
      </main>
    </div>
  )
}

