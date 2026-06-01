import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/students/credentials
 *
 * Two modes depending on which body fields are provided:
 *
 * Mode A — update student portal credentials:
 *   Body: { userId, email, password }
 *
 * Mode B — create or update a parent portal account linked to a student:
 *   Body: { studentId, parentEmail, parentPassword, parentFirstName, parentLastName, parentPhone }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ---- Mode B: parent portal credentials ----
    if (body.studentId !== undefined || body.parentEmail !== undefined) {
      return handleParentCredentials(body)
    }

    // ---- Mode A: student portal credentials ----
    return handleStudentCredentials(body)
  } catch (error) {
    console.error('POST /api/admin/students/credentials error:', error)
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 })
  }
}

// ==================== Mode A ====================

async function handleStudentCredentials(body: {
  userId?: string
  email?: string
  password?: string
}) {
  const { userId, email, password } = body

  if (!userId || !email || !password) {
    return NextResponse.json(
      { error: 'userId, email, and password are required' },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email, password: hashedPassword },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error: unknown) {
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (isPrismaUniqueConflict(error)) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
    }
    throw error
  }
}

// ==================== Mode B ====================

async function handleParentCredentials(body: {
  studentId?: string
  parentEmail?: string
  parentPassword?: string
  parentFirstName?: string
  parentLastName?: string
  parentPhone?: string
}) {
  const { studentId, parentEmail, parentPassword, parentFirstName, parentLastName, parentPhone } =
    body

  if (!studentId || !parentEmail || !parentPassword) {
    return NextResponse.json(
      { error: 'studentId, parentEmail, and parentPassword are required' },
      { status: 400 }
    )
  }

  // Verify student profile exists
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { parent: { include: { user: true } } },
  })

  if (!studentProfile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
  }

  const hashedPassword = await bcrypt.hash(parentPassword, 12)

  // If a parent is already linked, update that user's credentials
  if (studentProfile.parent) {
    const updatedParentUser = await prisma.user.update({
      where: { id: studentProfile.parent.userId },
      data: {
        email: parentEmail,
        password: hashedPassword,
        ...(parentFirstName !== undefined && { firstName: parentFirstName }),
        ...(parentLastName !== undefined && { lastName: parentLastName }),
        ...(parentPhone !== undefined && { phone: parentPhone }),
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    })

    return NextResponse.json(
      { success: true, parentUserId: updatedParentUser.id, parentEmail: updatedParentUser.email },
      { status: 200 }
    )
  }

  // Create a new PARENT User + ParentProfile, then link to student
  const parentUser = await prisma.user.create({
    data: {
      email: parentEmail,
      password: hashedPassword,
      firstName: parentFirstName ?? '',
      lastName: parentLastName ?? '',
      phone: parentPhone ?? null,
      role: 'PARENT',
      parentProfile: {
        create: {},
      },
    },
    include: { parentProfile: true },
  })

  // Link the new parent profile to the student
  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { parentId: parentUser.parentProfile!.id },
  })

  return NextResponse.json(
    { success: true, parentUserId: parentUser.id, parentEmail: parentUser.email },
    { status: 201 }
  )
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

function isPrismaUniqueConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
