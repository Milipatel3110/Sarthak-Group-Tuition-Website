'use client'

import { useState } from 'react'
import { Check, ArrowRight, ArrowLeft, User, MapPin, CheckCircle, Globe, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const courses = [
  // Class 1-5
  { id: 1, name: "Class 1-5 (All Subjects)", targetClass: "1-5", medium: "English", stream: "" },
  { id: 2, name: "Class 1-5 (All Subjects)", targetClass: "1-5", medium: "Gujarati", stream: "" },
  // Class 6-8
  { id: 3, name: "Class 6-8 (All Subjects)", targetClass: "6-8", medium: "English", stream: "" },
  { id: 4, name: "Class 6-8 (All Subjects)", targetClass: "6-8", medium: "Gujarati", stream: "" },
  // Class 9-10
  { id: 5, name: "Class 9-10 Science", targetClass: "9-10", medium: "English", stream: "Science" },
  { id: 6, name: "Class 9-10 Science", targetClass: "9-10", medium: "Gujarati", stream: "Science" },
  { id: 7, name: "Class 9-10 Commerce", targetClass: "9-10", medium: "English", stream: "Commerce" },
  { id: 8, name: "Class 9-10 Commerce", targetClass: "9-10", medium: "Gujarati", stream: "Commerce" },
  // Class 11-12 Science
  { id: 9, name: "Class 11-12 Science PCM", targetClass: "11-12", medium: "English", stream: "Science (PCM)" },
  { id: 10, name: "Class 11-12 Science PCM", targetClass: "11-12", medium: "Gujarati", stream: "Science (PCM)" },
  { id: 11, name: "Class 11-12 Science PCB", targetClass: "11-12", medium: "English", stream: "Science (PCB)" },
  { id: 12, name: "Class 11-12 Science PCB", targetClass: "11-12", medium: "Gujarati", stream: "Science (PCB)" },
  // Class 11-12 Commerce
  { id: 13, name: "Class 11-12 Commerce", targetClass: "11-12", medium: "English", stream: "Commerce" },
  { id: 14, name: "Class 11-12 Commerce", targetClass: "11-12", medium: "Gujarati", stream: "Commerce" },
  // Class 11-12 Arts
  { id: 15, name: "Class 11-12 Arts", targetClass: "11-12", medium: "English", stream: "Arts" },
  { id: 16, name: "Class 11-12 Arts", targetClass: "11-12", medium: "Gujarati", stream: "Arts" },
  // Crash Courses
  { id: 17, name: "JEE Crash Course", targetClass: "12", medium: "English", stream: "JEE" },
  { id: 18, name: "NEET Crash Course", targetClass: "12", medium: "English", stream: "NEET" },
]

export default function EnrollPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    course: '',
    studentName: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    medium: '',
    stream: '',
    school: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    parentAddress: '',
  })

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.studentName,
          parentName: formData.parentName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
          class: `Class ${formData.class}`,
          medium: formData.medium,
          course: selectedCourse?.name || ''
        }),
      })
      
      if (response.ok) {
        setStep(4)
      } else {
        alert('Failed to submit enrollment. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const selectedCourse = courses.find(c => c.id.toString() === formData.course)

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enroll Now</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Take the first step towards academic excellence. Visit our center to complete enrollment and make payment.
          </p>
        </div>
      </section>

      {step < 4 && (
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center max-w-xl mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 md:w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-4 md:space-x-12 text-sm text-gray-600">
              <span>Select Course</span>
              <span>Student Info</span>
              <span>Parent Info</span>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4">
          {step === 1 && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-2">Select a Course</h2>
              <p className="text-gray-500 mb-6">Choose from our courses for Class 1-12 (English & Gujarati Medium)</p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.course === course.id.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="course"
                      value={course.id}
                      checked={formData.course === course.id.toString()}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value, class: course.targetClass, medium: course.medium })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4 flex-1">
                      <span className="font-semibold">{course.name}</span>
                      {course.stream && <span className="ml-2 text-sm text-gray-500">({course.stream})</span>}
                    </div>
                    <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      <Globe className="h-3 w-3 mr-1" />
                      {course.medium}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} disabled={!formData.course}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <User className="mr-2 h-6 w-6" />
                Student Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input type="text" placeholder="Enter student's full name" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                    <select className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} required>
                      <option value="">Select Class</option>
                      <option value="1">Class 1</option>
                      <option value="2">Class 2</option>
                      <option value="3">Class 3</option>
                      <option value="4">Class 4</option>
                      <option value="5">Class 5</option>
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medium *</label>
                    <select className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={formData.medium} onChange={(e) => setFormData({ ...formData, medium: e.target.value })} required>
                      <option value="">Select Medium</option>
                      <option value="English">English</option>
                      <option value="Gujarati">Gujarati</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
                    <select className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={formData.stream} onChange={(e) => setFormData({ ...formData, stream: e.target.value })}>
                      <option value="">Select Stream</option>
                      {formData.class >= '11' && (
                        <>
                          <option value="Science (PCM)">Science (PCM)</option>
                          <option value="Science (PCB)">Science (PCB)</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </>
                      )}
                      {(formData.class === '9' || formData.class === '10') && (
                        <>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
                  <Input type="text" placeholder="Enter school name" value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} required />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!formData.studentName || !formData.class || !formData.medium}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <User className="mr-2 h-6 w-6" />
                Parent/Guardian Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                  <Input type="text" placeholder="Enter parent's full name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <Input type="tel" placeholder="Enter phone number" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input type="email" placeholder="Enter email address" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <Input type="text" placeholder="Enter occupation" value={formData.parentOccupation} onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <Input type="text" placeholder="Enter address" value={formData.parentAddress} onChange={(e) => setFormData({ ...formData, parentAddress: e.target.value })} />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Visit Center to Complete Enrollment</h3>
                    <p className="text-sm text-blue-700">Please visit our center with your child to complete the enrollment process.</p>
                    <div className="mt-3 text-sm text-blue-700">
                      <p><strong>Address:</strong> 12, Janakpuri Society, Nigam Smruti Mandir Road, Ghodasar, Ahmedabad, Gujarat 380050</p>
                      <p><strong>Timing:</strong> Mon-Sat: 8:00 AM - 8:00 PM, Sunday: 8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.parentName || !formData.parentPhone}>
                  Submit Application
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Enrollment Request Submitted!</h2>
              <p className="text-gray-600 mb-2">Thank you for your interest in Sarthak Group Tuition.</p>
              <p className="text-gray-600 mb-8">Our team will contact you shortly.</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold mb-4">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1" />Visit our center with required documents</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1" />Pay the course fee at the center</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1" />Get student ID and access credentials</li>
                </ul>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.href = '/'}>Go to Home</Button>
                <Button variant="outline" onClick={() => window.location.href = '/contact'}>Contact Us</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

