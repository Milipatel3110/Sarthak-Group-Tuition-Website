'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  Users,
  MessageSquare,
  Bell,
  LogOut,
  CheckCircle,
  AlertCircle,
  Play,
  Upload,
  BarChart3,
  Video,
  Home,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  File,
  Download,
  Send,
  Users2,
  ClipboardList,
  FolderOpen,
  Menu,
  TrendingUp,
  Clock,
  FileUp,
  MessageCircle,
  Save,
  MoreVertical
} from 'lucide-react'

// Types
interface Student {
  id: number
  name: string
  class: string
  rollNo: string
  attendance: number
  avgGrade: string
  parentContact: string
  email: string
}

interface Assignment {
  id: number
  title: string
  class: string
  subject: string
  dueDate: string
  status: 'active' | 'closed'
  submissions: number
  total: number
}

interface Material {
  id: number
  title: string
  class: string
  type: string
  size: string
  downloads: number
  date: string
}

interface Grade {
  id: number
  student: string
  class: string
  exam: string
  marks: number
  maxMarks: number
  grade: string
}

interface ChatMessage {
  from: 'faculty' | 'parent'
  text: string
  time: string
}

// Mock data
const facultyInfo = {
  name: 'Sarthak Sharma',
  designation: 'Owner & Mathematics Teacher',
  experience: '10+ years',
  photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  email: 'sarthak.computer@gmail.com'
}

const coursesData = [
  { id: 1, name: 'Mathematics', class: 'Class 10', students: 45, batches: 2, schedule: 'Mon-Sat 9:00 AM' },
  { id: 2, name: 'Mathematics', class: 'Class 11 Science', students: 35, batches: 1, schedule: 'Mon-Sat 11:00 AM' },
  { id: 3, name: 'Mathematics', class: 'Class 12 Science', students: 30, batches: 1, schedule: 'Mon-Sat 2:00 PM' },
]

const studentsData: Student[] = [
  { id: 1, name: 'Rahul Sharma', class: 'Class 10', rollNo: '101', attendance: 92, avgGrade: 'A+', parentContact: '+91 9876543210', email: 'rahul@email.com' },
  { id: 2, name: 'Priya Patel', class: 'Class 10', rollNo: '102', attendance: 88, avgGrade: 'A', parentContact: '+91 9876543211', email: 'priya@email.com' },
  { id: 3, name: 'Amit Singh', class: 'Class 10', rollNo: '103', attendance: 85, avgGrade: 'A', parentContact: '+91 9876543212', email: 'amit@email.com' },
  { id: 4, name: 'Sneha Gupta', class: 'Class 11', rollNo: '201', attendance: 90, avgGrade: 'A+', parentContact: '+91 9876543213', email: 'sneha@email.com' },
  { id: 5, name: 'Raj Kumar', class: 'Class 11', rollNo: '202', attendance: 78, avgGrade: 'B+', parentContact: '+91 9876543214', email: 'raj@email.com' },
]

const assignmentsData: Assignment[] = [
  { id: 1, title: 'Algebra Chapter 5 Exercise', class: 'Class 10', subject: 'Mathematics', dueDate: '2024-01-15', status: 'active', submissions: 30, total: 45 },
  { id: 2, title: 'Trigonometry Test', class: 'Class 11', subject: 'Mathematics', dueDate: '2024-01-12', status: 'closed', submissions: 35, total: 35 },
  { id: 3, title: 'Calculus Practice', class: 'Class 12', subject: 'Mathematics', dueDate: '2024-01-18', status: 'active', submissions: 10, total: 30 },
]

const materialsData: Material[] = [
  { id: 1, title: 'Quadratic Equations Notes', class: 'Class 10', type: 'PDF', size: '2.5 MB', downloads: 45, date: '2024-01-10' },
  { id: 2, title: 'Limits and Continuity', class: 'Class 11', type: 'PDF', size: '3.2 MB', downloads: 35, date: '2024-01-08' },
  { id: 3, title: 'Integration Formulas', class: 'Class 12', type: 'PDF', size: '1.8 MB', downloads: 28, date: '2024-01-05' },
]

