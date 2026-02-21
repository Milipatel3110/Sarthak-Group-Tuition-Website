import { Target, Eye, Heart, Star, Users, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Sarthak Group Tuition</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Building future leaders through quality education and personalized learning since 2001.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sarthak Group Tuition was founded with a simple mission: to provide quality education 
              that transforms students' lives. What started as a small coaching center has grown into 
              one of the most trusted educational institutions in the region. Our founder, Sarthak, 
              believed that every student has the potential to excel, given the right guidance and support.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4">
              Today, we take pride in having helped thousands of students achieve their academic goals 
              and build successful careers. Our commitment to excellence remains unchanged, and we 
              continue to innovate and adapt to provide the best possible education to our students.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6">
                <Eye className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Vision</h2>
              <p className="text-xl text-gray-600 text-center leading-relaxed">
                "To be the leading educational institution that nurtures young minds, 
                empowers students to achieve academic excellence, and shapes responsible 
                citizens who contribute meaningfully to society. We envision a world where 
                every student has access to quality education and the opportunity to realize 
                their full potential."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
                <Target className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Provide high-quality, personalized education that caters to each student's unique learning needs and abilities.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Foster a supportive and encouraging learning environment where students feel motivated to ask questions and explore ideas.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Employ expert faculty who are passionate about teaching and dedicated to student success.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Continuously innovate and adopt modern teaching methodologies to enhance learning outcomes.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Build strong partnerships with parents to ensure holistic development of every student.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student-Centric</h3>
              <p className="text-gray-600">Every decision we make prioritizes our students' best interests.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">We strive for the highest standards in everything we do.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-600">We uphold honesty and transparency in all our interactions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">We embrace new ideas and technologies to improve learning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-200">Faculty</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-200">Years</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Results</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

