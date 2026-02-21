
'use client'

import { useState, useEffect } from 'react'
import { Star, Play, Plus, Video, CheckCircle, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Testimonial = {
  id: number
  name: string
  role: string
  class: string
  rating: number
  message: string
  videoUrl?: string
  isVideo: boolean
  isApproved: boolean
  createdAt: string
}

// Load testimonials from localStorage or use default
const loadTestimonials = (): Testimonial[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sarthak_testimonials')
    if (saved) {
      return JSON.parse(saved)
    }
  }
  // Default testimonials
  return [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Parent",
      class: "Class 10 Parent",
      rating: 5,
      message: "My son has improved significantly since joining Sarthak Group Tuition. The teachers are dedicated and provide individual attention to each student. Highly recommended!",
      isVideo: false,
      isApproved: true,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Student",
      class: "JEE Aspirant",
      rating: 5,
      message: "The study material and test series helped me crack JEE with a great rank. Thank you Sarthak Group Tuition for my success!",
      isVideo: false,
      isApproved: true,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Student",
      class: "Class 12 Commerce",
      rating: 5,
      message: "Excellent coaching for commerce students. The faculty explains concepts so well that even difficult topics become easy.",
      isVideo: false,
      isApproved: true,
      createdAt: "2024-01-05"
    },
    {
      id: 4,
      name: "Meera Shah",
      role: "Parent",
      class: "Class 8 Parent",
      rating: 5,
      message: "Very happy with the progress my daughter has made. The teachers are very supportive and the study environment is great.",
      isVideo: false,
      isApproved: true,
      createdAt: "2023-12-20"
    },
    {
      id: 5,
      name: "Kiran Joshi",
      role: "Student",
      class: "NEET Aspirant",
      rating: 5,
      message: "The biology faculty is amazing! Detailed explanations and regular doubt clearing sessions helped me achieve a good rank in NEET.",
      isVideo: false,
      isApproved: true,
      createdAt: "2023-12-15"
    },
    {
      id: 6,
      name: "Deepak Reddy",
      role: "Parent",
      class: "Class 11 Science Parent",
      rating: 5,
      message: "Worth every penny! The online resources and regular parent-teacher meetings keep us updated about our child's progress.",
      isVideo: false,
      isApproved: true,
      createdAt: "2023-12-01"
    }
  ]
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showPending, setShowPending] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    class: '',
    message: '',
    videoUrl: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // Load testimonials on mount
  useEffect(() => {
    const loaded = loadTestimonials()
    setTestimonials(loaded)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTestimonial: Testimonial = {
      id: Date.now(),
      name: formData.name,
      role: formData.role,
      class: formData.class,
      rating: 5,
      message: formData.message,
      videoUrl: formData.videoUrl || undefined,
      isVideo: !!formData.videoUrl,
      isApproved: true, // Auto-approve for demo purposes
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    const updatedTestimonials = [newTestimonial, ...testimonials]
    setTestimonials(updatedTestimonials)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sarthak_testimonials', JSON.stringify(updatedTestimonials))
    }
    
    setSubmitted(true)
    setFormData({ name: '', role: 'Student', class: '', message: '', videoUrl: '' })
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
    }, 3000)
  }

  const approvedTestimonials = testimonials.filter(t => t.isApproved)
  const pendingTestimonials = testimonials.filter(t => !t.isApproved)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonials</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Hear from our successful students and parents. Share your experience with Sarthak Group Tuition.
          </p>
        </div>
      </section>

      {/* Add Testimonial CTA */}
      <section className="py-8 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Have you studied at Sarthak Group Tuition?</h2>
              <p className="text-gray-600">Share your experience to help others make the right choice</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {showForm ? (
                <>Cancel</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      {showForm && (
        <section className="py-8 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your testimonial has been submitted successfully!</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Share Your Experience</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name *
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
                          I am a *
                        </label>
                        <select
                          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="Student">Student</option>
                          <option value="Parent">Parent</option>
                          <option value="Alumni">Alumni</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class/Course *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Class 10, JEE Aspirant, NEET 2024"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message *
                      </label>
                      <textarea
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 min-h-[120px]"
                        placeholder="Share your experience at Sarthak Group Tuition..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Testimonial (Optional)
                      </label>
                      <div className="flex items-center space-x-4">
                        <Video className="h-5 w-5 text-gray-400" />
                        <Input
                          type="url"
                          placeholder="Paste your video URL (YouTube/Vimeo)"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Share a video message instead of text</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Testimonial
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What Students & Parents Say</h2>
          <p className="text-gray-600 text-center mb-12">Real experiences from our Sarthak Group Tuition family</p>
          
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvedTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {testimonial.isVideo && (
                        <span className="flex items-center text-xs text-blue-600">
                          <Play className="h-3 w-3 mr-1" />
                          Video
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-6 italic">"{testimonial.message}"</p>
                    
                    {testimonial.isVideo && testimonial.videoUrl && (
                      <div className="mb-4 relative rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <Play className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.class}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">{testimonials.length}+</div>
              <div className="text-blue-200">Happy Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{testimonials.length}+</div>
              <div className="text-blue-200">Testimonials</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

