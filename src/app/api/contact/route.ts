import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getContactConfirmationEmail, getAdminNotificationEmail } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resolvedParam = searchParams.get('resolved')

    const where: { isResolved?: boolean } = {}
    if (resolvedParam === 'true') {
      where.isResolved = true
    } else if (resolvedParam === 'false') {
      where.isResolved = false
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, messages }, { status: 200 })
  } catch (error) {
    console.error('GET /api/contact error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { name, email, phone, message, course, inquiryType } = data

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Save to database first
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || '',
        message,
        isResolved: false,
      },
    })

    // Attempt to send emails — failures should not prevent a successful response
    // if the DB record was already saved.
    let emailError: unknown = null

    try {
      // Send confirmation email to the user
      const confirmationEmail = getContactConfirmationEmail({
        name,
        email,
        phone: phone || 'Not provided',
        message,
        inquiryType: inquiryType || 'General Inquiry',
      })

      await sendEmail({
        to: email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      })

      // Send notification to admin
      const adminEmail = getAdminNotificationEmail('contact', {
        name,
        email,
        phone,
        message,
        course,
        inquiryType: inquiryType || 'General Inquiry',
        timestamp: new Date().toISOString(),
      })

      await sendEmail({
        to: 'miliapatel3110@gmail.com',
        subject: adminEmail.subject,
        html: adminEmail.html,
      })
    } catch (err) {
      emailError = err
      console.error('Email sending failed (DB record was saved):', err)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        id: contactMessage.id,
        ...(emailError ? { emailWarning: 'Message saved but email notification failed' } : {}),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
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
    const { isResolved } = body

    if (typeof isResolved !== 'boolean') {
      return NextResponse.json(
        { error: '"isResolved" must be a boolean' },
        { status: 400 }
      )
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isResolved },
    })

    return NextResponse.json({ success: true, message: updated }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/contact error:', error)
    // Prisma throws P2025 when the record is not found
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update contact message' },
      { status: 500 }
    )
  }
}
