import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const enrollments = await prisma.enrollment.findMany({
      where: status && status !== 'ALL' ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
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

    if (!studentName || !email) {
      return NextResponse.json({ error: 'Student name and email are required' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentName,
        parentName: parentName || '',
        email,
        phone: phone || '',
        class: studentClass || '',
        medium: medium || '',
        course: course || '',
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, enrollment, message: 'Inquiry submitted successfully' })
  } catch (error) {
    console.error('Create enrollment error:', error)
    return NextResponse.json({ error: 'Error submitting inquiry' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    const { status, comments } = await request.json()

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(comments !== undefined && { comments }),
      },
    })

    return NextResponse.json({ success: true, enrollment, message: 'Inquiry updated' })
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json({ error: 'Error updating inquiry' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.enrollment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete enrollment error:', error)
    return NextResponse.json({ error: 'Error deleting inquiry' }, { status: 500 })
  }
}
