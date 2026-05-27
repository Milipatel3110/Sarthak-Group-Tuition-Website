import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const studentId = searchParams.get('studentId')

    if (type === 'structures') {
      // List all fee structures with their course
      const structures = await prisma.feeStructure.findMany({
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ success: true, structures }, { status: 200 })
    }

    if (type === 'payments') {
      if (!studentId) {
        return NextResponse.json(
          { error: 'Query parameter "studentId" is required when type=payments' },
          { status: 400 }
        )
      }

      const payments = await prisma.feePayment.findMany({
        where: { studentId },
        include: {
          student: { include: { user: true } },
          feeStructure: { include: { course: true } },
        },
        orderBy: { paymentDate: 'desc' },
      })

      return NextResponse.json({ success: true, payments }, { status: 200 })
    }

    // Default: return last 50 fee payments with full details
    const payments = await prisma.feePayment.findMany({
      include: {
        student: { include: { user: true } },
        feeStructure: { include: { course: true } },
      },
      orderBy: { paymentDate: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, payments }, { status: 200 })
  } catch (error) {
    console.error('GET /api/fees error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'structure') {
      const body = await request.json()
      const { courseId, amount, paymentFrequency, academicYear, lateFee, discount } = body

      if (!courseId || amount == null || !paymentFrequency || !academicYear) {
        return NextResponse.json(
          { error: 'courseId, amount, paymentFrequency, and academicYear are required' },
          { status: 400 }
        )
      }

      const structure = await prisma.feeStructure.create({
        data: {
          courseId,
          amount: Number(amount),
          paymentFrequency,
          academicYear,
          lateFee: lateFee != null ? Number(lateFee) : 0,
          discount: discount != null ? Number(discount) : 0,
        },
        include: { course: true },
      })

      return NextResponse.json(
        { success: true, structure },
        { status: 201 }
      )
    }

    if (type === 'payment') {
      const body = await request.json()
      const { studentId, feeStructureId, amountPaid, paymentMethod, transactionId } = body

      if (!studentId || !feeStructureId || amountPaid == null) {
        return NextResponse.json(
          { error: 'studentId, feeStructureId, and amountPaid are required' },
          { status: 400 }
        )
      }

      const payment = await prisma.feePayment.create({
        data: {
          studentId,
          feeStructureId,
          amountPaid: Number(amountPaid),
          paymentMethod: paymentMethod || null,
          transactionId: transactionId || null,
          status: 'COMPLETED',
        },
        include: {
          student: { include: { user: true } },
          feeStructure: { include: { course: true } },
        },
      })

      return NextResponse.json(
        { success: true, payment },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Query parameter "type" must be "structure" or "payment"' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('POST /api/fees error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2003'
    ) {
      return NextResponse.json(
        { error: 'Referenced record not found (invalid courseId, studentId, or feeStructureId)' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create fee record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: '"status" is required in the request body' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await prisma.feePayment.update({
      where: { id },
      data: { status },
      include: {
        student: { include: { user: true } },
        feeStructure: { include: { course: true } },
      },
    })

    return NextResponse.json({ success: true, payment: updated }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/fees error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Fee payment record not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update fee payment' },
      { status: 500 }
    )
  }
}
