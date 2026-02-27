import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Award, Users, BookOpen, ArrowRight, Star, CheckCircle, Facebook, Instagram, Youtube } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Creative EdTech Style */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Logo and Badge */}
              <div className="flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="Sarthak Group Tuition Logo" 
                  className="h-16 w-auto rounded-xl shadow-lg"
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">25+ Years of Excellence</span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Shape Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Future</span> With Expert Guidance
                </h1>
                <p className="text-lg md:text-xl text-blue-100/90 max-w-xl">
                  Join thousands of successful students who achieved their academic goals with Sarthak Group Tuition's proven teaching methodology.
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-blue-200">Active Students</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">17+</div>
                    <div className="text-sm text-blue-200">Expert Faculty</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm text-blue-200">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/enroll">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                    Enroll Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto">
                    Explore Courses
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-br ${['from-blue-400', 'from-purple-400', 'from-cyan-400', 'from-pink-400', 'from-yellow-400'][i]} to-gray-600`}></div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">500+</span> students enrolled this year
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              {/* Main Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  {/* Feature Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <div className="w-14 h-14 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">Smart Learning</h3>
                      <p className="text-xs text-blue-200">Interactive digital classes</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <div className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-3">
                        <Award className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">Top Results</h3>
                      <p className="text-xs text-blue-200">95% passing rate</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <div className="w-14 h-14 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">Expert Mentors</h3>
                      <p className="text-xs text-blue-200">17+ qualified teachers</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <div className="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-3">
                        <CheckCircle className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">Complete Support</h3>
                      <p className="text-xs text-blue-200">Doubt clearance</p>
                    </div>
                  </div>
                  
                  {/* Animated floating badge */}
                  <div className="absolute -right-4 -top-4 bg-white text-slate-900 px-4 py-2 rounded-full font-semibold shadow-lg">
                    🎯 JEE/NEET Ready
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -left-8 top-1/4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Top Ranking</div>
                    <div className="text-xs text-blue-200">In Gujarat</div>
                  </div>
                </div>
              </div>
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

