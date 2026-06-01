import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// ==================== GET ====================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')
    const search = searchParams.get('search')
    const standard = searchParams.get('standard')

    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        studentProfile: {
          ...(batchId ? { batchId } : {}),
          ...(standard ? { class: { contains: standard, mode: 'insensitive' } } : {}),
        },
      },
      include: {
        studentProfile: {
          include: { batch: true },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    const sanitized = users.map(({ password: _pw, ...rest }) => rest)

    return NextResponse.json({ success: true, students: sanitized }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/students error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// ==================== POST ====================

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      class: studentClass,
      medium,
      schoolName,
      address,
      personalPhone,
      guardian1Phone,
      guardian2Phone,
      batchId,
      fatherFirstName,
      fatherLastName,
      fatherOccupation,
      motherFirstName,
      motherLastName,
      motherOccupation,
      feeInstallments,
    } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, and password are required' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: 'STUDENT',
        studentProfile: {
          create: {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            class: studentClass ?? null,
            medium: medium ?? 'English',
            schoolName: schoolName ?? null,
            address: address ?? null,
            personalPhone: personalPhone ?? null,
            guardian1Phone: guardian1Phone ?? null,
            guardian2Phone: guardian2Phone ?? null,
            batchId: batchId ?? null,
            fatherFirstName: fatherFirstName ?? null,
            fatherLastName: fatherLastName ?? null,
            fatherOccupation: fatherOccupation ?? null,
            motherFirstName: motherFirstName ?? null,
            motherLastName: motherLastName ?? null,
            motherOccupation: motherOccupation ?? null,
            ...(Array.isArray(feeInstallments) && feeInstallments.length > 0
              ? {
                  feeInstallments: {
                    create: feeInstallments.map((fi: { amount: number; dueDate: string; note?: string }) => ({
                      amount: fi.amount,
                      dueDate: new Date(fi.dueDate),
                      note: fi.note ?? null,
                      status: 'PENDING',
                    })),
                  },
                }
              : {}),
          },
        },
      },
      include: {
        studentProfile: {
          include: { batch: true, feeInstallments: true },
        },
      },
    })

    const { password: _pw, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, student: userWithoutPassword }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/admin/students error:', error)
    if (isPrismaUniqueConflict(error)) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}

// ==================== PUT ====================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      class: studentClass,
      medium,
      schoolName,
      address,
      personalPhone,
      guardian1Phone,
      guardian2Phone,
      batchId,
      fatherFirstName,
      fatherLastName,
      fatherOccupation,
      motherFirstName,
      motherLastName,
      motherOccupation,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id (User.id) is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        studentProfile: {
          update: {
            ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
            ...(studentClass !== undefined && { class: studentClass }),
            ...(medium !== undefined && { medium }),
            ...(schoolName !== undefined && { schoolName }),
            ...(address !== undefined && { address }),
            ...(personalPhone !== undefined && { personalPhone }),
            ...(guardian1Phone !== undefined && { guardian1Phone }),
            ...(guardian2Phone !== undefined && { guardian2Phone }),
            ...(batchId !== undefined && { batchId }),
            ...(fatherFirstName !== undefined && { fatherFirstName }),
            ...(fatherLastName !== undefined && { fatherLastName }),
            ...(fatherOccupation !== undefined && { fatherOccupation }),
            ...(motherFirstName !== undefined && { motherFirstName }),
            ...(motherLastName !== undefined && { motherLastName }),
            ...(motherOccupation !== undefined && { motherOccupation }),
          },
        },
      },
      include: {
        studentProfile: { include: { batch: true } },
      },
    })

    const { password: _pw, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, student: userWithoutPassword }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/admin/students error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// ==================== DELETE ====================

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Query parameter "id" (User.id) is required' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Student deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('DELETE /api/admin/students error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
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

function isPrismaUniqueConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
