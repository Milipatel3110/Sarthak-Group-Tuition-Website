import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all assignments or filter by course/student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')
    const facultyId = searchParams.get('facultyId')

    const where: any = {}

    if (courseId) {
      where.courseId = courseId
    }

    if (facultyId) {
      where.facultyId = facultyId
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: true,
        faculty: {
          include: { user: true }
        },
        submissions: studentId ? {
          where: { studentId }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json({ error: 'Error fetching assignments' }, { status: 500 })
  }
}

// Create a new assignment (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { courseId, facultyId, title, description, dueDate, maxMarks, attachments } = await request.json()

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        facultyId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxMarks: maxMarks || 100,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
    })

    return NextResponse.json({ success: true, assignment, message: 'Assignment created' })
  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json({ error: 'Error creating assignment' }, { status: 500 })
  }
}

