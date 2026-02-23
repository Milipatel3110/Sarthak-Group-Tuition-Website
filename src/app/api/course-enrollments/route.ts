import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET course enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (courseId) where.courseId = courseId
    if (status) where.status = status

    const enrollments = await prisma.courseEnrollment.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                profilePhoto: true,
                isActive: true,
              },
            },
          },
        },
        course: true
      },
      orderBy: { enrollmentDate: 'desc' }
    })

    return NextResponse.json({ success: true, enrollments })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json({ error: 'Error fetching enrollments' }, { status: 500 })
  }
}

// Enroll student in course
export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId } = await request.json()

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({ success: true, enrollment, message: 'Student enrolled successfully' })
  } catch (error) {
    console.error('Enroll error:', error)
    return NextResponse.json({ error: 'Error enrolling student' }, { status: 500 })
  }
}

// Update enrollment status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    const { status } = await request.json()

    const enrollment = await prisma.courseEnrollment.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ success: true, enrollment, message: 'Enrollment updated' })
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json({ error: 'Error updating enrollment' }, { status: 500 })
  }
}

