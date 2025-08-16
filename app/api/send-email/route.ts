import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isMongoDBConfigured, isResendConfigured } from '@/lib/config'
import dbConnect from '@/lib/mongodb'
import Email from '@/models/Email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if required environment variables are set
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Connect to MongoDB (only if configured)
    let emailRecord = null;
    if (isMongoDBConfigured()) {
      try {
        await dbConnect()
      } catch (dbError) {
        console.error('Database connection failed:', dbError)
        // Continue without database logging if connection fails
      }
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `noreply@${process.env.RESEND_DOMAIN}`,
      to: [email],
      subject: 'Email Confirmation - Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Confirmation</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello!</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for signing up! This email confirms that we've received your request.
            </p>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Your email address <strong>${email}</strong> has been successfully registered in our system.
            </p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
              If you didn't request this confirmation, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
            <p>© 2024 Your Company. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Email Confirmation
        
        Hello!
        
        Thank you for signing up! This email confirms that we've received your request.
        Your email address ${email} has been successfully registered in our system.
        
        If you didn't request this confirmation, please ignore this email.
        
        This is an automated message, please do not reply.
        © 2024 Your Company. All rights reserved.
      `,
    })

    if (error) {
      console.error('Resend error:', error)

      // Store failed email record if database is available
      if (isMongoDBConfigured() && emailRecord === null) {
        try {
          await Email.create({
            email,
            status: 'failed',
            error: error.message || 'Unknown error',
          })
        } catch (dbError) {
          console.error('Failed to store email record:', dbError)
        }
      }

      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Store successful email record if database is available
    if (isMongoDBConfigured() && emailRecord === null) {
      try {
        await Email.create({
          email,
          status: 'sent',
          resendId: data?.id,
        })
      } catch (dbError) {
        console.error('Failed to store email record:', dbError)
      }
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
