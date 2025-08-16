import { NextRequest, NextResponse } from 'next/server'
import { GmailEmailService } from '@/lib/gmail-service'
import { isGmailConfigured, debugEnvironment } from '@/lib/config'

export async function GET(request: NextRequest) {
    try {
        // Debug environment variables
        const envDebug = debugEnvironment();
        console.log('Environment debug info:', envDebug);

        // Check if Gmail is configured
        if (!isGmailConfigured()) {
            return NextResponse.json(
                {
                    error: 'Gmail SMTP not configured',
                    debug: envDebug,
                    message: 'Please check GMAIL_USER and GMAIL_APP_PASSWORD environment variables',
                    setupInstructions: [
                        '1. Go to your Google Account settings',
                        '2. Enable 2-Factor Authentication',
                        '3. Generate an "App Password" for your application',
                        '4. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables'
                    ]
                },
                { status: 500 }
            )
        }

        // Test Gmail connection
        const gmailService = new GmailEmailService()

        // Try to send a test email to yourself
        const testResult = await gmailService.sendEmail(
            process.env.GMAIL_USER!,
            'Gmail SMTP Test - Connection Successful',
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Gmail SMTP Test Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Connection Test Passed</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Your Gmail SMTP configuration is working correctly!
            </p>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              You can now send emails to different accounts using Gmail SMTP.
            </p>
            <ul style="color: #666; line-height: 1.6; font-size: 16px;">
              <li>✅ Single email sending</li>
              <li>✅ Bulk email sending</li>
              <li>✅ Account verification emails</li>
              <li>✅ Password reset emails</li>
              <li>✅ Welcome emails</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>This is a test email to verify Gmail SMTP configuration.</p>
            <p>© 2024 Your Company. All rights reserved.</p>
          </div>
        </div>
      `,
            `
        Gmail SMTP Test Successful!
        
        Connection Test Passed
        
        Your Gmail SMTP configuration is working correctly!
        You can now send emails to different accounts using Gmail SMTP.
        
        Features available:
        - Single email sending
        - Bulk email sending
        - Account verification emails
        - Password reset emails
        - Welcome emails
        
        This is a test email to verify Gmail SMTP configuration.
        © 2024 Your Company. All rights reserved.
      `
        );

        if (!testResult.success) {
            return NextResponse.json(
                {
                    error: 'Gmail SMTP test failed',
                    details: testResult.error,
                    debug: envDebug
                },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                message: 'Gmail SMTP test successful!',
                data: testResult,
                service: 'gmail',
                features: [
                    'Single email sending',
                    'Bulk email sending',
                    'Account verification emails',
                    'Password reset emails',
                    'Welcome emails'
                ],
                debug: envDebug
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Test API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
