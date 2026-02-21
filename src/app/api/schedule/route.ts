import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET schedule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (dayOfWeek) where.dayOfWeek = dayOfWeek

    const schedule = await prisma.schedule.findMany({
      where,
      include: {
        course: true,
        faculty: { include: { user: true } }
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json({ success: true, schedule })
  } catch (error) {
    console.error('Get schedule error:', error)
    return NextResponse.json({ error: 'Error fetching schedule' }, { status: 500 })
  }
}

// Create schedule entry
export async function POST(request: NextRequest) {
  try {
    const { courseId, dayOfWeek, startTime, endTime, subject, roomNumber, facultyId } = await request.json()

    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        subject,
        roomNumber,
        facultyId
      }
    })

    return NextResponse.json({ success: true, schedule, message: 'Schedule created' })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json({ error: 'Error creating schedule' }, { status: 500 })
  }
}

// Update schedule
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    const { startTime, endTime, subject, roomNumber, facultyId } = await request.json()

    const schedule = await prisma.schedule.update({
      where: { id },
      data: { startTime, endTime, subject, roomNumber, facultyId }
    })

    return NextResponse.json({ success: true, schedule, message: 'Schedule updated' })
  } catch (error) {
    console.error('Update schedule error:', error)
    return NextResponse.json({ error: 'Error updating schedule' }, { status: 500 })
  }
}

// Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    await prisma.schedule.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Schedule deleted' })
  } catch (error) {
    console.error('Delete schedule error:', error)
    return NextResponse.json({ error: 'Error deleting schedule' }, { status: 500 })
  }
}

