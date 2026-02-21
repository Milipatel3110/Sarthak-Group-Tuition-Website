'use client'

import { useState } from 'react'
import { BookOpen, Clock, Users, Award, ArrowRight, Check, Globe, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Medium = 'English' | 'Gujarati'
type Stream = 'School' | 'Science' | 'Commerce' | 'Crash'

interface Course {
  id: number
  title: string
  description: string
  medium: Medium
  stream: Stream
  classes: string
  duration: string
  features: string[]
}

const courses: Course[] = [
  // Class 1-5 (Gujarati & English Medium)
  { id: 1, title: "Class 1-5 (English Medium)", description: "Foundation building for young learners with comprehensive curriculum.", medium: "English", stream: "School", classes: "1-5", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Doubt Clearing"] },
  { id: 2, title: "Class 1-5 (Gujarati Medium)", description: "Strong foundation with Gujarati medium instruction.", medium: "Gujarati", stream: "School", classes: "1-5", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Doubt Clearing"] },
  { id: 3, title: "Class 6-8 (English Medium)", description: "Building blocks for secondary education with English medium.", medium: "English", stream: "School", classes: "6-8", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Doubt Clearing"] },
  { id: 4, title: "Class 6-8 (Gujarati Medium)", description: "Gujarati medium coaching for middle school students.", medium: "Gujarati", stream: "School", classes: "6-8", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Doubt Clearing"] },
  { id: 5, title: "Class 9-10 (English Medium)", description: "CBSE & ICSE preparation with English medium instruction.", medium: "English", stream: "School", classes: "9-10", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Board Prep"] },
  { id: 6, title: "Class 9-10 (Gujarati Medium)", description: "GSEB board preparation with Gujarati medium coaching.", medium: "Gujarati", stream: "School", classes: "9-10", duration: "1 Year", features: ["Expert Faculty", "Regular Tests", "Study Material", "Board Prep"] },
  
  // Class 11-12 Science
  { id: 7, title: "Class 11-12 Science (English Medium - PCM)", description: "JEE Mains & Advanced preparation with Physics, Chemistry, Mathematics.", medium: "English", stream: "Science", classes: "11-12", duration: "2 Years", features: ["JEE Preparation", "Board Focus", "Test Series", "Online Resources"] },
  { id: 8, title: "Class 11-12 Science (Gujarati Medium - PCM)", description: "Gujarati medium science with PCM for Gujarat board & JEE.", medium: "Gujarati", stream: "Science", classes: "11-12", duration: "2 Years", features: ["JEE Preparation", "Board Focus", "Test Series", "Online Resources"] },
  { id: 9, title: "Class 11-12 Science (English Medium - PCB)", description: "NEET preparation with Physics, Chemistry, Biology.", medium: "English", stream: "Science", classes: "11-12", duration: "2 Years", features: ["NEET Preparation", "Board Focus", "Test Series", "Online Resources"] },
  { id: 10, title: "Class 11-12 Science (Gujarati Medium - PCB)", description: "Gujarati medium science with PCB for NEET & Gujarat board.", medium: "Gujarati", stream: "Science", classes: "11-12", duration: "2 Years", features: ["NEET Preparation", "Board Focus", "Test Series", "Online Resources"] },
  
  // Class 11-12 Commerce
  { id: 11, title: "Class 11-12 Commerce (English Medium)", description: "Accountancy, Economics, Business Studies for English medium students.", medium: "English", stream: "Commerce", classes: "11-12", duration: "2 Years", features: ["Expert Faculty", "Practice Papers", "Board Prep", "CA Foundation"] },
  { id: 12, title: "Class 11-12 Commerce (Gujarati Medium)", description: "Gujarati medium commerce for Gujarat board students.", medium: "Gujarati", stream: "Commerce", classes: "11-12", duration: "2 Years", features: ["Expert Faculty", "Practice Papers", "Board Prep", "CA Foundation"] },
  
  // Crash Courses
  { id: 13, title: "JEE Crash Course", description: "Intensive preparation for JEE Mains with focus on important topics.", medium: "English", stream: "Crash", classes: "12/Graduate", duration: "6 Months", features: ["Intensive Training", "Mock Tests", "Revision Notes", "Doubt Clearing"] },
  { id: 14, title: "NEET Crash Course", description: "Focused NEET preparation with practice tests and revision.", medium: "English", stream: "Crash", classes: "12/Graduate", duration: "6 Months", features: ["Intensive Training", "Mock Tests", "Revision Notes", "Doubt Clearing"] }
]

const getStreamColor = (stream: Stream): string => {
  switch (stream) {
    case 'School': return 'blue'
    case 'Science': return 'green'
    case 'Commerce': return 'purple'
    case 'Crash': return 'red'
    default: return 'blue'
  }
}

export default function CoursesPage() {
  const [selectedMedium, setSelectedMedium] = useState<string>('all')
  const [selectedStream, setSelectedStream] = useState<string>('all')

  const filteredCourses = courses.filter(course => {
    const mediumMatch = selectedMedium === 'all' || course.medium === selectedMedium
    const streamMatch = selectedStream === 'all' || course.stream === selectedStream
    return mediumMatch && streamMatch
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Courses</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Comprehensive courses for Class 1-12 in Gujarati & English medium. Science, Commerce, and exam preparation.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMedium('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedMedium === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Medium
              </button>
              <button
                onClick={() => setSelectedMedium('English')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedMedium === 'English' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English Medium
              </button>
              <button
                onClick={() => setSelectedMedium('Gujarati')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedMedium === 'Gujarati' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gujarati Medium
              </button>
            </div>

            <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStream('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStream === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Streams
              </button>
              <button
                onClick={() => setSelectedStream('School')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStream === 'School' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Class 1-10
              </button>
              <button
                onClick={() => setSelectedStream('Science')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStream === 'Science' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Science
              </button>
              <button
                onClick={() => setSelectedStream('Commerce')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStream === 'Commerce' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Commerce
              </button>
              <button
                onClick={() => setSelectedStream('Crash')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStream === 'Crash' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Crash Course
              </button>
            </div>
          </div>
          <p className="mt-4 text-gray-500 text-sm">Showing {filteredCourses.length} courses</p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const color = getStreamColor(course.stream)
              return (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className={`h-2 bg-${color}-500`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-sm font-medium`}>
                          {course.stream === 'Crash' ? 'Crash' : `Class ${course.classes}`}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {course.medium}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {course.features.slice(2).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-600">
                            <Check className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href="/enroll">
                          <Button className={`bg-${color}-600 hover:bg-${color}-700`}>
                            Enroll Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Courses?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Faculty</h3>
              <p className="text-gray-600">Learn from experienced teachers with proven track records.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Small Batches</h3>
              <p className="text-gray-600">Personal attention with limited students per batch.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
              <p className="text-gray-600">High success rate in board exams and competitive tests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which Course to Choose?</h2>
          <p className="text-xl mb-8 text-blue-100">Our counselors can help you choose the right course based on your goals.</p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Talk to Our Counselors
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

