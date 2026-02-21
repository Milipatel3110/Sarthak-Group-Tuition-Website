import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET grades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (courseId) where.courseId = courseId

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: { include: { user: true } },
        course: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error('Get grades error:', error)
    return NextResponse.json({ error: 'Error fetching grades' }, { status: 500 })
  }
}

// Add grade (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, examName, marks, maxMarks, grade, remarks } = await request.json()

    const gradeRecord = await prisma.grade.create({
      data: {
        studentId,
        courseId,
        examName,
        marks,
        maxMarks: maxMarks || 100,
        grade,
        remarks
      }
    })

    return NextResponse.json({ success: true, gradeRecord, message: 'Grade added' })
  } catch (error) {
    console.error('Add grade error:', error)
    return NextResponse.json({ error: 'Error adding grade' }, { status: 500 })
  }
}

