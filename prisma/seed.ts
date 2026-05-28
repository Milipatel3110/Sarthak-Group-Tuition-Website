import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin users ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@sarthakgroup.com' },
    update: {},
    create: {
      email: 'admin@sarthakgroup.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Sarthak',
      phone: '+91 9328705157',
      isActive: true,
    },
  })

  const primaryAdminPw = await bcrypt.hash('Admin@123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@sarthak.com' },
    update: {},
    create: {
      email: 'admin@sarthak.com',
      password: primaryAdminPw,
      role: 'ADMIN',
      firstName: 'Sarthak',
      lastName: 'Admin',
      phone: '9328705157',
      isActive: true,
    },
  })
  console.log('✅ Admin users created/verified')

  // ── Faculty users ──────────────────────────────────────────────────────────
  const facultyPw = await bcrypt.hash('Faculty@123', 12)

  const facultyList = [
    {
      email: 'arpan@sarthakgroup.com',
      firstName: 'Arpan',
      lastName: 'Patel',
      phone: '9328705157',
      qualification: 'M.Sc., M.Ed',
      subjects: ['Mathematics', 'Science'],
      standards: ['Std 8', 'Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 25,
      bio: 'Founder and owner of Sarthak Group Tuition. Expert Mathematics teacher with 25+ years of experience in JEE and board exam preparation.',
      isOwner: true,
    },
    {
      email: 'chetna@sarthakgroup.com',
      firstName: 'Chetna',
      lastName: 'Patel',
      phone: '9000000002',
      qualification: 'M.A., B.A., B.Ed',
      subjects: ['Social Science', 'Gujarati'],
      standards: ['Primary'],
      experienceYears: 12,
      bio: 'Experienced teacher with deep knowledge of Social Science and Gujarati. Specializes in making learning interesting for primary students.',
      isOwner: true,
    },
    {
      email: 'mukesh@sarthakgroup.com',
      firstName: 'Mukesh',
      lastName: 'Patel',
      phone: '9000000003',
      qualification: 'B.A., B.Ed',
      subjects: ['English'],
      standards: ['Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 8,
      bio: 'English teacher dedicated to helping students improve their language skills and communication abilities.',
      isOwner: false,
    },
    {
      email: 'neha@sarthakgroup.com',
      firstName: 'Neha',
      lastName: 'Patel',
      phone: '9000000004',
      qualification: 'M.A., B.Ed',
      subjects: ['Social Science'],
      standards: ['Std 9', 'Std 10'],
      experienceYears: 6,
      bio: 'Social Science expert focused on making history and geography engaging for students.',
      isOwner: false,
    },
    {
      email: 'nilesh@sarthakgroup.com',
      firstName: 'Nilesh',
      lastName: 'Trivedi',
      phone: '9000000005',
      qualification: 'M.Sc., B.Ed',
      subjects: ['Science'],
      standards: ['Std 9', 'Std 10'],
      experienceYears: 7,
      bio: 'Science teacher passionate about making complex scientific concepts accessible to students.',
      isOwner: false,
    },
    {
      email: 'kinjal@sarthakgroup.com',
      firstName: 'Kinjal',
      lastName: 'Purohit',
      phone: '9000000006',
      qualification: 'M.A., B.Ed',
      subjects: ['Gujarati', 'Hindi'],
      standards: ['Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 9,
      bio: 'Language teacher specializing in Gujarati and Hindi with effective teaching methods.',
      isOwner: false,
    },
    {
      email: 'satish@sarthakgroup.com',
      firstName: 'Satish',
      lastName: 'Thakkar',
      phone: '9000000007',
      qualification: 'M.A.',
      subjects: ['Gujarati'],
      standards: ['Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 11,
      bio: 'Experienced Gujarati teacher helping students master the language.',
      isOwner: false,
    },
    {
      email: 'bhavik@sarthakgroup.com',
      firstName: 'Bhavik',
      lastName: 'Joshi',
      phone: '9000000008',
      qualification: 'M.A. Sanskrit',
      subjects: ['Sanskrit'],
      standards: ['Std 7', 'Std 8', 'Std 9', 'Std 10'],
      experienceYears: 10,
      bio: 'Sanskrit teacher dedicated to preserving and teaching ancient language traditions.',
      isOwner: false,
    },
    {
      email: 'vijay@sarthakgroup.com',
      firstName: 'Vijay',
      lastName: 'Suthar',
      phone: '9000000009',
      qualification: 'B.A., B.Ed',
      subjects: ['English'],
      standards: ['Std 8', 'Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 8,
      bio: 'English language instructor focused on building strong communication skills.',
      isOwner: false,
    },
    {
      email: 'dipendra@sarthakgroup.com',
      firstName: 'Dipendra',
      lastName: 'Pal',
      phone: '9000000010',
      qualification: 'B.Sc., B.Ed',
      subjects: ['English', 'Science'],
      standards: ['Std 8', 'Std 9', 'Std 10'],
      experienceYears: 6,
      bio: 'Dedicated teacher with expertise in English and Science subjects.',
      isOwner: false,
    },
    {
      email: 'shweta@sarthakgroup.com',
      firstName: 'Shweta',
      lastName: 'Parekh',
      phone: '9000000011',
      qualification: 'M.A., B.Ed',
      subjects: ['Social Science', 'Economics'],
      standards: ['Std 9', 'Std 10', 'Std 11', 'Std 12'],
      experienceYears: 9,
      bio: 'Social Science and Economics teacher with comprehensive knowledge of the subjects.',
      isOwner: false,
    },
    {
      email: 'janak@sarthakgroup.com',
      firstName: 'Janak',
      lastName: 'Patel',
      phone: '9000000012',
      qualification: 'M.Com., B.Ed',
      subjects: ['Commerce', 'Accountancy'],
      standards: ['Std 11', 'Std 12'],
      experienceYears: 7,
      bio: 'Commerce teacher specializing in business studies and accounting.',
      isOwner: false,
    },
    {
      email: 'ravi@sarthakgroup.com',
      firstName: 'Ravi',
      lastName: 'Darji',
      phone: '9000000013',
      qualification: 'B.A., B.Com',
      subjects: ['Commerce', 'Statistics'],
      standards: ['Std 11', 'Std 12'],
      experienceYears: 8,
      bio: 'Experienced Commerce and Statistics teacher with practical knowledge.',
      isOwner: false,
    },
    {
      email: 'chintan@sarthakgroup.com',
      firstName: 'Chintan',
      lastName: 'Patel',
      phone: '9000000014',
      qualification: 'M.Sc., B.Ed',
      subjects: ['Science', 'Mathematics'],
      standards: ['Std 11', 'Std 12'],
      experienceYears: 5,
      bio: 'Science and Maths teacher dedicated to student success in board exams.',
      isOwner: false,
    },
    {
      email: 'rajnikant@sarthakgroup.com',
      firstName: 'Rajnikant',
      lastName: 'Dixit',
      phone: '9000000015',
      qualification: 'M.Sc. Physics',
      subjects: ['Physics'],
      standards: ['Std 11', 'Std 12'],
      experienceYears: 12,
      bio: 'Physics teacher with expertise in helping students understand complex concepts.',
      isOwner: false,
    },
    {
      email: 'shital@sarthakgroup.com',
      firstName: 'Shital',
      lastName: 'Dave',
      phone: '9000000016',
      qualification: 'S.S., D.Ed',
      subjects: ['Social Science', 'English'],
      standards: ['Primary'],
      experienceYears: 10,
      bio: 'Primary school teacher with expertise in Social Science and English.',
      isOwner: false,
    },
    {
      email: 'ekta@sarthakgroup.com',
      firstName: 'Ekta',
      lastName: 'Shah',
      phone: '9000000017',
      qualification: 'M.B.A.',
      subjects: ['Mathematics', 'Science'],
      standards: ['Primary'],
      experienceYears: 4,
      bio: 'MBA graduate teaching Maths and Science to primary students with innovative methods.',
      isOwner: false,
    },
  ]

  for (const f of facultyList) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        email: f.email,
        password: facultyPw,
        role: 'FACULTY',
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
        isActive: true,
      },
    })

    const existing = await prisma.facultyProfile.findUnique({ where: { userId: user.id } })
    if (!existing) {
      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          qualification: f.qualification,
          subjects: JSON.stringify(f.subjects),
          experienceYears: f.experienceYears,
          bio: f.bio,
          isOwner: f.isOwner,
        },
      })
    }
    console.log(`✅ Faculty: ${f.firstName} ${f.lastName} — ${f.email}`)
  }

  // ── Courses ────────────────────────────────────────────────────────────────
  const courses = [
    // Primary (Class 1–5)
    {
      name: 'Class 1-5 Foundation (English Medium)',
      description: 'Comprehensive foundation course for Class 1 to 5 students covering all core subjects in English medium.',
      subjects: JSON.stringify(['Mathematics', 'English', 'Science', 'Social Science', 'Hindi']),
      targetClass: 'Class 1-5',
      fee: 12000,
      duration: '1 year',
      features: JSON.stringify(['Expert Faculty', 'Activity-Based Learning', 'Regular Tests', 'Study Materials']),
      isActive: true,
    },
    {
      name: 'Class 1-5 Foundation (Gujarati Medium)',
      description: 'Comprehensive foundation course for Class 1 to 5 students covering all core subjects in Gujarati medium.',
      subjects: JSON.stringify(['Mathematics', 'Gujarati', 'Science', 'Social Science', 'Hindi']),
      targetClass: 'Class 1-5',
      fee: 12000,
      duration: '1 year',
      features: JSON.stringify(['Expert Faculty', 'Activity-Based Learning', 'Regular Tests', 'Study Materials']),
      isActive: true,
    },
    // Middle School (Class 6–8)
    {
      name: 'Class 6-8 (English Medium)',
      description: 'Structured coaching for Class 6 to 8 students in English medium covering Science, Maths, English and Social Science.',
      subjects: JSON.stringify(['Mathematics', 'Science', 'English', 'Social Science', 'Sanskrit']),
      targetClass: 'Class 6-8',
      fee: 18000,
      duration: '1 year',
      features: JSON.stringify(['Expert Faculty', 'Doubt Clearing', 'Regular Tests', 'Study Materials']),
      isActive: true,
    },
    {
      name: 'Class 6-8 (Gujarati Medium)',
      description: 'Structured coaching for Class 6 to 8 students in Gujarati medium covering all core subjects.',
      subjects: JSON.stringify(['Mathematics', 'Science', 'Gujarati', 'Social Science', 'Sanskrit']),
      targetClass: 'Class 6-8',
      fee: 18000,
      duration: '1 year',
      features: JSON.stringify(['Expert Faculty', 'Doubt Clearing', 'Regular Tests', 'Study Materials']),
      isActive: true,
    },
    // Class 9–10
    {
      name: 'Class 9-10 (English Medium)',
      description: 'Board exam preparation for Class 9 and 10 students in English medium with intensive practice and mock tests.',
      subjects: JSON.stringify(['Mathematics', 'Science', 'English', 'Social Science', 'Sanskrit/Hindi']),
      targetClass: 'Class 9-10',
      fee: 25000,
      duration: '1 year',
      features: JSON.stringify(['Board Exam Prep', 'Mock Tests', 'Doubt Clearing', 'Study Materials', 'Expert Faculty']),
      isActive: true,
    },
    {
      name: 'Class 9-10 (Gujarati Medium)',
      description: 'Board exam preparation for Class 9 and 10 students in Gujarati medium with intensive practice and mock tests.',
      subjects: JSON.stringify(['Mathematics', 'Science', 'Gujarati', 'Social Science', 'Sanskrit/Hindi']),
      targetClass: 'Class 9-10',
      fee: 25000,
      duration: '1 year',
      features: JSON.stringify(['Board Exam Prep', 'Mock Tests', 'Doubt Clearing', 'Study Materials', 'Expert Faculty']),
      isActive: true,
    },
    // Class 11–12 Science PCM
    {
      name: 'Class 11-12 Science PCM (English Medium)',
      description: 'Physics, Chemistry, Mathematics for Class 11-12 Science stream with JEE preparation in English medium.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      targetClass: 'Class 11-12 Science',
      fee: 45000,
      duration: '2 years',
      features: JSON.stringify(['JEE Preparation', 'Expert Faculty', 'Lab Sessions', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
    {
      name: 'Class 11-12 Science PCM (Gujarati Medium)',
      description: 'Physics, Chemistry, Mathematics for Class 11-12 Science stream with board preparation in Gujarati medium.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      targetClass: 'Class 11-12 Science',
      fee: 40000,
      duration: '2 years',
      features: JSON.stringify(['Board Exam Prep', 'Expert Faculty', 'Lab Sessions', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
    // Class 11–12 Science PCB
    {
      name: 'Class 11-12 Science PCB (English Medium)',
      description: 'Physics, Chemistry, Biology for Class 11-12 Science stream with NEET preparation in English medium.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      targetClass: 'Class 11-12 Science',
      fee: 45000,
      duration: '2 years',
      features: JSON.stringify(['NEET Preparation', 'Expert Faculty', 'Lab Sessions', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
    {
      name: 'Class 11-12 Science PCB (Gujarati Medium)',
      description: 'Physics, Chemistry, Biology for Class 11-12 Science stream with board preparation in Gujarati medium.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      targetClass: 'Class 11-12 Science',
      fee: 40000,
      duration: '2 years',
      features: JSON.stringify(['Board Exam Prep', 'Expert Faculty', 'Lab Sessions', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
    // Class 11–12 Commerce
    {
      name: 'Class 11-12 Commerce (English Medium)',
      description: 'Commerce stream coaching for Class 11-12 with CA Foundation preparation in English medium.',
      subjects: JSON.stringify(['Accountancy', 'Economics', 'Business Studies', 'Statistics']),
      targetClass: 'Class 11-12 Commerce',
      fee: 35000,
      duration: '2 years',
      features: JSON.stringify(['CA Foundation Prep', 'Expert Faculty', 'Practice Papers', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
    {
      name: 'Class 11-12 Commerce (Gujarati Medium)',
      description: 'Commerce stream coaching for Class 11-12 with board preparation in Gujarati medium.',
      subjects: JSON.stringify(['Accountancy', 'Economics', 'Business Studies', 'Statistics']),
      targetClass: 'Class 11-12 Commerce',
      fee: 30000,
      duration: '2 years',
      features: JSON.stringify(['Board Exam Prep', 'Expert Faculty', 'Practice Papers', 'Mock Tests', 'Study Materials']),
      isActive: true,
    },
  ]

  // Delete old courses and re-create
  await prisma.course.deleteMany({})
  for (const course of courses) {
    await prisma.course.create({ data: course })
  }
  console.log(`✅ ${courses.length} courses created`)

  // ── Sample announcement ────────────────────────────────────────────────────
  const ownerProfile = await prisma.facultyProfile.findFirst({ where: { isOwner: true } })
  if (ownerProfile) {
    const existing = await prisma.announcement.findFirst({ where: { title: 'Welcome to Sarthak Group Tuition' } })
    if (!existing) {
      await prisma.announcement.create({
        data: {
          title: 'Welcome to Sarthak Group Tuition',
          content: 'We are excited to have you here. Best of luck for your academic journey!',
          facultyId: ownerProfile.id,
          targetRole: 'all',
          isPinned: true,
        },
      })
    }
  }

  console.log('\n=== FACULTY LOGIN CREDENTIALS ===')
  for (const f of facultyList) {
    console.log(`${f.firstName} ${f.lastName}: ${f.email} / Faculty@123`)
  }
  console.log('\nAdmin: admin@sarthak.com / Admin@123')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