const gradesData: Grade[] = [
  { id: 1, student: 'Rahul Sharma', class: 'Class 10', exam: 'Unit Test 3', marks: 48, maxMarks: 50, grade: 'A+' },
  { id: 2, student: 'Priya Patel', class: 'Class 10', exam: 'Unit Test 3', marks: 45, maxMarks: 50, grade: 'A+' },
  { id: 3, student: 'Amit Singh', class: 'Class 10', exam: 'Unit Test 3', marks: 42, maxMarks: 50, grade: 'A' },
  { id: 4, student: 'Sneha Gupta', class: 'Class 11', exam: 'Unit Test 3', marks: 44, maxMarks: 50, grade: 'A+' },
]

const chatData = [
  { id: 1, parent: 'Mr. Sharma', student: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', messages: [
    { from: 'parent', text: 'Hello Sir, I wanted to discuss about Rahul\'s progress', time: '10:00 AM' },
    { from: 'faculty', text: 'Hello! Sure, Rahul is doing great. He scored 48/50 in the last test.', time: '10:05 AM' },
  ]},
  { id: 2, parent: 'Mr. Patel', student: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', messages: [
    { from: 'parent', text: 'Sir, can we schedule a meeting?', time: 'Yesterday' },
  ]},
]

const upcomingClasses = [
  { id: 1, subject: 'Mathematics', class: 'Class 10', time: '09:00 AM - 10:30 AM', room: 'Room 101', status: 'live', topic: 'Quadratic Equations' },
  { id: 2, subject: 'Mathematics', class: 'Class 11', time: '11:00 AM - 12:30 PM', room: 'Room 102', status: 'upcoming', topic: 'Limits' },
  { id: 3, subject: 'Mathematics', class: 'Class 12', time: '02:00 PM - 03:30 PM', room: 'Room 103', status: 'upcoming', topic: 'Integration' },
]

const pendingTasks = [
  { id: 1, title: 'Grade Class 10 Assignment', type: 'grading', priority: 'high', dueDate: 'Today', completed: false },
  { id: 2, title: 'Upload Class 11 Notes', type: 'upload', priority: 'medium', dueDate: 'Tomorrow', completed: false },
  { id: 3, title: 'Mark Attendance - Class 12', type: 'attendance', priority: 'high', dueDate: 'Today', completed: false },
  { id: 4, title: 'Prepare Test Paper', type: 'test', priority: 'low', dueDate: 'Next Week', completed: false },
]

