
'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [inquiryType, setInquiryType] = useState<'general' | 'admission' | 'appointment'>('general')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inquiryType: inquiryType === 'admission' ? 'Admission Inquiry' : 'General Inquiry'
        }),
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', course: '', message: '' })
      } else {
        alert('Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Have questions? We'd love to hear from you. Get in touch with us today.
          </p>
        </div>
      </section>

      {/* Inquiry Type Tabs */}
      <section className="py-8 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setInquiryType('general')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                inquiryType === 'general' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General Inquiry
            </button>
            <button
              onClick={() => setInquiryType('admission')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                inquiryType === 'admission' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admission Inquiry
            </button>
            <Link href="/book-appointment">
              <button
                className="px-6 py-3 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-2">
                {inquiryType === 'admission' ? 'Admission Inquiry' : 'Send us a Message'}
              </h2>
              <p className="text-gray-500 mb-6">
                {inquiryType === 'admission' 
                  ? 'Fill in your details and our team will contact you regarding admissions.'
                  : 'We\'ll get back to you within 24 hours.'}
              </p>
              
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Inquiry Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. A confirmation email has been sent to your email address.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please check your inbox for the confirmation details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Confirmation email will be sent to this address</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  {inquiryType === 'admission' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interested Course
                      </label>
                      <select
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="">Select a course</option>
                        <option value="class1-5-en">Class 1-5 (English)</option>
                        <option value="class1-5-guj">Class 1-5 (Gujarati)</option>
                        <option value="class6-8-en">Class 6-8 (English)</option>
                        <option value="class6-8-guj">Class 6-8 (Gujarati)</option>
                        <option value="class9-10-en">Class 9-10 (English)</option>
                        <option value="class9-10-guj">Class 9-10 (Gujarati)</option>
                        <option value="class11-12-science-pcm">Class 11-12 Science PCM</option>
                        <option value="class11-12-science-pcb">Class 11-12 Science PCB</option>
                        <option value="class11-12-commerce">Class 11-12 Commerce</option>
                        <option value="jee-crash">JEE Crash Course</option>
                        <option value="neet-crash">NEET Crash Course</option>
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                      placeholder={inquiryType === 'admission' ? 'Tell us about your educational background and goals...' : 'How can we help you?'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-gray-600">
                        12, Janakpuri Society,<br />
                        Nigam Smruti Mandir Road,<br />
                        Ghodasar, Ahmedabad, Gujarat 380050
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-gray-600">+91 9328705157</p>
                      <p className="text-gray-600">+91 7984433287</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">arpanmpatel31@gmail.com</p>
                      <p className="text-gray-600">sarthak.computer@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office Hours</h3>
                      <p className="text-gray-600">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                      <p className="text-gray-600">Sunday: 8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Find Us</h2>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">Map will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

