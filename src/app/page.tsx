import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Award, Users, BookOpen, ArrowRight, Star, CheckCircle, Facebook, Instagram, Youtube } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="/logo.jpg" 
                alt="Sarthak Group Tuition Logo" 
                className="h-20 w-auto rounded-lg"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Excellence in Education at <span className="text-blue-300">Sarthak Group Tuition</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Empowering students to achieve their full potential with expert guidance, 
              personalized learning, and comprehensive academic support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/enroll">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Expert Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Sarthak Group Tuition?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide a nurturing environment where every student can excel academically and personally.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <GraduationCap className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Faculty</h3>
              <p className="text-gray-600">
                Learn from highly qualified teachers with years of experience in their respective subjects.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Study Material</h3>
              <p className="text-gray-600">
                Access well-structured study materials, notes, and practice papers designed by experts.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proven Results</h3>
              <p className="text-gray-600">
                Our students consistently achieve excellent results in board exams and competitive tests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Featured Courses</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive courses designed for different academic needs and career goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Class 9-10</h3>
                <p className="text-gray-600 mb-4">Foundation courses for CBSE & ICSE boards with focus on conceptual clarity.</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">View Details</span>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Class 11-12 Science</h3>
                <p className="text-gray-600 mb-4">PCM/PCB preparation for JEE, NEET, and board exams with expert guidance.</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">View Details</span>
                  <ArrowRight className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Class 11-12 Commerce</h3>
                <p className="text-gray-600 mb-4">Expert coaching for Accountancy, Economics, and Business Studies.</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-semibold">View Details</span>
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg" variant="outline">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Parents & Students Say</h2>
            <p className="text-xl text-gray-600">Hear from our satisfied parents and students.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "My son has improved significantly since joining Sarthak Group Tuition. The teachers are dedicated and provide individual attention to each student."
              </p>
              <div className="font-semibold">- Rajesh Kumar, Parent</div>
              <div className="text-sm text-gray-500">Class 10 Parent</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The study material and test series helped me crack JEE with a great rank. Thank you Sarthak Group Tuition for my success!"
              </p>
              <div className="font-semibold">- Priya Sharma, Student</div>
              <div className="text-sm text-gray-500">JEE Aspirant</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent coaching for commerce students. The faculty explains concepts so well that even difficult topics become easy."
              </p>
              <div className="font-semibold">- Amit Patel, Student</div>
              <div className="text-sm text-gray-500">Class 12 Commerce</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Follow Us On Social Media</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Stay connected with us for daily updates, educational content, event photos, and more!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://www.facebook.com/p/Sarthak-group-tuition-100050547206750/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
              </svg>
              Facebook
            </a>
            <a 
              href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-white text-pink-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2.16c3.2,0,3.58,0,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s0,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58,0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33,0,7.05.07c-4.35.2-6.78,2.62-7,7C0,8.33,0,8.74,0,12s0,3.67.07,4.95c.2,4.36,2.62,6.78,7,7C8.33,24,8.74,24,12,24s3.67,0,4.95-.07c4.35-.2,6.78-2.62,7-7C24,15.67,24,15.26,24,12s0-3.67-.07-4.95c-.2-4.35-2.62-6.78-7-7C15.67,0,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z"/>
              </svg>
              Instagram
            </a>
            <a 
              href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.54,3.5,12,3.5,12,3.5s-7.54,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.56,31.56,0,0,0,0,12a31.56,31.56,0,0,0,.5,5.81,3.02,3.02,0,0,0,2.12,2.14c1.84.55,9.38.55,9.38.55s7.54,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.56,31.56,0,0,0,24,12,31.56,31.56,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z"/>
              </svg>
              YouTube
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Academic Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful students at Sarthak Group Tuition. 
            Enroll today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/enroll">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Enroll Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

