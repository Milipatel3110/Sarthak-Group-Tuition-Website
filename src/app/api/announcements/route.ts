import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetRole = searchParams.get('targetRole')
    const facultyId = searchParams.get('facultyId')

    const where: any = {}

    if (targetRole && targetRole !== 'all') {
      where.targetRole = targetRole
    }

    if (facultyId) where.facultyId = facultyId

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        faculty: { include: { user: true } }
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

