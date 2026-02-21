'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Role = 'student' | 'parent' | 'faculty' | 'admin'

export default function PortalLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role>('student')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const roleMap: Record<Role, string> = { student: 'STUDENT', parent: 'PARENT', faculty: 'FACULTY', admin: 'ADMIN' }
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: roleMap[role] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', 'authenticated')
      switch (role) {
        case 'student': router.push('/portal/student'); break
        case 'parent': router.push('/portal/parent'); break
        case 'faculty': router.push('/portal/faculty'); break
        case 'admin': router.push('/portal/admin'); break
      }
    } catch (err: any) { setError(err.message || 'An error occurred') }
    finally { setIsLoading(false) }
  }

  const roleLabels: Record<Role, string> = { student: 'Student', parent: 'Parent', faculty: 'Faculty', admin: 'Admin' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-900 via-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sarthak Group Tuition</h1>
          <p className="text-blue-200 mt-2">Portal Login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-gray-100 p-1 mb-6">
            <button type="button" onClick={() => setRole('student')} className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Student</button>
            <button type="button" onClick={() => setRole('parent')} className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Parent</button>
            <button type="button" onClick={() => setRole('faculty')} className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${role === 'faculty' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Faculty</button>
            <button type="button" onClick={() => setRole('admin')} className={`py-2 px-2 rounded-md text-xs font-medium transition-all ${role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Admin</button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="email" placeholder={`Enter your ${roleLabels[role]} email`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/portal/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : `Login as ${roleLabels[role]}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">New student enrollment? <Link href="/enroll" className="text-blue-600 hover:text-blue-800 font-medium">Enroll Now</Link></p>
          </div>

          {role === 'admin' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">Demo: admin@sarthakgroup.com / admin123</p>
            </div>
          )}
          {role === 'faculty' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">Demo: sarthak@sarthakgroup.com / faculty123</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

