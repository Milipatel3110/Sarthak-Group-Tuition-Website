import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: [{ standard: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { students: true } },
      },
    })

    return NextResponse.json({ success: true, batches }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/batches error:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, standard, medium, description } = body

    if (!name || !standard || !medium) {
      return NextResponse.json(
        { error: 'name, standard, and medium are required' },
        { status: 400 }
      )
    }

    const batch = await prisma.batch.create({
      data: { name, standard, medium, description: description ?? null },
      include: { _count: { select: { students: true } } },
    })

    return NextResponse.json({ success: true, batch }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/batches error:', error)
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, standard, medium, description, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(standard !== undefined && { standard }),
        ...(medium !== undefined && { medium }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { students: true } } },
    })

    return NextResponse.json({ success: true, batch }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/admin/batches error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Query parameter "id" is required' }, { status: 400 })
    }

    // Check if batch has any students
    const studentCount = await prisma.studentProfile.count({ where: { batchId: id } })
    if (studentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete batch: ${studentCount} student(s) are still assigned to it` },
        { status: 400 }
      )
    }

    await prisma.batch.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Batch deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('DELETE /api/admin/batches error:', error)
    if (isPrismaNotFound(error)) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 })
  }
}

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  )
}
