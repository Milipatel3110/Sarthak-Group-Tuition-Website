'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  MessageSquare,
  Clock,
  Bell,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  ChevronRight,
  Eye,
  Wallet
} from 'lucide-react'

// Mock data
const childInfo = {
  name: 'Rahul Sharma',
  class: 'Class 10',
  section: 'A',
  rollNumber: '101',
  enrollmentDate: 'April 2024',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
}

const enrolledCourses = [
  { id: 1, name: 'Mathematics', teacher: 'Sarthak Sir', progress: 75, color: 'blue' },
  { id: 2, name: 'Science', teacher: 'Dr. Rajesh Kumar', progress: 60, color: 'green' },
  { id: 3, name: 'English', teacher: 'Ms. Priya Singh', progress: 80, color: 'purple' },
  { id: 4, name: 'Social Science', teacher: 'Mr. Amit Verma', progress: 65, color: 'orange' },
]

const upcomingClasses = [
  { id: 1, subject: 'Mathematics', time: '09:00 AM - 10:30 AM', teacher: 'Sarthak Sir', room: 'Room 101', status: 'live' },
  { id: 2, subject: 'Science', time: '11:00 AM - 12:30 PM', teacher: 'Dr. Rajesh Kumar', room: 'Lab 1', status: 'upcoming' },
  { id: 3, subject: 'English', time: '02:00 PM - 03:30 PM', teacher: 'Ms. Priya Singh', room: 'Room 102', status: 'upcoming' },
]

const assignments = [
  { id: 1, title: 'Algebra Chapter 5 Exercise', subject: 'Mathematics', dueDate: '2024-01-15', status: 'pending', marks: 10 },
  { id: 2, title: 'Physics Lab Report', subject: 'Science', dueDate: '2024-01-12', status: 'submitted', marks: 20 },
  { id: 3, title: 'Essay Writing', subject: 'English', dueDate: '2024-01-10', status: 'graded', marks: 15, score: 13 },
]

const announcements = [
  { id: 1, title: 'Unit Test Schedule', date: '2024-01-08', type: 'exam', priority: 'high' },
  { id: 2, title: 'Science Exhibition', date: '2024-01-05', type: 'event', priority: 'medium' },
  { id: 3, title: 'Fee Payment Reminder', date: '2024-01-03', type: 'notice', priority: 'low' },
]

const feeDetails = {
  totalFee: 35000,
  paid: 25000,
  pending: 10000,
  dueDate: '2024-02-01',
  nextInstallment: 10000
}

const attendance = {
  total: 180,
  present: 166,
  absent: 14,
  percentage: 92
}

const recentPerformance = [
  { exam: 'Unit Test 1', subject: 'Mathematics', marks: 85, total: 100, grade: 'A' },
  { exam: 'Unit Test 1', subject: 'Science', marks: 78, total: 100, grade: 'B+' },
  { exam: 'Unit Test 1', subject: 'English', marks: 92, total: 100, grade: 'A+' },
  { exam: 'Unit Test 1', subject: 'Social Science', marks: 88, total: 100, grade: 'A' },
]

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'live': return 'bg-red-500'
      case 'upcoming': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getAssignmentStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-orange-600 bg-orange-50'
      case 'submitted': return 'text-blue-600 bg-blue-50'
      case 'graded': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A+') || grade.startsWith('A')) return 'text-green-600 bg-green-50'
    if (grade.startsWith('B+') || grade.startsWith('B')) return 'text-blue-600 bg-blue-50'
    return 'text-orange-600 bg-orange-50'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">Sarthak Group</h2>
                <p className="text-xs text-gray-500">Parent Portal</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'progress' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              {sidebarOpen && <span>Child's Progress</span>}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'attendance' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              {sidebarOpen && <span>Attendance</span>}
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'assignments' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-5 w-5" />
              {sidebarOpen && <span>Assignments</span>}
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'schedule' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-5 w-5" />
              {sidebarOpen && <span>Class Schedule</span>}
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'fees' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Wallet className="h-5 w-5" />
              {sidebarOpen && <span>Fee Details</span>}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'chat' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              {sidebarOpen && <span>Chat with Teachers</span>}
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link href="/portal/login" className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img src={childInfo.photo} alt={childInfo.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="hidden md:block">
                <p className="font-medium text-gray-900">Parent of {childInfo.name}</p>
                <p className="text-sm text-gray-500">{childInfo.class} - {childInfo.section}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome, Parent! 👋</h1>
            <p className="text-purple-100">Monitor your child's progress and stay connected with teachers.</p>
          </div>

          {/* Child Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={childInfo.photo} alt={childInfo.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{childInfo.name}</h2>
                  <p className="text-gray-500">{childInfo.class} - Section {childInfo.section} | Roll No: {childInfo.rollNumber}</p>
                  <p className="text-sm text-gray-400">Enrolled since: {childInfo.enrollmentDate}</p>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                <Eye className="h-4 w-4" />
                <span>View Profile</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{attendance.percentage}%</p>
                  <p className="text-sm text-gray-500">{attendance.present}/{attendance.total} days</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">A</p>
                  <p className="text-sm text-gray-500">Top performer</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.status === 'pending').length}</p>
                  <p className="text-sm text-gray-500">Due this week</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fee Status</p>
                  <p className="text-2xl font-bold text-gray-900">₹{feeDetails.pending.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Performance */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Exam Results</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPerformance.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{result.subject}</p>
                        <p className="text-sm text-gray-500">{result.exam}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{result.marks}/{result.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Status */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Fee Status</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Fee</span>
                    <span className="font-bold text-gray-900">₹{feeDetails.totalFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-bold text-green-600">₹{feeDetails.paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-bold text-red-600">₹{feeDetails.pending.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(feeDetails.paid / feeDetails.totalFee) * 100}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-orange-800 font-medium">Next Installment: ₹{feeDetails.nextInstallment.toLocaleString()}</p>
                  <p className="text-orange-600 text-sm">Due Date: {feeDetails.dueDate}</p>
                </div>
                <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                  Pay Now
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="mt-6 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
                <Link href="/portal/parent/schedule" className="text-purple-600 hover:text-purple-700 text-sm">View All</Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(cls.status)}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{cls.subject}</p>
                      <p className="text-sm text-gray-500">{cls.teacher} • {cls.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{cls.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cls.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {cls.status === 'live' ? 'LIVE NOW' : cls.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="mt-6 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
            </div>
            <div className="p-6 space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{ann.title}</p>
                    <p className="text-sm text-gray-500">{ann.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                    {ann.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

