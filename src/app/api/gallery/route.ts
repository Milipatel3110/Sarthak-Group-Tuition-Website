import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    const gallery = await prisma.galleryImage.findMany({
      where,
      orderBy: { date: 'desc' }
    })
    return NextResponse.json({ success: true, gallery })
  } catch (error) {
    console.error('Get gallery error:', error)
    return NextResponse.json({ error: 'Error fetching gallery' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, category, imageUrl, description, date } = await request.json()

    const galleryItem = await prisma.galleryImage.create({
      data: {
        title,
        category,
        imageUrl,
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json({ success: true, galleryItem, message: 'Gallery image added' })
  } catch (error) {
    console.error('Create gallery error:', error)
    return NextResponse.json({ error: 'Error creating gallery' }, { status: 500 })
  }
}

