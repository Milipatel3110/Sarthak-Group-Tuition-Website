
'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle, Send, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM"
]

const reasonOptions = [
  "Admission Discussion",
  "Course Information",
  "Classroom Visit",
  "Meet a Faculty",
  "Career Counseling",
  "Fee Discussion",
  "Other"
]

export default function BookAppointmentPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    email: '',
    phone: '',
    studentClass: '',
    reason: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Get maximum date (30 days from now)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('Failed to book appointment. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({
      parentName: '',
      studentName: '',
      email: '',
      phone: '',
      studentClass: '',
      reason: '',
      preferredDate: '',
      preferredTime: '',
      message: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/contact" className="text-white hover:text-green-200">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">Book Appointment</h1>
          </div>
          <p className="text-xl text-green-100 max-w-2xl">
            Schedule a visit to our center. Meet our faculty and see our infrastructure firsthand.
          </p>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {submitted ? (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Appointment Booked!</h2>
              <p className="text-gray-600 mb-2">
                Your appointment has been successfully scheduled.
              </p>
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to <strong>{formData.email}</strong> with all the details.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold mb-4 text-green-800">Appointment Details:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Date: <strong>{formData.preferredDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Time: <strong>{formData.preferredTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">For: <strong>{formData.reason}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Location: <strong>12, Janakpuri Society, Nigam Smruti Mandir Road, Ghodasar, Ahmedabad</strong></span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please arrive 10 minutes before your scheduled appointment. 
                  Carry a valid ID proof for security purposes.
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleReset}>
                  Book Another Appointment
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    Go to Home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side - Instructions */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-800">What to Expect</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Personalized consultation with our counselors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Tour of our classrooms and infrastructure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Meet our expert faculty members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Discuss course options and career paths</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Get answers to all your questions</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">Location</h4>
                    <p className="text-sm text-gray-700">
                      <strong>Sarthak Group Tuition</strong><br />
                      12, Janakpuri Society,<br />
                      Nigam Smruti Mandir Road,<br />
                      Ghodasar, Ahmedabad, Gujarat 380050
                    </p>
                  </div>
                </div>
                
                {/* Right Side - Form */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">Schedule Your Visit</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent/Guardian Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter parent/guardian name"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter student name"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          placeholder="Enter phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Current Class
                        </label>
                        <select
                          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={formData.studentClass}
                          onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                        >
                          <option value="">Select class</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purpose of Visit *
                        </label>
                        <select
                          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          required
                        >
                          <option value="">Select purpose</option>
                          {reasonOptions.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date *
                        </label>
                        <Input
                          type="date"
                          min={minDate}
                          max={maxDateStr}
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Select a date within next 30 days</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time *
                        </label>
                        <select
                          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={formData.preferredTime}
                          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                          required
                        >
                          <option value="">Select time slot</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Message
                      </label>
                      <textarea
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 min-h-[80px]"
                        placeholder="Any specific questions or information you'd like to share..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Booking...'
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Appointment
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      You will receive a confirmation email with appointment details after booking.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

