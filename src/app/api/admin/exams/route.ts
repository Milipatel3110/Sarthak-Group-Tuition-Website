import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const EXAM_INCLUDE = {
  batch: { select: { id: true, name: true, standard: true, medium: true } },
  assignedFaculty: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
  _count: { select: { grades: true, examPapers: true } },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    const exams = await prisma.exam.findMany({
      where: batchId ? { batchId } : undefined,
      include: EXAM_INCLUDE,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ success: true, exams })
  } catch (error) {
    console.error('GET /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchId, facultyId, subject, date, dayOfWeek, startTime, endTime, room, maxMarks, syllabus } = body

    if (!batchId || !subject || !date || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'batchId, subject, date, dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    // facultyId from the UI is a User.id — resolve to FacultyProfile.id
    let resolvedFacultyId: string | null = null
    if (facultyId) {
      const fp = await prisma.facultyProfile.findUnique({ where: { userId: facultyId }, select: { id: true } })
      resolvedFacultyId = fp?.id ?? null
    }

    const exam = await prisma.exam.create({
      data: {
        batchId,
        facultyId: resolvedFacultyId,
        subject,
        date: new Date(date),
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        maxMarks: parseInt(maxMarks) || 100,
        syllabus: syllabus || null,
      },
      include: EXAM_INCLUDE,
    })

    // Collect userIds to notify
    const userIdSet = new Set<string>()

    // All students in this batch
    const students = await prisma.studentProfile.findMany({
      where: { batchId },
      select: { userId: true },
    })
    students.forEach(s => userIdSet.add(s.userId))

    // Assigned faculty — notify them directly (we have their userId from form)
    if (facultyId) userIdSet.add(facultyId)

    // All faculty with timetable entries for this batch
    const timetableEntries = await prisma.timetable.findMany({
      where: { batchId },
      select: { faculty: { select: { userId: true } } },
    })
    timetableEntries.forEach(t => userIdSet.add(t.faculty.userId))

    const studentsNotified = students.length
    const facultyNotified = userIdSet.size - students.length

    // Create notifications
    if (userIdSet.size > 0) {
      const notifs = Array.from(userIdSet).map(userId => ({
        userId,
        type: 'EXAM',
        title: `Exam Scheduled: ${subject}`,
        message: `${subject} exam for batch on ${new Date(date).toLocaleDateString('en-IN')} from ${startTime} to ${endTime}${room ? ` in ${room}` : ''}. Max marks: ${maxMarks || 100}.${syllabus ? ` Syllabus: ${syllabus}` : ''}`,
        examId: exam.id,
      }))
      await prisma.notification.createMany({ data: notifs })
    }

    return NextResponse.json({ success: true, exam, studentsNotified, facultyNotified }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, batchId, facultyId, subject, date, dayOfWeek, startTime, endTime, room, maxMarks, syllabus } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // Resolve User.id → FacultyProfile.id if provided
    let resolvedFacultyId: string | null | undefined = undefined
    if (facultyId !== undefined) {
      if (facultyId) {
        const fp = await prisma.facultyProfile.findUnique({ where: { userId: facultyId }, select: { id: true } })
        resolvedFacultyId = fp?.id ?? null
      } else {
        resolvedFacultyId = null
      }
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(batchId !== undefined && { batchId }),
        ...(resolvedFacultyId !== undefined && { facultyId: resolvedFacultyId }),
        ...(subject !== undefined && { subject }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(room !== undefined && { room: room || null }),
        ...(maxMarks !== undefined && { maxMarks: parseInt(maxMarks) || 100 }),
        ...(syllabus !== undefined && { syllabus: syllabus || null }),
      },
      include: EXAM_INCLUDE,
    })

    return NextResponse.json({ success: true, exam })
  } catch (error) {
    console.error('PUT /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    await prisma.exam.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/exams error:', error)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}
