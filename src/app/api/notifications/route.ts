import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ==================== GET ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Query parameter "userId" is required' }, { status: 400 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        exam: { select: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// ==================== PUT ====================
// Body: { id } — mark single notification as read
// Body: { userId } — mark all notifications for user as read

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId } = body

    if (!id && !userId) {
      return NextResponse.json(
        { error: 'Either "id" or "userId" is required' },
        { status: 400 }
      )
    }

    if (id) {
      // Mark single notification as read
      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true, notification })
    }

    // Mark all notifications for user as read
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} notification(s) marked as read`,
    })
  } catch (error) {
    console.error('PUT /api/notifications error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
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
