import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalEnrollments,
      pendingEnrollments,
      activeStudents,
      totalCourses,
      unresolvedMessages,
      totalAnnouncements,
      recentEnrollments,
      recentMessages,
    ] = await Promise.all([
      // Total enrollment requests
      prisma.enrollment.count(),

      // Pending enrollment requests
      prisma.enrollment.count({
        where: { status: 'PENDING' },
      }),

      // Active students (User with role=STUDENT and isActive=true)
      prisma.user.count({
        where: { role: 'STUDENT', isActive: true },
      }),

      // Active courses
      prisma.course.count({
        where: { isActive: true },
      }),

      // Unresolved contact messages
      prisma.contactMessage.count({
        where: { isResolved: false },
      }),

      // Total announcements
      prisma.announcement.count(),

      // Last 5 enrollment requests
      prisma.enrollment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Last 5 contact messages
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalEnrollments,
          pendingEnrollments,
          activeStudents,
          totalCourses,
          unresolvedMessages,
          totalAnnouncements,
        },
        recentEnrollments,
        recentMessages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
