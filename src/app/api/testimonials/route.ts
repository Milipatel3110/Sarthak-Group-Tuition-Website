import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, testimonials })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json({ error: 'Error fetching testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentName, parentName, class: studentClass, rating, message, photoUrl } = await request.json()

    const testimonial = await prisma.testimonial.create({
      data: {
        studentName,
        parentName,
        class: studentClass,
        rating,
        message,
        photoUrl,
        isApproved: false, // Requires admin approval
      },
    })

    return NextResponse.json({ success: true, testimonial, message: 'Testimonial submitted for approval' })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: 'Error creating testimonial' }, { status: 500 })
  }
}

