import { NextResponse } from 'next/server'
import { sendEmail, getContactConfirmationEmail, getAdminNotificationEmail } from '@/lib/email'

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

    // Send confirmation email to the user
    const confirmationEmail = getContactConfirmationEmail({
      name,
      email,
      phone: phone || 'Not provided',
      message,
      inquiryType: inquiryType || 'General Inquiry'
    })
    
    await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    })

    // Send notification to admin
    const adminEmail = getAdminNotificationEmail('contact', {
      name,
      email,
      phone,
      message,
      course,
      inquiryType: inquiryType || 'General Inquiry',
      timestamp: new Date().toISOString()
    })
    
    await sendEmail({
      to: 'miliapatel3110@gmail.com',
      subject: adminEmail.subject,
      html: adminEmail.html
    })

    return NextResponse.json(
      { success: true, message: 'Inquiry submitted successfully' },
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

