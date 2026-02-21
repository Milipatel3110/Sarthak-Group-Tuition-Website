import { GraduationCap, Mail, Phone, Award, BookOpen, Users } from 'lucide-react'

const faculty = [
  {
    id: 1,
    name: "Arpan Patel",
    qualification: "B.Sc. Mathematics, M.Ed.",
    subjects: ["Mathematics", "JEE Mathematics", "Science"],
    experience: 25,
    bio: "Founder and owner of Sarthak Group Tuition. Expert Mathematics teacher with 25+ years of experience in JEE and board exam preparation. Known for making complex concepts simple and understandable.",
    isOwner: true,
    image: "/faculty/sarthak.jpg"
  },
  {
    id: 2,
    name: "Chetna Patel",
    qualification: "B.Sc. Sanskrit, M.Ed.",
    subjects: ["Social Studies", "Sanskrit", "Gujarati"],
    experience: 20,
    bio: "Experienced Physics teacher with deep knowledge of the subject. Specializes in making physics interesting and easy to learn for students.",
    isOwner: true,
    image: "/faculty/rajesh.jpg"
  },
  {
    id: 3,
    name: "Rantidev Dixit",
    qualification: "M.Sc. Physics, B.Ed.",
    subjects: ["Physics", "NEET/JEE Physics"],
    experience: 20,
    bio: "Dedicated Physics teacher with expertise in organic and inorganic physics. Helps students achieve excellent results in boards and competitive exams.",
    isOwner: false,
    image: "/faculty/priya.jpg"
  },
  {
    id: 4,
    name: "Mr. Amit Verma",
    qualification: "M.Sc. Biology, NET Qualified",
    subjects: ["Biology", "NEET Biology"],
    experience: 7,
    bio: "Biology expert with focus on conceptual learning. Has helped numerous students crack NEET with high ranks.",
    isOwner: false,
    image: "/faculty/amit.jpg"
  },
  {
    id: 5,
    name: "CA Rohit Sharma",
    qualification: "CA, M.Com",
    subjects: ["Accountancy", "Business Studies"],
    experience: 9,
    bio: "Chartered Accountant with expertise in Accountancy and Business Studies. Makes accounting concepts easy and interesting.",
    isOwner: false,
    image: "/faculty/rohit.jpg"
  },
  {
    id: 6,
    name: "Dr. Sunita Devi",
    qualification: "M.A. Economics, Ph.D.",
    subjects: ["Economics", "Business Economics"],
    experience: 11,
    bio: "Economics expert with research experience. Simplifies economic theories for better understanding and application.",
    isOwner: false,
    image: "/faculty/sunita.jpg"
  }
]

export default function FacultyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Faculty</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Meet our team of experienced and dedicated teachers committed to your child's success.
          </p>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:3xl gap-8">
            {faculty.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-2 ${teacher.isOwner ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-blue-500'}`}></div>
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${teacher.isOwner ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-blue-100'}`}>
                      <GraduationCap className={`h-10 w-10 ${teacher.isOwner ? 'text-orange-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{teacher.name}</h3>
                        {teacher.isOwner && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{teacher.qualification}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Award className="h-4 w-4 mr-1" />
                        {teacher.experience}+ years experience
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{teacher.bio}</p>
                  
                  {/* <div className="flex gap-4 pt-4 border-t">
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </button>
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </button> */}
                  </div>
                </div>
              // </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Faculty */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Our Faculty Special?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Knowledge</h3>
              <p className="text-gray-600">Deep subject expertise with years of teaching experience.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal Attention</h3>
              <p className="text-gray-600">Focus on each student's unique learning needs.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Track Record</h3>
              <p className="text-gray-600">Consistent results in board and competitive exams.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mentorship</h3>
              <p className="text-gray-600">Guidance beyond academics for overall development.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

