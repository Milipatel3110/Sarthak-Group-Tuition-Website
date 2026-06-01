import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ==================== GET ====================
// ?id= — get single faculty with full profile; omit for full list

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { facultyProfile: true },
      })

      if (!user || user.role !== 'FACULTY') {
        return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
      }

      const { password: _pw, ...userWithoutPassword } = user
      return NextResponse.json({ success: true, faculty: userWithoutPassword })
    }

    // List all faculty
    const users = await prisma.user.findMany({
      where: { role: 'FACULTY' },
      include: { facultyProfile: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    const sanitized = users.map(({ password: _pw, ...rest }) => rest)
    return NextResponse.json({ success: true, faculty: sanitized })
  } catch (error) {
    console.error('GET /api/admin/faculty error:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

// ==================== PUT ====================
// Body: { id (User.id), firstName, lastName, phone, qualification, subjects (array), experienceYears, bio }

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, phone, qualification, subjects, experienceYears, bio } = body

    if (!id || !firstName || !lastName || !qualification || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: 'id, firstName, lastName, qualification, and subjects are required' },
        { status: 400 }
      )
    }

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        facultyProfile: {
          update: {
            qualification: qualification.trim(),
            subjects: JSON.stringify(subjects),
            experienceYears: Number(experienceYears) || 0,
            bio: bio?.trim() || null,
          },
        },
      },
      include: {
        facultyProfile: true,
      },
    })

    const { password: _pw, ...userWithoutPassword } = updatedUser as typeof updatedUser & { password: string }

    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/admin/faculty error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update faculty member' }, { status: 500 })
  }
}
