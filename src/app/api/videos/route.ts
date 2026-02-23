import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all video lectures or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const facultyId = searchParams.get('facultyId')
    const published = searchParams.get('published')

    const where: any = {}

    if (courseId) where.courseId = courseId
    if (facultyId) where.facultyId = facultyId
    if (published !== null) where.isPublished = published === 'true'

    const videos = await prisma.videoLecture.findMany({
      where,
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, videos })
  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json({ error: 'Error fetching videos' }, { status: 500 })
  }
}

// Create a new video lecture (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { title, description, courseId, facultyId, videoUrl, thumbnailUrl, duration, chapter, topic } = await request.json()

    const video = await prisma.videoLecture.create({
      data: {
        title,
        description,
        courseId,
        facultyId,
        videoUrl,
        thumbnailUrl,
        duration,
        chapter,
        topic,
        isPublished: false
      }
    })

    return NextResponse.json({ success: true, video, message: 'Video lecture uploaded' })
  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json({ error: 'Error creating video' }, { status: 500 })
  }
}

// Update video (publish/unpublish)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const { isPublished } = await request.json()

    const video = await prisma.videoLecture.update({
      where: { id },
      data: { isPublished }
    })

    return NextResponse.json({ success: true, video, message: 'Video updated' })
  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json({ error: 'Error updating video' }, { status: 500 })
  }
}

