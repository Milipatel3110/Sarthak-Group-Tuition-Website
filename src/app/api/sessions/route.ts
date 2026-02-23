import { NextRequest, NextResponse } from 'next/server'
import { Prisma, SessionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET all live sessions or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const facultyId = searchParams.get('facultyId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Prisma.LiveSessionWhereInput = {}

    if (courseId) where.courseId = courseId
    if (facultyId) where.facultyId = facultyId
    if (status) {
      if (!Object.values(SessionStatus).includes(status as SessionStatus)) {
        return NextResponse.json({ error: 'Invalid session status filter' }, { status: 400 })
      }
      where.status = status as SessionStatus
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    const sessions = await prisma.liveSession.findMany({
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

    if (!title || !sessionType || !scheduledAt || !facultyId) {
      return NextResponse.json(
        { error: 'title, sessionType, scheduledAt and facultyId are required' },
        { status: 400 }
      )
    }

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

    const { status, recordingUrl, meetingLink } = await request.json()

    const session = await prisma.liveSession.update({
      where: { id },
      data: { 
        status,
        recordingUrl,
        meetingLink,
      }
    })

    return NextResponse.json({ success: true, session, message: 'Session updated' })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ error: 'Error updating session' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    await prisma.liveSession.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Session deleted' })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ error: 'Error deleting session' }, { status: 500 })
  }
}

