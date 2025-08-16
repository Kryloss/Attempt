import { NextRequest, NextResponse } from 'next/server'
import { GmailEmailService } from '@/lib/gmail-service'
import { isMongoDBConfigured, isGmailConfigured, debugEnvironment } from '@/lib/config'
import dbConnect from '@/lib/mongodb'
import Email from '@/models/Email'

export async function POST(request: NextRequest) {
    try {
        const { emails, subject, html, text, emailType } = await request.json()

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: 'Emails array is required and must not be empty' },
                { status: 400 }
            )
        }

        // Validate all email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalidEmails = emails.filter(email => !emailRegex.test(email))

        if (invalidEmails.length > 0) {
            return NextResponse.json(
                { error: 'Invalid email format(s)', invalidEmails },
                { status: 400 }
            )
        }

        // Check if Gmail is configured
        if (!isGmailConfigured()) {
            console.error('Gmail not configured');
            return NextResponse.json(
                {
                    error: 'Gmail SMTP not configured',
                    message: 'Please check GMAIL_USER and GMAIL_APP_PASSWORD environment variables'
                },
                { status: 500 }
            )
        }

        const gmailService = new GmailEmailService()

        // Connect to MongoDB (only if configured)
        if (isMongoDBConfigured()) {
            try {
                await dbConnect()
            } catch (dbError) {
                console.error('Database connection failed:', dbError)
                // Continue without database logging if connection fails
            }
        }

        let emailSubject = subject || 'Bulk Email - Important Update';
        let emailHtml = html;
        let emailText = text;

        // If no custom content provided, use default bulk email
        if (!html && !text) {
            emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Important Update</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello!</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              This is a bulk email sent to all our registered users.
            </p>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              We have important updates and information to share with you.
            </p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
              Thank you for being part of our community!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
            <p>© 2024 Your Company. All rights reserved.</p>
          </div>
        </div>
      `;

            emailText = `
        Important Update
        
        Hello!
        
        This is a bulk email sent to all our registered users.
        We have important updates and information to share with you.
        
        Thank you for being part of our community!
        
        This is an automated message, please do not reply.
        © 2024 Your Company. All rights reserved.
      `;
        }

        // Send bulk email using Gmail SMTP
        const result = await gmailService.sendBulkEmail(emails, emailSubject, emailHtml, emailText);

        if (!result.success) {
            console.error('Gmail bulk email error:', result.error)

            // Store failed email records if database is available
            if (isMongoDBConfigured()) {
                try {
                    const failedRecords = emails.map(email => ({
                        email,
                        status: 'failed',
                        error: result.error || 'Bulk email failed',
                        service: 'gmail',
                        emailType: emailType || 'bulk',
                    }));

                    await Email.insertMany(failedRecords);
                } catch (dbError) {
                    console.error('Failed to store failed email records:', dbError)
                }
            }

            return NextResponse.json(
                { error: 'Failed to send bulk email', details: result.error },
                { status: 500 }
            )
        }

        // Store successful email records if database is available
        if (isMongoDBConfigured()) {
            try {
                const successRecords = emails.map(email => ({
                    email,
                    status: 'sent',
                    messageId: result.messageId,
                    service: 'gmail',
                    emailType: emailType || 'bulk',
                }));

                await Email.insertMany(successRecords);
            } catch (dbError) {
                console.error('Failed to store successful email records:', dbError)
            }
        }

        return NextResponse.json(
            {
                message: `Bulk email sent successfully to ${emails.length} recipients via Gmail SMTP`,
                data: result,
                service: 'gmail',
                recipientCount: emails.length
            },
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
