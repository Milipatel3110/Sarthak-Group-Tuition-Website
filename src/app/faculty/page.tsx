import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

const faculty = [
  {
    id: 1,
    name: "Arpan Patel",
    qualification: "M.Sc., M.Ed",
    subjects: ["Maths", "Science"],
    standards: ["Std 8", "9", "10", "11", "12"],
    bio: "Founder and owner of Sarthak Group Tuition. Expert Mathematics teacher with 25+ years of experience in JEE and board exam preparation. Known for making complex concepts simple and understandable.",
    isOwner: true,
    image: "/faculty/sarthak.jpg"
  },
  {
    id: 2,
    name: "Chetna Patel",
    qualification: "M.A., B.A., B.Ed",
    subjects: ["Social Science", "Gujarati"],
    standards: ["Primary"],
    bio: "Experienced teacher with deep knowledge of Social Science and Gujarati. Specializes in making learning interesting and easy for primary students.",
    isOwner: true,
    image: "/faculty/rajesh.jpg"
  },
  {
    id: 3,
    name: "Mukesh Patel",
    qualification: "Not specified",
    subjects: ["English"],
    standards: ["Std 9 to 12"],
    bio: "English teacher dedicated to helping students improve their language skills and communication abilities.",
    isOwner: false
  },
  {
    id: 4,
    name: "Neha Patel",
    qualification: "Not specified",
    subjects: ["Social Science"],
    standards: ["Std 9", "10"],
    bio: "Social Science expert focused on making history and geography engaging for students.",
    isOwner: false
  },
  {
    id: 5,
    name: "Nilesh Trivedi",
    qualification: "Not specified",
    subjects: ["Science"],
    standards: ["Std 9", "10"],
    bio: "Science teacher passionate about making complex scientific concepts accessible to students.",
    isOwner: false
  },
  {
    id: 6,
    name: "Kinjal Purohit",
    qualification: "Not specified",
    subjects: ["Gujarati", "Hindi"],
    standards: ["Std 9 to 12"],
    bio: "Language teacher specializing in Gujarati and Hindi with effective teaching methods.",
    isOwner: false
  },
  {
    id: 7,
    name: "Satish Thakkar",
    qualification: "Not specified",
    subjects: ["Gujarati"],
    standards: ["Std 9 to 12"],
    bio: "Experienced Gujarati teacher helping students master the language.",
    isOwner: false
  },
  {
    id: 8,
    name: "Bhavik Joshi",
    qualification: "Not specified",
    subjects: ["Sanskrit"],
    standards: ["Std 7 to 10"],
    bio: "Sanskrit teacher dedicated to preserving and teaching ancient language traditions.",
    isOwner: false
  },
  {
    id: 9,
    name: "Vijay Suthar",
    qualification: "Not specified",
    subjects: ["English"],
    standards: ["Std 8 to 12"],
    bio: "English language instructor focused on building strong communication skills.",
    isOwner: false
  },
  {
    id: 10,
    name: "Dipendra Pal",
    qualification: "Not specified",
    subjects: ["English", "Science"],
    standards: ["Std 8 to 10"],
    bio: "Dedicated teacher with expertise in English and Science subjects.",
    isOwner: false
  },
  {
    id: 11,
    name: "Shweta Parekh",
    qualification: "Not specified",
    subjects: ["Social Science", "Economics", "BA English Medium"],
    standards: ["Std 9", "10", "11", "12"],
    bio: "Social Science and Economics teacher with comprehensive knowledge of the subjects.",
    isOwner: false
  },
  {
    id: 12,
    name: "Janak Patel",
    qualification: "Not specified",
    subjects: ["Commerce"],
    standards: ["Std 11", "12"],
    bio: "Commerce teacher specializing in business studies and accounting.",
    isOwner: false
  },
  {
    id: 13,
    name: "Ravi Darji",
    qualification: "B.A.",
    subjects: ["Commerce", "Statistics"],
    standards: ["Std 11", "12"],
    bio: "Experienced Commerce and Statistics teacher with practical knowledge.",
    isOwner: false
  },
  {
    id: 14,
    name: "Chintan Patel",
    qualification: "Not specified",
    subjects: ["Science", "Maths"],
    standards: ["Std 11", "12"],
    bio: "Science and Maths teacher dedicated to student success in board exams.",
    isOwner: false
  },
  {
    id: 15,
    name: "Rajnikant Dixit",
    qualification: "Not specified",
    subjects: ["Physics"],
    standards: ["Std 11", "12"],
    bio: "Physics teacher with expertise in helping students understand complex concepts.",
    isOwner: false
  },
  {
    id: 16,
    name: "Shital Dave",
    qualification: "S.S., D.Ed",
    subjects: ["Social Science", "English"],
    standards: ["Primary"],
    bio: "Primary school teacher with expertise in Social Science and English.",
    isOwner: false
  },
  {
    id: 17,
    name: "Ekta Shah",
    qualification: "M.B.A.",
    subjects: ["Maths", "Science"],
    standards: ["Primary"],
    bio: "MBA graduate teaching Maths and Science to primary students with innovative methods.",
    isOwner: false
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
                    {teacher.image ? (
                      <img 
                        src={teacher.image} 
                        alt={teacher.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${teacher.isOwner ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-blue-100'}`}>
                        <GraduationCap className={`h-10 w-10 ${teacher.isOwner ? 'text-orange-600' : 'text-blue-600'}`} />
                      </div>
                    )}
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

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Standards</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.standards.map((standard, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                          {standard}
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

