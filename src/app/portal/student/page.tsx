'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  MessageSquare,
  Bell,
  LogOut,
  CheckCircle,
  Play,
  Download,
  Video,
  Users,
  BarChart3,
  Send,
  File,
  X,
  Check,
  Upload,
  Eye,
  ChevronRight,
  Menu,
  Home,
  Clock,
  MapPin,
  Phone,
  Mail,
  PlayCircle,
  AlertTriangle,
  Star,
  ArrowLeft,
  MoreVertical,
  FileUp,
  MessageCircle
} from 'lucide-react'

// Types
interface Course {
  id: number
  name: string
  teacher: string
  progress: number
  color: string
  classes: number
  completed: number
  nextClass: string
  description: string
  syllabus: string[]
}

interface Assignment {
  id: number
  title: string
  subject: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  marks: number
  description: string
  score?: number
  feedback?: string
  file?: File
}

interface ChatMessage {
  id: number
  from: 'student' | 'teacher'
  text: string
  time: string
}

interface Teacher {
  id: number
  name: string
  subject: string
  avatar: string
  messages: ChatMessage[]
}

// Mock data
const studentInfo = {
  name: 'Rahul Sharma',
  class: 'Class 10',
  section: 'A',
  rollNumber: '101',
  enrollmentDate: 'April 2024',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  email: 'rahul.sharma@email.com',
  phone: '+91 9876543210'
}

