import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET all assignments or filter by course/student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')
    const facultyId = searchParams.get('facultyId')
    const search = searchParams.get('search')

    const where: Prisma.AssignmentWhereInput = {}

    if (courseId) {
      where.courseId = courseId
    }

    if (facultyId) {
      where.facultyId = facultyId
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: true,
        faculty: {
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
        submissions: studentId ? { where: { studentId } } : true,
        _count: {
          select: {
            submissions: true,
          },
        },
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

    if (!courseId || !facultyId || !title || !description) {
      return NextResponse.json(
        { error: 'courseId, facultyId, title and description are required' },
        { status: 400 }
      )
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    await prisma.assignment.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Assignment deleted' })
  } catch (error) {
    console.error('Delete assignment error:', error)
    return NextResponse.json({ error: 'Error deleting assignment' }, { status: 500 })
  }
}

