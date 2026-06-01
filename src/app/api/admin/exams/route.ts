import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ==================== GET ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    const exams = await prisma.exam.findMany({
      where: batchId ? { batchId } : undefined,
      include: {
        batch: { select: { name: true } },
        _count: { select: { grades: true, examPapers: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, exams })
  } catch (error) {
    console.error('GET /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}

// ==================== POST ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchId, subject, date, dayOfWeek, time, room, maxMarks, syllabus } = body

    if (!batchId || !subject || !date || !dayOfWeek || !time || !maxMarks) {
      return NextResponse.json(
        { error: 'batchId, subject, date, dayOfWeek, time, and maxMarks are required' },
        { status: 400 }
      )
    }

    const exam = await prisma.exam.create({
      data: {
        batchId,
        subject,
        date: new Date(date),
        dayOfWeek,
        time,
        room: room ?? null,
        maxMarks,
        syllabus: syllabus ?? null,
      },
    })

    // Collect userIds to notify
    const userIdSet = new Set<string>()

    // Students in this batch
    const students = await prisma.studentProfile.findMany({
      where: { batchId },
      select: { userId: true },
    })
    for (const s of students) userIdSet.add(s.userId)

    // Faculty with timetable entries for this batch
    const timetableEntries = await prisma.timetable.findMany({
      where: { batchId },
      select: {
        faculty: { select: { userId: true } },
      },
    })
    for (const t of timetableEntries) userIdSet.add(t.faculty.userId)

    // Create notification records
    if (userIdSet.size > 0) {
      const notificationData = Array.from(userIdSet).map((userId) => ({
        userId,
        type: 'EXAM',
        title: `Exam: ${subject}`,
        message: `${subject} exam scheduled on ${new Date(date).toLocaleDateString()} at ${time} in ${room || 'TBD'}. Max marks: ${maxMarks}`,
        examId: exam.id,
      }))

      await prisma.notification.createMany({ data: notificationData })
    }

    return NextResponse.json({ success: true, exam }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}

// ==================== PUT ====================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, subject, date, dayOfWeek, time, room, maxMarks, syllabus, batchId } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(subject !== undefined && { subject }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(time !== undefined && { time }),
        ...(room !== undefined && { room }),
        ...(maxMarks !== undefined && { maxMarks }),
        ...(syllabus !== undefined && { syllabus }),
        ...(batchId !== undefined && { batchId }),
      },
      include: {
        batch: { select: { name: true } },
        _count: { select: { grades: true, examPapers: true } },
      },
    })

    return NextResponse.json({ success: true, exam })
  } catch (error) {
    console.error('PUT /api/admin/exams error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
  }
}

// ==================== DELETE ====================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Query parameter "id" is required' }, { status: 400 })
    }

    await prisma.exam.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/admin/exams error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}

// ==================== Helpers ====================

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  )
}
