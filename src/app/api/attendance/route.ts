import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const date = searchParams.get('date')

    const where: any = {}

    if (studentId) where.studentId = studentId
    if (courseId) where.courseId = courseId
    if (date) where.date = new Date(date)

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: true } },
        course: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json({ error: 'Error fetching attendance' }, { status: 500 })
  }
}

// Mark attendance (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, date, status } = await request.json()

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId,
          courseId,
          date: new Date(date)
        }
      },
      update: { status },
      create: {
        studentId,
        courseId,
        date: new Date(date),
        status
      }
    })

    return NextResponse.json({ success: true, attendance, message: 'Attendance marked' })
  } catch (error) {
    console.error('Mark attendance error:', error)
    return NextResponse.json({ error: 'Error marking attendance' }, { status: 500 })
  }
}