const coursesData: Course[] = [
  { id: 1, name: 'Mathematics', teacher: 'Sarthak Sir', progress: 75, color: 'blue', classes: 45, completed: 34, nextClass: 'Chapter 5: Quadratic Equations', description: 'Complete mathematics curriculum for Class 10 including Algebra, Geometry, Trigonometry and Statistics', syllabus: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability'] },
  { id: 2, name: 'Science', teacher: 'Dr. Rajesh Kumar', progress: 60, color: 'green', classes: 40, completed: 24, nextClass: 'Physics: Light', description: 'Physics, Chemistry, and Biology for Class 10', syllabus: ['Physics', 'Chemistry', 'Biology'] },
  { id: 3, name: 'English', teacher: 'Ms. Priya Singh', progress: 80, color: 'purple', classes: 35, completed: 28, nextClass: 'Essay Writing', description: 'English grammar, literature, and composition', syllabus: ['Grammar', 'Literature', 'Writing', 'Reading'] },
  { id: 4, name: 'Social Science', teacher: 'Mr. Amit Verma', progress: 65, color: 'orange', classes: 30, completed: 20, nextClass: 'History: Independence', description: 'History, Geography, Civics, and Economics', syllabus: ['History', 'Geography', 'Civics', 'Economics'] },
]

const assignmentsData: Assignment[] = [
  { id: 1, title: 'Algebra Chapter 5 Exercise', subject: 'Mathematics', dueDate: '2024-01-15', status: 'pending', marks: 10, description: 'Solve all questions from Exercise 5.1 to 5.5 - Quadratic Equations' },
  { id: 2, title: 'Physics Lab Report', subject: 'Science', dueDate: '2024-01-12', status: 'submitted', marks: 20, description: 'Write lab report for Light experiment - reflection and refraction', file: undefined },
  { id: 3, title: 'Essay Writing', subject: 'English', dueDate: '2024-01-10', status: 'graded', marks: 15, score: 13, feedback: 'Good effort! Work on grammar and punctuation.' },
  { id: 4, title: 'Map Work', subject: 'Social Science', dueDate: '2024-01-18', status: 'pending', marks: 5, description: 'Mark important places on India map - Freedom Struggle' },
  { id: 5, title: 'Chemistry Numericals', subject: 'Science', dueDate: '2024-01-08', status: 'graded', marks: 20, score: 18, feedback: 'Excellent work! Keep it up.' },
]

const studyMaterials = [
  { id: 1, title: 'Mathematics Formula Sheet', type: 'PDF', subject: 'Mathematics', size: '2.5 MB', downloads: 45, date: '2024-01-10', url: '#' },
  { id: 2, title: 'Science Notes - Chapter 1', type: 'PDF', subject: 'Science', size: '1.8 MB', downloads: 32, date: '2024-01-08', url: '#' },
  { id: 3, title: 'English Grammar Guide', type: 'PDF', subject: 'English', size: '3.2 MB', downloads: 28, date: '2024-01-05', url: '#' },
  { id: 4, title: 'History Timeline', type: 'PDF', subject: 'Social Science', size: '1.2 MB', downloads: 22, date: '2024-01-03', url: '#' },
  { id: 5, title: 'Physics Formulas', type: 'PDF', subject: 'Science', size: '0.8 MB', downloads: 35, date: '2024-01-01', url: '#' },
]

const gradesData = [
  { subject: 'Mathematics', exams: [
    { name: 'Unit Test 1', marks: 45, maxMarks: 50, grade: 'A+', date: '2024-01-05' },
    { name: 'Unit Test 2', marks: 42, maxMarks: 50, grade: 'A', date: '2023-12-20' },
    { name: 'Half Yearly', marks: 88, maxMarks: 100, grade: 'A+', date: '2023-11-15' },
  ]},
  { subject: 'Science', exams: [
    { name: 'Unit Test 1', marks: 38, maxMarks: 50, grade: 'A', date: '2024-01-05' },
    { name: 'Unit Test 2', marks: 40, maxMarks: 50, grade: 'A', date: '2023-12-20' },
    { name: 'Half Yearly', marks: 82, maxMarks: 100, grade: 'A+', date: '2023-11-15' },
  ]},
  { subject: 'English', exams: [
    { name: 'Unit Test 1', marks: 44, maxMarks: 50, grade: 'A+', date: '2024-01-05' },
    { name: 'Unit Test 2', marks: 46, maxMarks: 50, grade: 'A+', date: '2023-12-20' },
    { name: 'Half Yearly', marks: 90, maxMarks: 100, grade: 'A+', date: '2023-11-15' },
  ]},
  { subject: 'Social Science', exams: [
    { name: 'Unit Test 1', marks: 40, maxMarks: 50, grade: 'A', date: '2024-01-05' },
    { name: 'Unit Test 2', marks: 38, maxMarks: 50, grade: 'A', date: '2023-12-20' },
    { name: 'Half Yearly', marks: 78, maxMarks: 100, grade: 'A', date: '2023-11-15' },
  ]},
]

const teachersData: Teacher[] = [
  { id: 1, name: 'Sarthak Sir', subject: 'Mathematics', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', messages: [
    { from: 'teacher', text: 'Hello! How can I help you with mathematics today?', time: '10:00 AM' },
  ]},
  { id: 2, name: 'Dr. Rajesh Kumar', subject: 'Science', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', messages: [
    { from: 'teacher', text: 'Your physics lab report was excellent!', time: 'Yesterday' },
  ]},
  { id: 3, name: 'Ms. Priya Singh', subject: 'English', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', messages: [] },
  { id: 4, name: 'Mr. Amit Verma', subject: 'Social Science', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', messages: [] },
]

const announcements = [
  { id: 1, title: 'Unit Test Schedule', date: '2024-01-08', type: 'exam', priority: 'high', description: 'Unit Test 3 will be conducted from 15th to 20th January. Syllabus: Chapters 1-5' },
  { id: 2, title: 'Science Exhibition', date: '2024-01-05', type: 'event', priority: 'medium', description: 'Annual Science Exhibition on 25th January. Prepare your projects.' },
  { id: 3, title: 'Fee Payment Reminder', date: '2024-01-03', type: 'notice', priority: 'low', description: 'Last date for fee payment is 10th January.' },
]

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [activeChat, setActiveChat] = useState(1)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Teacher[]>(teachersData)
  const [assignments, setAssignments] = useState<Assignment[]>(assignmentsData)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const submitAssignment = () => {
    if (!selectedAssignment || !uploadedFile) {
      showNotification('Please select a file to upload')
      return
    }
    setAssignments(assignments.map(a => 
      a.id === selectedAssignment.id 
        ? { ...a, status: 'submitted' as const, file: uploadedFile }
        : a
    ))
    showNotification('Assignment submitted successfully!')
    setShowAssignmentModal(false)
    setUploadedFile(null)
  }

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return
    setChatHistory(chatHistory.map(t => 
      t.id === activeChat 
        ? { ...t, messages: [...t.messages, { from: 'student' as const, text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : t
    ))
    setChatMessage('')
    setTimeout(() => {
      setChatHistory(chatHistory.map(t => 
        t.id === activeChat 
          ? { ...t, messages: [...t.messages, { from: 'teacher' as const, text: 'Thank you for your message. I will get back to you soon!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
          : t
      ))
    }, 1000)
  }

  const getSubjectColor = (subject: string) => {
    switch(subject) {
      case 'Mathematics': return 'text-blue-600 bg-blue-50'
      case 'Science': return 'text-green-600 bg-green-50'
      case 'English': return 'text-purple-600 bg-purple-50'
      case 'Social Science': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return 'text-green-600 bg-green-50'
    if (grade === 'A') return 'text-blue-600 bg-blue-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {studentInfo.name}! 👋</h1>
              <p className="text-blue-100">Here's what's happening with your studies today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{coursesData.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{assignments.filter(a => a.status === 'pending').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
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
                    <p className="text-2xl font-bold text-gray-900">A+</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                  <button onClick={() => setActiveTab('courses')} className="text-blue-600 hover:text-blue-700 text-sm">View All →</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coursesData.slice(0, 4).map((course) => (
                    <div 
                      key={course.id} 
                      onClick={() => { setSelectedCourse(course); setShowCourseModal(true) }}
                      className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{course.name}</h3>
                        <span className="text-sm text-gray-500">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500">{course.teacher}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                </div>
                <div className="p-6 space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{ann.title}</p>
                        <p className="text-sm text-gray-500">{ann.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                <button onClick={() => setActiveTab('assignments')} className="text-blue-600 hover:text-blue-700 text-sm">View All →</button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3">Assignment</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.slice(0, 3).map((assignment) => (
                      <tr key={assignment.id} className="border-b">
                        <td className="py-3 font-medium text-gray-900">{assignment.title}</td>
                        <td className="py-3 text-gray-600">{assignment.subject}</td>
                        <td className="py-3 text-gray-600">{assignment.dueDate}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            assignment.status === 'pending' ? 'text-orange-600 bg-orange-50' : 
                            assignment.status === 'submitted' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
                          }`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3">
                          <button 
                            onClick={() => { setSelectedAssignment(assignment); setShowAssignmentModal(true) }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {assignment.status === 'pending' ? 'Submit' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <p className="text-sm text-gray-500">Click on a course to view details</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {coursesData.map((course) => (
                  <div 
                    key={course.id} 
                    onClick={() => { setSelectedCourse(course); setShowCourseModal(true) }}
                    className="border rounded-xl p-6 hover:shadow-lg cursor-pointer transition-all hover:border-blue-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">{course.name}</h3>
                        <p className="text-sm text-gray-500">{course.teacher}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getSubjectColor(course.name)}`}>
                        {course.progress}% Complete
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{course.completed}/{course.classes} classes</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <PlayCircle className="h-4 w-4" />
                        Join Class
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4" />
                        Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'assignments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
                <p className="text-sm text-gray-500">View and submit your assignments</p>
              </div>
              <div className="p-6 space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            assignment.status === 'pending' ? 'text-orange-600 bg-orange-50' : 
                            assignment.status === 'submitted' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
                          }`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded ${getSubjectColor(assignment.subject)}`}>{assignment.subject}</span>
                          <span>Due: {assignment.dueDate}</span>
                          <span>Marks: {assignment.marks}</span>
                          {assignment.score !== undefined && <span>Score: {assignment.score}/{assignment.marks}</span>}
                        </div>
                        {assignment.feedback && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                            <strong>Feedback:</strong> {assignment.feedback}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {assignment.status === 'pending' ? (
                          <button 
                            onClick={() => { setSelectedAssignment(assignment); setShowAssignmentModal(true) }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Submit
                          </button>
                        ) : assignment.status === 'submitted' ? (
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-default">
                            <Check className="h-4 w-4" />
                            Submitted
                          </button>
                        ) : (
                          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Class Schedule</h2>
                <p className="text-sm text-gray-500">Weekly timetable</p>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-gray-500 font-medium">Day</th>
                      <th className="pb-3 px-4 text-gray-500 font-medium">Period 1</th>
                      <th className="pb-3 px-4 text-gray-500 font-medium">Period 2</th>
                      <th className="pb-3 px-4 text-gray-500 font-medium">Period 3</th>
                      <th className="pb-3 px-4 text-gray-500 font-medium">Period 4</th>
                      <th className="pb-3 px-4 text-gray-500 font-medium">Period 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { day: 'Monday', periods: [
                        { time: '08:00 - 09:30', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                        { time: '09:30 - 11:00', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                        { time: '11:30 - 01:00', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                        { time: '02:00 - 03:30', subject: 'Social Science', room: '103', teacher: 'Mr. Amit Verma' },
                        { time: '03:30 - 05:00', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                      ]},
                      { day: 'Tuesday', periods: [
                        { time: '08:00 - 09:30', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                        { time: '09:30 - 11:00', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                        { time: '11:30 - 01:00', subject: 'Social Science', room: '103', teacher: 'Mr. Amit Verma' },
                        { time: '02:00 - 03:30', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                        { time: '03:30 - 05:00', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                      ]},
                      { day: 'Wednesday', periods: [
                        { time: '08:00 - 09:30', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                        { time: '09:30 - 11:00', subject: 'Social Science', room: '103', teacher: 'Mr. Amit Verma' },
                        { time: '11:30 - 01:00', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                        { time: '02:00 - 03:30', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                        { time: '03:30 - 05:00', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                      ]},
                      { day: 'Thursday', periods: [
                        { time: '08:00 - 09:30', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                        { time: '09:30 - 11:00', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                        { time: '11:30 - 01:00', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                        { time: '02:00 - 03:30', subject: 'Social Science', room: '103', teacher: 'Mr. Amit Verma' },
                        { time: '03:30 - 05:00', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                      ]},
                      { day: 'Friday', periods: [
                        { time: '08:00 - 09:30', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                        { time: '09:30 - 11:00', subject: 'Social Science', room: '103', teacher: 'Mr. Amit Verma' },
                        { time: '11:30 - 01:00', subject: 'English', room: '102', teacher: 'Ms. Priya Singh' },
                        { time: '02:00 - 03:30', subject: 'Mathematics', room: '101', teacher: 'Sarthak Sir' },
                        { time: '03:30 - 05:00', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Rajesh Kumar' },
                      ]},
                    ].map((day, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-3 font-medium text-gray-900">{day.day}</td>
                        {day.periods.map((period, pIdx) => (
                          <td key={pIdx} className="px-4 py-3">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{period.subject}</p>
                              <p className="text-gray-500">{period.time}</p>
                              <p className="text-gray-400">{period.room}</p>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'materials':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
                <p className="text-sm text-gray-500">Download notes, guides, and resources</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyMaterials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{material.title}</h3>
                        <p className="text-sm text-gray-500">{material.subject} • {material.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{material.downloads} downloads</span>
                      <a 
                        href={material.url} 
                        download
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'grades':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Grades & Results</h2>
                <p className="text-sm text-gray-500">View your academic performance</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {gradesData.map((subject) => (
                  <div key={subject.subject} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{subject.subject}</h3>
                    <div className="space-y-3">
                      {subject.exams.map((exam, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{exam.name}</p>
                            <p className="text-sm text-gray-500">{exam.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{exam.marks}/{exam.maxMarks}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getGradeColor(exam.grade)}`}>
                              {exam.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'chat':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Chat with Teachers</h2>
                <p className="text-sm text-gray-500">Message your teachers for doubts</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Teachers</h3>
                    <div className="space-y-2">
                      {chatHistory.map((teacher) => (
                        <button
                          key={teacher.id}
                          onClick={() => setActiveChat(teacher.id)}
                          className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                            activeChat === teacher.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-500">{teacher.subject}</p>
                          </div>
                          {teacher.messages.length > 0 && (
                            <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 border rounded-lg p-4">
                    <div className="h-96 flex flex-col">
                      <div className="flex items-center gap-3 pb-4 border-b mb-4">
                        <img src={chatHistory.find(t => t.id === activeChat)?.avatar} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900">{chatHistory.find(t => t.id === activeChat)?.name}</p>
                          <p className="text-sm text-gray-500">{chatHistory.find(t => t.id === activeChat)?.subject}</p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {chatHistory.find(t => t.id === activeChat)?.messages.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No messages yet. Start a conversation!</p>
                          </div>
                        ) : (
                          chatHistory.find(t => t.id === activeChat)?.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.from === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-3 rounded-lg ${
                                msg.from === 'student' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.from === 'student' ? 'text-blue-200' : 'text-gray-500'}`}>
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder="Type your message..."
                          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                          onClick={sendChatMessage}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Course Modal */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{selectedCourse.name}</h2>
              <button onClick={() => setShowCourseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Teacher</p>
                <p className="font-medium">{selectedCourse.teacher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{selectedCourse.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Progress</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div className="h-3 rounded-full bg-blue-600" style={{ width: `${selectedCourse.progress}%` }}></div>
                  </div>
                  <span className="font-medium">{selectedCourse.progress}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedCourse.completed}/{selectedCourse.classes} classes completed</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Syllabus</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.syllabus.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Next Class</p>
                <p className="font-medium text-blue-600">{selectedCourse.nextClass}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Video className="h-5 w-5" />
                  Join Live Class
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{selectedAssignment.title}</h2>
              <button onClick={() => setShowAssignmentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded ${getSubjectColor(selectedAssignment.subject)}`}>
                  {selectedAssignment.subject}
                </span>
                <span className="text-gray-500">Due: {selectedAssignment.dueDate}</span>
                <span className="text-gray-500">Marks: {selectedAssignment.marks}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>
              
              {selectedAssignment.status === 'pending' && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Upload Your Work</p>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
                          className="ml-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload file</p>
                        <p className="text-sm text-gray-400">PDF, DOC, DOCX, JPG, PNG</p>
                      </>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              )}

              {selectedAssignment.status === 'submitted' && (
                <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Assignment Submitted</p>
                    <p className="text-sm text-blue-700">Waiting for grading</p>
                  </div>
                </div>
              )}

              {selectedAssignment.status === 'graded' && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Score</span>
                      <span className="text-2xl font-bold text-green-600">{selectedAssignment.score}/{selectedAssignment.marks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-600" style={{ width: `${(selectedAssignment.score! / selectedAssignment.marks) * 100}%` }}></div>
                    </div>
                  </div>
                  {selectedAssignment.feedback && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Teacher's Feedback</p>
                      <p className="text-blue-700">{selectedAssignment.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedAssignment.status === 'pending' && (
                <button 
                  onClick={submitAssignment}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Submit Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <Link href="/" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </Link>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">Sarthak Group</h2>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'courses', icon: BookOpen, label: 'My Courses' },
              { id: 'assignments', icon: FileText, label: 'Assignments' },
              { id: 'schedule', icon: Calendar, label: 'Schedule' },
              { id: 'materials', icon: Download, label: 'Study Materials' },
              { id: 'grades', icon: TrendingUp, label: 'Grades & Results' },
              { id: 'chat', icon: MessageSquare, label: 'Chat with Teachers' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
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
              <img src={studentInfo.photo} alt={studentInfo.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="hidden md:block">
                <p className="font-medium text-gray-900">{studentInfo.name}</p>
                <p className="text-sm text-gray-500">{studentInfo.class} - {studentInfo.section}</p>
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

