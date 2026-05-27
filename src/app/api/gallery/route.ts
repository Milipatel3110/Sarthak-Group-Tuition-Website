import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }

    const gallery = await prisma.galleryImage.findMany({
      where,
      orderBy: { date: 'desc' },
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

    if (!title || !category || !imageUrl) {
      return NextResponse.json({ error: 'title, category, and imageUrl are required' }, { status: 400 })
    }

    const galleryItem = await prisma.galleryImage.create({
      data: {
        title,
        category: category.toUpperCase(),
        imageUrl,
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json({ success: true, galleryItem, message: 'Gallery image added' })
  } catch (error) {
    console.error('Create gallery error:', error)
    return NextResponse.json({ error: 'Error creating gallery item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    await prisma.galleryImage.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Image deleted' })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    console.error('Delete gallery error:', error)
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 })
  }
}
