import { NextResponse } from 'next/server'
import { sendEmail, getEnrollmentConfirmationEmail, getAdminNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { studentName, parentName, email, phone, class: studentClass, medium, course } = data

    // Validate required fields
    if (!studentName || !parentName || !email || !studentClass) {
      return NextResponse.json(
        { error: 'Please fill all required fields' },
        { status: 400 }
      )
    }

    // Send confirmation email to the user
    const confirmationEmail = getEnrollmentConfirmationEmail({
      studentName,
      parentName,
      email,
      phone: phone || 'Not provided',
      course: course || 'Not specified',
      studentClass,
      medium: medium || 'Not specified'
    })
    
    await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    })

    // Send notification to admin
    const adminEmail = getAdminNotificationEmail('enrollment', {
      studentName,
      parentName,
      email,
      phone,
      course,
      studentClass,
      medium,
      timestamp: new Date().toISOString()
    })
    
    await sendEmail({
      to: 'miliapatel3110@gmail.com',
      subject: adminEmail.subject,
      html: adminEmail.html
    })

    return NextResponse.json(
      { success: true, message: 'Enrollment submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to submit enrollment' },
      { status: 500 }
    )
  }
}

