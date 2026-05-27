import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const VALID_CATEGORIES = ['BUILDING', 'CLASSROOM', 'EVENTS', 'TRIPS', 'PARTIES'] as const
type GalleryCategory = typeof VALID_CATEGORIES[number]

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary is configured
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
    const files = formData.getAll('files') as File[]
    const title = (formData.get('title') as string) || ''
    const description = (formData.get('description') as string) || ''
    const category = (formData.get('category') as string)?.toUpperCase() as GalleryCategory
    const dateStr = formData.get('date') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const uploaded: Awaited<ReturnType<typeof prisma.galleryImage.create>>[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('image/')) {
        continue
      }

      // Convert file to base64 data URI for Cloudinary upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: `sarthak-gallery/${category.toLowerCase()}`,
        resource_type: 'image',
        // Auto quality and format for optimization
        quality: 'auto',
        fetch_format: 'auto',
      })

      // Derive title: use provided title (append index if multiple), else use filename
      const fileBaseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const imageTitle = files.length > 1
        ? (title ? `${title} ${i + 1}` : fileBaseName)
        : (title || fileBaseName)

      // Save to database
      const galleryItem = await prisma.galleryImage.create({
        data: {
          title: imageTitle,
          category,
          imageUrl: uploadResult.secure_url,
          description: description || null,
          date: dateStr ? new Date(dateStr) : new Date(),
        },
      })

      uploaded.push(galleryItem)
    }

    if (uploaded.length === 0) {
      return NextResponse.json({ error: 'No valid image files were uploaded' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      uploaded,
      count: uploaded.length,
      message: `${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded successfully`,
    })
  } catch (error: any) {
    console.error('Gallery upload error:', error)

    // Cloudinary auth errors
    if (error?.http_code === 401 || error?.message?.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are invalid. Please check your API key and secret.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
