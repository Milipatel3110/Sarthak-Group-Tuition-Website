import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
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

  console.log('Admin user created:', admin.email)

  // Create sample faculty (owner - Sarthak)
  const facultyPassword = await bcrypt.hash('faculty123', 12)
  
  const faculty = await prisma.user.upsert({
    where: { email: 'sarthak@sarthakgroup.com' },
    update: {},
    create: {
      email: 'sarthak@sarthakgroup.com',
      password: facultyPassword,
      role: 'FACULTY',
      firstName: 'Sarthak',
      lastName: 'Sharma',
      phone: '+91 9328705157',
      isActive: true,
      facultyProfile: {
        create: {
          qualification: 'M.Sc. Mathematics',
          subjects: JSON.stringify(['Mathematics', 'Quantitative Aptitude']),
          experienceYears: 10,
          bio: 'Owner and Director of Sarthak Group Tuition. Expert in Mathematics with 10+ years of teaching experience.',
          isOwner: true,
        },
      },
    },
  })

  console.log('Faculty user created:', faculty.email)

  // Create sample courses
  const courses = [
    {
      name: 'Class 9-10 Foundation',
      description: 'Comprehensive foundation course for Class 9 and 10 students preparing for board exams.',
      subjects: JSON.stringify(['Mathematics', 'Science', 'English', 'Social Science']),
      targetClass: 'Class 9-10',
      fee: 25000,
      duration: '1 year',
      features: JSON.stringify(['Expert Faculty', 'Study Materials', 'Regular Tests', 'Doubt Clearing']),
      isActive: true,
    },
    {
      name: 'Class 11-12 Science (PCM)',
      description: 'Physics, Chemistry, Mathematics for Class 11-12 Science stream students.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      targetClass: 'Class 11-12 Science',
      fee: 45000,
      duration: '2 years',
      features: JSON.stringify(['Expert Faculty', 'JEE Preparation', 'Study Materials', 'Lab Sessions']),
      isActive: true,
    },
    {
      name: 'Class 11-12 Commerce',
      description: 'Commerce stream coaching for Class 11-12 students.',
      subjects: JSON.stringify(['Accountancy', 'Economics', 'Business Studies']),
      targetClass: 'Class 11-12 Commerce',
      fee: 35000,
      duration: '2 years',
      features: JSON.stringify(['Expert Faculty', 'CA Foundation Prep', 'Study Materials', 'Practice Papers']),
      isActive: true,
    },
    {
      name: 'JEE Crash Course',
      description: 'Intensive crash course for JEE preparation.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      targetClass: 'Class 11-12',
      fee: 30000,
      duration: '6 months',
      features: JSON.stringify(['Intensive Training', 'Mock Tests', 'Problem Solving', 'Revision Notes']),
      isActive: true,
    },
  ]

for (const course of courses) {
    await prisma.course.create({
      data: course,
    })
  }

  console.log('Sample courses created')

  // Create sample announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Sarthak Group Tuition',
      content: 'We are excited to have you here. Best of luck for your academic journey!',
      facultyId: (await prisma.facultyProfile.findFirst({ where: { isOwner: true } }))?.id || '',
      targetRole: 'all',
      isPinned: true,
    },
  })

  console.log('Sample announcement created')

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

