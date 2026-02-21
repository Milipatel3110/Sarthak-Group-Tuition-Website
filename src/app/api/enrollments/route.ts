import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, enrollments })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json({ error: 'Error fetching enrollments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentName, parentName, email, phone, class: studentClass, medium, course } = await request.json()

    const enrollment = await prisma.enrollment.create({
      data: {
        studentName,
        parentName,
        email,
        phone,
        class: studentClass,
        medium,
        course,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, enrollment, message: 'Enrollment submitted successfully' })
  } catch (error) {
    console.error('Create enrollment error:', error)
    return NextResponse.json({ error: 'Error creating enrollment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    const { status } = await request.json()

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, enrollment, message: 'Enrollment status updated' })
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json({ error: 'Error updating enrollment' }, { status: 500 })
  }
}

