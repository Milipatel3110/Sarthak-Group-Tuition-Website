import nodemailer from 'nodemailer'

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'miliapatel3110@gmail.com',
    pass: process.env.EMAIL_PASS || '', // App password will be set in environment
  },
})

// Email configuration
const FROM_EMAIL = 'Sarthak Group Tuition <miliapatel3110@gmail.com>'
const ADMIN_EMAIL = 'miliapatel3110@gmail.com'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log('Email sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Email Templates
export function getContactConfirmationEmail(data: {
  name: string
  email: string
  phone: string
  message: string
  inquiryType: string
}) {
  return {
    subject: 'Thank you for contacting Sarthak Group Tuition!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Sarthak Group Tuition</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e3a8a;">Thank You for Contacting Us!</h2>
          
          <p>Dear <strong>${data.name}</strong>,</p>
          
          <p>We have received your inquiry and would like to thank you for your interest in Sarthak Group Tuition.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Your Inquiry Details:</h3>
            <p><strong>Type:</strong> ${data.inquiryType}</p>
            <p><strong>Message:</strong> ${data.message}</p>
          </div>
          
          <p>Our team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>Need urgent assistance?</strong></p>
            <p style="margin: 5px 0 0 0;">Call us at: +91 9328705157</p>
            <p style="margin: 5px 0 0 0;">Alternate: +91 7984433287</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>Sarthak Group Tuition</strong><br>
            Excellence in Education
          </p>
        </div>
      </body>
      </html>
    `,
  }
}

export function getAppointmentConfirmationEmail(data: {
  parentName: string
  studentName: string
  email: string
  phone: string
  reason: string
  date: string
  time: string
}) {
  return {
    subject: 'Appointment Confirmed - Sarthak Group Tuition',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Appointment Confirmed!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #059669;">Your Visit to Sarthak Group Tuition</h2>
          
          <p>Dear <strong>${data.parentName}</strong>,</p>
          
          <p>Your appointment has been successfully scheduled. We look forward to meeting you!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Student Name:</strong> ${data.studentName}</p>
            <p><strong>Purpose:</strong> ${data.reason}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important Notes:</strong></p>
            <ul style="margin: 10px 0 0 0;">
              <li>Please arrive 10 minutes before your scheduled time</li>
              <li>Carry a valid ID proof</li>
              <li>Bring your child's previous marksheets (if applicable)</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Location</h3>
            <p><strong>Sarthak Group Tuition</strong><br>
            12, Janakpuri Society,<br>
            Nigam Smruti Mandir Road,<br>
            Ghodasar, Ahmedabad, Gujarat 380050</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Need to reschedule?<br>
            Call us at: +91 9328705157<br>
            Email: arpanmpatel31@gmail.com
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>Sarthak Group Tuition</strong><br>
            Excellence in Education
          </p>
        </div>
      </body>
      </html>
    `,
  }
}

export function getEnrollmentConfirmationEmail(data: {
  studentName: string
  parentName: string
  email: string
  phone: string
  course: string
  studentClass: string
  medium: string
}) {
  return {
    subject: 'Enrollment Application Received - Sarthak Group Tuition',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Enrollment Application Received!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #7c3aed;">Welcome to Sarthak Group Tuition!</h2>
          
          <p>Dear <strong>${data.parentName}</strong>,</p>
          
          <p>We have received your enrollment application for your child <strong>${data.studentName}</strong>. Thank you for choosing Sarthak Group Tuition!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Application Details:</h3>
            <p><strong>Student Name:</strong> ${data.studentName}</p>
            <p><strong>Class:</strong> Class ${data.studentClass}</p>
            <p><strong>Medium:</strong> ${data.medium}</p>
            <p><strong>Course:</strong> ${data.course}</p>
            <p><strong>Parent Name:</strong> ${data.parentName}</p>
            <p><strong>Contact:</strong> ${data.phone}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>📋 Next Steps:</strong></p>
            <ol style="margin: 10px 0 0 0;">
              <li>Visit our center with required documents</li>
              <li>Complete the fee payment</li>
              <li>Get student ID and access credentials</li>
              <li>Start attending classes</li>
            </ol>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Required Documents</h3>
            <ul>
              <li>Student's passport size photo</li>
              <li>Copy of birth certificate</li>
              <li>Previous school marksheets</li>
              <li>Parent ID proof</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>📍 Location</strong></p>
            <p style="margin: 5px 0 0 0;">12, Janakpuri Society, Nigam Smruti Mandir Road, Ghodasar, Ahmedabad, Gujarat 380050</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Questions?<br>
            Call us at: +91 9328705157 / +91 7984433287<br>
            Email: arpanmpatel31@gmail.com
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>Sarthak Group Tuition</strong><br>
            Excellence in Education
          </p>
        </div>
      </body>
      </html>
    `,
  }
}

export function getAdminNotificationEmail(type: 'contact' | 'appointment' | 'enrollment', data: any) {
  const subjects = {
    contact: 'New Contact Inquiry',
    appointment: 'New Appointment Booked',
    enrollment: 'New Enrollment Application',
  }

  return {
    subject: `${subjects[type]} - Sarthak Group Tuition`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New ${type} Notification</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
      </html>
    `,
  }
}

