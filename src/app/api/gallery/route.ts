import { NextRequest, NextResponse } from 'next/server'
import { Prisma, GalleryCategory } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Prisma.GalleryImageWhereInput = {}
    if (category && category !== 'all') {
      if (!Object.values(GalleryCategory).includes(category as GalleryCategory)) {
        return NextResponse.json({ error: 'Invalid category filter' }, { status: 400 })
      }
      where.category = category as GalleryCategory
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ]
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

    if (!title || !category || !imageUrl) {
      return NextResponse.json({ error: 'Title, category and image URL are required' }, { status: 400 })
    }

    if (!Object.values(GalleryCategory).includes(category)) {
      return NextResponse.json({ error: 'Invalid gallery category' }, { status: 400 })
    }

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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const { title, category, imageUrl, description, date } = await request.json()

    if (category && !Object.values(GalleryCategory).includes(category)) {
      return NextResponse.json({ error: 'Invalid gallery category' }, { status: 400 })
    }

    const galleryItem = await prisma.galleryImage.update({
      where: { id },
      data: {
        title,
        category,
        imageUrl,
        description,
        date: date ? new Date(date) : undefined,
      },
    })

    return NextResponse.json({ success: true, galleryItem, message: 'Gallery image updated' })
  } catch (error) {
    console.error('Update gallery error:', error)
    return NextResponse.json({ error: 'Error updating gallery' }, { status: 500 })
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
    return NextResponse.json({ success: true, message: 'Gallery image deleted' })
  } catch (error) {
    console.error('Delete gallery error:', error)
    return NextResponse.json({ error: 'Error deleting gallery image' }, { status: 500 })
  }
}

