import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ==================== POST ====================

export async function POST(request: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name'
    ) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('files') as File | null
    const examId = formData.get('examId') as string | null
    const facultyId = formData.get('facultyId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!examId) {
      return NextResponse.json({ error: 'examId is required' }, { status: 400 })
    }
    if (!facultyId) {
      return NextResponse.json({ error: 'facultyId is required' }, { status: 400 })
    }

    // Convert file to base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'sarthak-exams',
      resource_type: 'auto',
    })

    // Save ExamPaper record
    const paper = await prisma.examPaper.create({
      data: {
        examId,
        facultyId,
        fileUrl: uploadResult.secure_url,
        fileName: file.name,
      },
      include: {
        faculty: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    })

    return NextResponse.json({ success: true, paper }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/admin/exams/paper error:', error)

    if (error?.http_code === 401 || error?.message?.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are invalid. Please check your API key and secret.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to upload exam paper' },
      { status: 500 }
    )
  }
}

// ==================== GET ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')

    if (!examId) {
      return NextResponse.json({ error: 'Query parameter "examId" is required' }, { status: 400 })
    }

    const papers = await prisma.examPaper.findMany({
      where: { examId },
      include: {
        faculty: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, papers })
  } catch (error) {
    console.error('GET /api/admin/exams/paper error:', error)
    return NextResponse.json({ error: 'Failed to fetch exam papers' }, { status: 500 })
  }
}
