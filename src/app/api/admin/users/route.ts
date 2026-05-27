import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role')
    const search = searchParams.get('search')

    const where: {
      role?: Role
      OR?: Array<{
        firstName?: { contains: string }
        lastName?: { contains: string }
        email?: { contains: string }
      }>
    } = {}

    if (roleParam) {
      const validRoles: Role[] = ['STUDENT', 'FACULTY', 'PARENT', 'ADMIN']
      if (!validRoles.includes(roleParam as Role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        )
      }
      where.role = roleParam as Role
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const usersWithoutPassword = users.map(({ password: _pw, ...rest }) => rest)

    return NextResponse.json({ success: true, users: usersWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: '"isActive" must be a boolean' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    })

    const { password: _pw, ...userWithoutPassword } = updated

    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/admin/users error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('DELETE /api/admin/users error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
