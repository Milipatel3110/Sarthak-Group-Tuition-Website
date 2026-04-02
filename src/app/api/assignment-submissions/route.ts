import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const assignmentId = searchParams.get('assignmentId')

    const where: Prisma.AssignmentSubmissionWhereInput = {}
    if (studentId) where.studentId = studentId
    if (assignmentId) where.assignmentId = assignmentId

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: {
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
        assignment: {
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
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ success: true, submissions })
  } catch (error) {
    console.error('Get assignment submissions error:', error)
    return NextResponse.json({ error: 'Error fetching submissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, studentId, submissionText, attachments } = await request.json()

    if (!assignmentId || !studentId) {
      return NextResponse.json(
        { error: 'assignmentId and studentId are required' },
        { status: 400 }
      )
    }

    const attachmentsValue =
      Array.isArray(attachments) && attachments.length > 0
        ? JSON.stringify(attachments)
        : null

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        submissionText: submissionText || null,
        attachments: attachmentsValue,
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        submissionText: submissionText || null,
        attachments: attachmentsValue,
      },
    })

    return NextResponse.json({
      success: true,
      submission,
      message: 'Assignment submitted successfully',
    })
  } catch (error) {
    console.error('Submit assignment error:', error)
    return NextResponse.json({ error: 'Error submitting assignment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { marks, feedback } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        marks: typeof marks === 'number' ? marks : marks ? Number(marks) : null,
        feedback: feedback || null,
        gradedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, submission, message: 'Submission graded' })
  } catch (error) {
    console.error('Grade submission error:', error)
    return NextResponse.json({ error: 'Error grading submission' }, { status: 500 })
  }
}
