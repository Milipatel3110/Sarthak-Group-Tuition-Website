import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET course materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const fileType = searchParams.get('fileType')
    const facultyId = searchParams.get('facultyId')
    const search = searchParams.get('search')

    const where: Prisma.CourseMaterialWhereInput = {}
    if (courseId) where.courseId = courseId
    if (fileType) where.fileType = fileType
    if (facultyId) where.facultyId = facultyId
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    const materials = await prisma.courseMaterial.findMany({
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
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, materials })
  } catch (error) {
    console.error('Get materials error:', error)
    return NextResponse.json({ error: 'Error fetching materials' }, { status: 500 })
  }
}

// Upload course material (faculty only)
export async function POST(request: NextRequest) {
  try {
    const { title, description, courseId, facultyId, fileUrl, fileType } = await request.json()

    if (!title || !courseId || !facultyId || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: 'title, courseId, facultyId, fileUrl and fileType are required' },
        { status: 400 }
      )
    }

    const material = await prisma.courseMaterial.create({
      data: {
        title,
        description,
        courseId,
        facultyId,
        fileUrl,
        fileType
      }
    })

    return NextResponse.json({ success: true, material, message: 'Material uploaded' })
  } catch (error) {
    console.error('Upload material error:', error)
    return NextResponse.json({ error: 'Error uploading material' }, { status: 500 })
  }
}

// Delete material
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    await prisma.courseMaterial.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Material deleted' })
  } catch (error) {
    console.error('Delete material error:', error)
    return NextResponse.json({ error: 'Error deleting material' }, { status: 500 })
  }
}

