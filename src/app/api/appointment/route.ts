import { NextResponse } from 'next/server'
import { sendEmail, getAppointmentConfirmationEmail, getAdminNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { parentName, studentName, email, phone, studentClass, reason, preferredDate, preferredTime, message } = data

    // Validate required fields
    if (!parentName || !studentName || !email || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Please fill all required fields' },
        { status: 400 }
      )
    }

    // Send confirmation email to the user
    const confirmationEmail = getAppointmentConfirmationEmail({
      parentName,
      studentName,
      email,
      phone: phone || 'Not provided',
      reason: reason || 'General Inquiry',
      date: preferredDate,
      time: preferredTime
    })
    
    await sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    })

    // Send notification to admin
    const adminEmail = getAdminNotificationEmail('appointment', {
      parentName,
      studentName,
      email,
      phone,
      studentClass,
      reason,
      preferredDate,
      preferredTime,
      message,
      timestamp: new Date().toISOString()
    })
    
    await sendEmail({
      to: 'miliapatel3110@gmail.com',
      subject: adminEmail.subject,
      html: adminEmail.html
    })

    return NextResponse.json(
      { success: true, message: 'Appointment booked successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Appointment booking error:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