export default function FacultyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeChat, setActiveChat] = useState(1)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState(chatData)
  const [tasks, setTasks] = useState(pendingTasks)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [newGradeMarks, setNewGradeMarks] = useState('')
  const [materials, setMaterials] = useState(materialsData)
  const [assignments, setAssignments] = useState(assignmentsData)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
    showNotification('Task updated!')
  }

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return
    setChatHistory(chatHistory.map(c => 
      c.id === activeChat 
        ? { ...c, messages: [...c.messages, { from: 'faculty' as const, text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : c
    ))
    setChatMessage('')
  }

  const deleteAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id))
    showNotification('Assignment deleted!')
  }

  const deleteMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id))
    showNotification('Material deleted!')
  }

  const updateGrade = () => {
    if (!selectedGrade || !newGradeMarks) return
    const marks = parseInt(newGradeMarks)
    let grade = 'F'
    if (marks >= 90) grade = 'A+'
    else if (marks >= 80) grade = 'A'
    else if (marks >= 70) grade = 'B+'
    else if (marks >= 60) grade = 'B'
    else if (marks >= 50) grade = 'C'
    
    showNotification(`Grade updated! New grade: ${grade}`)
    setShowGradeModal(false)
    setNewGradeMarks('')
  }

  const filteredStudents = studentsData.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  )

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {facultyInfo.name}! 👋</h1>
              <p className="text-green-100">Here's your teaching schedule and tasks for today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">110</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{coursesData.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => !t.completed).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Classes</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
                  <button onClick={() => setActiveTab('live')} className="text-green-600 hover:text-green-700 text-sm">Start Live Class</button>
                </div>
                <div className="p-6 space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${cls.status === 'live' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{cls.subject} - {cls.class}</p>
                          <p className="text-sm text-gray-500">{cls.room} • {cls.topic}</p>
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

              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Tasks</h2>
                </div>
                <div className="p-6 space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="mt-1" 
                        />
                        <div>
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'text-red-600 bg-red-50' : 
                        task.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 bg-gray-50'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <button onClick={() => setActiveTab('courses')} className="text-green-600 hover:text-green-700 text-sm">View All →</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {coursesData.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.class}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <Users className="inline h-4 w-4 mr-1" />
                        {course.students} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                  <p className="text-sm text-gray-500">Manage your teaching courses</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Course
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {coursesData.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
                            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">{course.class}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{course.schedule}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {course.students} Students
                            </span>
                            <span className="flex items-center gap-1">
                              <Users2 className="h-4 w-4" />
                              {course.batches} Batches
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'students':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">My Students</h2>
                    <p className="text-sm text-gray-500">View and manage your students</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Roll No</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Class</th>
                        <th className="pb-3">Attendance</th>
                        <th className="pb-3">Avg Grade</th>
                        <th className="pb-3">Parent Contact</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-3 font-medium text-gray-900">{student.rollNo}</td>
                          <td className="py-3 text-gray-600">{student.name}</td>
                          <td className="py-3 text-gray-600">{student.class}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              student.attendance >= 90 ? 'bg-green-50 text-green-600' : 
                              student.attendance >= 80 ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {student.attendance}%
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                              {student.avgGrade}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600">{student.parentContact}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setSelectedStudent(student); setShowGradeModal(true) }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Add Grade"
                              >
                                <TrendingUp className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View Profile">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Message Parent">
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      case 'assignments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
                  <p className="text-sm text-gray-500">Manage assignments and submissions</p>
                </div>
                <button 
                  onClick={() => showNotification('Create assignment form would open here')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{assignment.class}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              assignment.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {assignment.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Due: {assignment.dueDate}</span>
                            <span>Submissions: {assignment.submissions}/{assignment.total}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setSelectedAssignment(assignment); setShowAssignmentModal(true) }}
                            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            View Submissions
                          </button>
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Grade
                          </button>
                          <button 
                            onClick={() => deleteAssignment(assignment.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
                  <p className="text-sm text-gray-500">Mark and view student attendance</p>
                </div>
                <select className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Select Class</option>
                  <option>Class 10</option>
                  <option>Class 11</option>
                  <option>Class 12</option>
                </select>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Roll No</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.slice(0, 5).map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-3 font-medium text-gray-900">{student.rollNo}</td>
                          <td className="py-3 text-gray-600">{student.name}</td>
                          <td className="py-3">
                            <select className="border rounded px-2 py-1 text-sm">
                              <option>Present</option>
                              <option>Absent</option>
                              <option>Late</option>
                            </select>
                          </td>
                          <td className="py-3">
                            <button 
                              onClick={() => showNotification('Attendance saved!')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      case 'grades':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Grades & Results</h2>
                  <p className="text-sm text-gray-500">Enter and manage student grades</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Exam Result
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Class</th>
                        <th className="pb-3">Exam</th>
                        <th className="pb-3">Marks</th>
                        <th className="pb-3">Grade</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData.map((grade) => (
                        <tr key={grade.id} className="border-b">
                          <td className="py-3 font-medium text-gray-900">{grade.student}</td>
                          <td className="py-3 text-gray-600">{grade.class}</td>
                          <td className="py-3 text-gray-600">{grade.exam}</td>
                          <td className="py-3 text-gray-600">{grade.marks}/{grade.maxMarks}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                              {grade.grade}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setSelectedGrade(grade); setShowGradeModal(true) }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      case 'materials':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
                  <p className="text-sm text-gray-500">Upload and manage study materials</p>
                </div>
                <button 
                  onClick={() => setShowMaterialModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Material
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <File className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{material.title}</h3>
                          <p className="text-sm text-gray-500">{material.class} • {material.size}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{material.downloads} downloads</span>
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteMaterial(material.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'live':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Live Classes</h2>
                <p className="text-sm text-gray-500">Start and manage live classes</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{cls.subject} - {cls.class}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${cls.status === 'live' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                          {cls.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{cls.topic}</p>
                      <p className="text-sm text-gray-500 mb-4">{cls.time} • {cls.room}</p>
                      {cls.status === 'live' ? (
                        <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                          <Video className="h-4 w-4" />
                          Join Live Class
                        </button>
                      ) : (
                        <button 
                          onClick={() => showNotification('Live class started!')}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Start Class
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'chat':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <p className="text-sm text-gray-500">Chat with parents</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Conversations</h3>
                    <div className="space-y-2">
                      {chatHistory.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setActiveChat(chat.id)}
                          className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                            activeChat === chat.id ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <img src={chat.avatar} alt={chat.parent} className="w-10 h-10 rounded-full" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{chat.parent}</p>
                            <p className="text-sm text-gray-500">Re: {chat.student}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 border rounded-lg p-4">
                    <div className="h-96 flex flex-col">
                      <div className="flex items-center gap-3 pb-4 border-b mb-4">
                        <img src={chatHistory.find(c => c.id === activeChat)?.avatar} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900">{chatHistory.find(c => c.id === activeChat)?.parent}</p>
                          <p className="text-sm text-gray-500">Parent of {chatHistory.find(c => c.id === activeChat)?.student}</p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {chatHistory.find(c => c.id === activeChat)?.messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.from === 'faculty' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              msg.from === 'faculty' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p>{msg.text}</p>
                              <p className={`text-xs mt-1 ${msg.from === 'faculty' ? 'text-green-200' : 'text-gray-500'}`}>
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder="Type your message..."
                          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button 
                          onClick={sendChatMessage}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedGrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Update Grade</h2>
              <button onClick={() => setShowGradeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Student</p>
                <p className="font-medium">{selectedGrade.student}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Exam</p>
                <p className="font-medium">{selectedGrade.exam}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Marks</p>
                <p className="font-medium">{selectedGrade.marks}/{selectedGrade.maxMarks}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">New Marks</label>
                <input
                  type="number"
                  value={newGradeMarks}
                  onChange={(e) => setNewGradeMarks(e.target.value)}
                  placeholder="Enter marks"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button 
                onClick={updateGrade}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
              <button onClick={() => setShowMaterialModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Material title"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Class</label>
                <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Class 10</option>
                  <option>Class 11</option>
                  <option>Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload file</p>
                </div>
              </div>
              <button 
                onClick={() => { showNotification('Material uploaded!'); setShowMaterialModal(false) }}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Submissions Modal */}
      {showAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{selectedAssignment.title}</h2>
              <button onClick={() => setShowAssignmentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Submissions: {selectedAssignment.submissions}/{selectedAssignment.total}</p>
              <div className="space-y-3">
                {studentsData.slice(0, selectedAssignment.submissions).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.rollNo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">View</button>
                      <button 
                        onClick={() => showNotification(`Graded for ${student.name}`)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <Link href="/" className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </Link>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">Sarthak Group</h2>
                <p className="text-xs text-gray-500">Faculty Portal</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'courses', icon: BookOpen, label: 'My Courses' },
              { id: 'students', icon: Users, label: 'Students' },
              { id: 'assignments', icon: FileText, label: 'Assignments' },
              { id: 'attendance', icon: CheckCircle, label: 'Attendance' },
              { id: 'grades', icon: BarChart3, label: 'Grades' },
              { id: 'materials', icon: FolderOpen, label: 'Materials' },
              { id: 'live', icon: Video, label: 'Live Classes' },
              { id: 'chat', icon: MessageSquare, label: 'Messages' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link href="/portal/login" className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img src={facultyInfo.photo} alt={facultyInfo.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="hidden md:block">
                <p className="font-medium text-gray-900">{facultyInfo.name}</p>
                <p className="text-sm text-gray-500">{facultyInfo.designation}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

