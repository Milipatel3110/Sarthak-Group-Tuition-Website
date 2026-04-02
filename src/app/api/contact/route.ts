import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, getContactConfirmationEmail, getAdminNotificationEmail } from '@/lib/email'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: String(name),
        email: String(email).toLowerCase(),
        phone: phone ? String(phone) : null,
        message: String(message),
      },
    })

    // Send confirmation email to the user (best effort)
    const confirmationEmail = getContactConfirmationEmail({
      name,
      email,
      phone: phone || 'Not provided',
      message,
      inquiryType: inquiryType || 'General Inquiry'
    })

    const userMailResult = await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    })

    // Send notification to admin (best effort)
    const adminEmail = getAdminNotificationEmail('contact', {
      name,
      email,
      phone,
      message,
      course,
      inquiryType: inquiryType || 'General Inquiry',
      timestamp: new Date().toISOString(),
      messageId: contactMessage.id,
    })

    const adminMailResult = await sendEmail({
      to: 'miliapatel3110@gmail.com',
      subject: adminEmail.subject,
      html: adminEmail.html
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        contactMessage,
        mail: {
          userConfirmationSent: Boolean(userMailResult.success),
          adminNotificationSent: Boolean(adminMailResult.success),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: Prisma.ContactMessageWhereInput = {}

    if (status === 'resolved') {
      where.isResolved = true
    } else if (status === 'unresolved') {
      where.isResolved = false
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { message: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error('Get contact messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { isResolved } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    if (typeof isResolved !== 'boolean') {
      return NextResponse.json({ error: 'isResolved must be boolean' }, { status: 400 })
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isResolved },
    })

    return NextResponse.json({ success: true, message, info: 'Message status updated' })
  } catch (error) {
    console.error('Update contact message error:', error)
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 })
  }
}

