import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')
    const facultyId = searchParams.get('facultyId')

    const timetables = await prisma.timetable.findMany({
      where: {
        isActive: true,
        ...(batchId ? { batchId } : {}),
        ...(facultyId ? { facultyId } : {}),
      },
      include: {
        batch: true,
        faculty: {
          include: { user: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ success: true, timetables }, { status: 200 })
  } catch (error) {
    console.error('GET /api/timetable error:', error)
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { batchId, facultyId, subject, dayOfWeek, startTime, endTime, room } = body

    if (!batchId || !facultyId || !subject || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'batchId, facultyId, subject, dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    const timetable = await prisma.timetable.create({
      data: {
        batchId,
        facultyId,
        subject,
        dayOfWeek,
        startTime,
        endTime,
        room: room ?? null,
      },
      include: {
        batch: true,
        faculty: { include: { user: true } },
      },
    })

    return NextResponse.json({ success: true, timetable }, { status: 201 })
  } catch (error) {
    console.error('POST /api/timetable error:', error)
    return NextResponse.json({ error: 'Failed to create timetable entry' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, batchId, facultyId, subject, dayOfWeek, startTime, endTime, room, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const timetable = await prisma.timetable.update({
      where: { id },
      data: {
        ...(batchId !== undefined && { batchId }),
        ...(facultyId !== undefined && { facultyId }),
        ...(subject !== undefined && { subject }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(room !== undefined && { room }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        batch: true,
        faculty: { include: { user: true } },
      },
    })

    return NextResponse.json({ success: true, timetable }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/timetable error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update timetable entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Query parameter "id" is required' }, { status: 400 })
    }

    await prisma.timetable.delete({ where: { id } })

    return NextResponse.json(
      { success: true, message: 'Timetable entry deleted successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('DELETE /api/timetable error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete timetable entry' }, { status: 500 })
  }
}

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  )
}
