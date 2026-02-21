import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const courses = await prisma.course.findMany({ where, orderBy: { createdAt: 'desc' } })

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: 'Error fetching courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, subjects, targetClass, fee, duration, features, syllabus, isActive, imageUrl } = await request.json()

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

    const { name, description, subjects, targetClass, fee, duration, features, syllabus, isActive, imageUrl } = await request.json()

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

