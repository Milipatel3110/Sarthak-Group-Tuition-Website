import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const facultyId = searchParams.get('facultyId')
    const isActive = searchParams.get('isActive')

    const where: Prisma.CourseWhereInput = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (facultyId) where.facultyId = facultyId
    if (isActive === 'true' || isActive === 'false') where.isActive = isActive === 'true'

    const courses = await prisma.course.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: 'Error fetching courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, subjects, targetClass, fee, duration, features, syllabus, isActive, imageUrl } = await request.json()

    if (!name || !description || !targetClass || !duration || fee === undefined) {
      return NextResponse.json({ error: 'Required course fields are missing' }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        subjects: JSON.stringify(subjects || []),
        targetClass,
        fee: parseFloat(fee),
        duration,
        features: JSON.stringify(features || []),
        syllabus,
        isActive: isActive ?? true,
        imageUrl,
      },
    })

    return NextResponse.json({ success: true, course, message: 'Course created successfully' })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json({ error: 'Error creating course' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const { name, description, subjects, targetClass, fee, duration, features, syllabus, isActive, imageUrl, facultyId } = await request.json()

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        description,
        subjects: JSON.stringify(subjects || []),
        targetClass,
        fee: parseFloat(fee),
        duration,
        features: JSON.stringify(features || []),
        syllabus,
        isActive: isActive ?? true,
        imageUrl,
        facultyId: facultyId === '' ? null : facultyId,
      },
    })

    return NextResponse.json({ success: true, course, message: 'Course updated successfully' })
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({ error: 'Error updating course' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Error deleting course' }, { status: 500 })
  }
}

