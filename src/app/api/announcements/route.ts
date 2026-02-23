import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetRole = searchParams.get('targetRole')
    const facultyId = searchParams.get('facultyId')
    const search = searchParams.get('search')

    const andFilters: Prisma.AnnouncementWhereInput[] = []

    if (targetRole && targetRole !== 'all') {
      andFilters.push({ OR: [{ targetRole }, { targetRole: 'all' }] })
    }

    if (facultyId) andFilters.push({ facultyId })

    if (search && search.trim()) {
      andFilters.push({
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { content: { contains: search.trim(), mode: 'insensitive' } },
        ],
      })
    }

    const where: Prisma.AnnouncementWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {}

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
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
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: 'Error fetching announcements' }, { status: 500 })
  }
}

// Create announcement (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { title, content, facultyId, targetRole, isPinned } = await request.json()

    if (!title || !content || !facultyId) {
      return NextResponse.json(
        { error: 'title, content and facultyId are required' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        facultyId,
        targetRole: targetRole || 'all',
        isPinned: isPinned || false
      }
    })

    return NextResponse.json({ success: true, announcement, message: 'Announcement posted' })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Error creating announcement' }, { status: 500 })
  }
}

// Update announcement
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    const { title, content, targetRole, isPinned } = await request.json()

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        targetRole,
        isPinned,
      },
    })

    return NextResponse.json({ success: true, announcement, message: 'Announcement updated' })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: 'Error updating announcement' }, { status: 500 })
  }
}

// Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    await prisma.announcement.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'Error deleting announcement' }, { status: 500 })
  }
}

