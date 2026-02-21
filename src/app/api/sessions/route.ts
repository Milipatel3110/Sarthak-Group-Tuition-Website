import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all live sessions or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const facultyId = searchParams.get('facultyId')
    const status = searchParams.get('status')

    const where: any = {}

    if (courseId) where.courseId = courseId
    if (facultyId) where.facultyId = facultyId
    if (status) where.status = status

    const sessions = await prisma.liveSession.findMany({
      where,
      include: {
        course: true,
        faculty: { include: { user: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Error fetching sessions' }, { status: 500 })
  }
}

// Create a new live session (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { title, description, sessionType, scheduledAt, durationMinutes, courseId, facultyId, meetingLink } = await request.json()

    const session = await prisma.liveSession.create({
      data: {
        title,
        description,
        sessionType,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 60,
        courseId,
        facultyId,
        meetingLink,
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({ success: true, session, message: 'Live session scheduled' })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json({ error: 'Error creating session' }, { status: 500 })
  }
}

// Update session status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const { status, recordingUrl } = await request.json()

    const session = await prisma.liveSession.update({
      where: { id },
      data: { 
        status,
        recordingUrl
      }
    })

    return NextResponse.json({ success: true, session, message: 'Session updated' })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ error: 'Error updating session' }, { status: 500 })
  }
}

