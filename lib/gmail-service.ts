import nodemailer from 'nodemailer';

export class GmailEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    // Send email to single recipient
    async sendEmail(to: string, subject: string, html: string, text: string) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to,
                subject,
                html,
                text,
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // Send email to multiple recipients
    async sendBulkEmail(recipients: string[], subject: string, html: string, text: string) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: recipients.join(', '),
                subject,
                html,
                text,
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Bulk email sending failed:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // Send verification email (for future account system)
    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${token}`;

        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Account</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Welcome!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Please click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #007bff;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    `;

        const text = `
      Verify Your Account
      
      Welcome! Please click the link below to verify your email address and activate your account:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      © 2024 Your Company. All rights reserved.
    `;

        return this.sendEmail(email, 'Verify Your Account', html, text);
    }

    // Send password reset email (for future account system)
    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You requested to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you didn't request this reset, please ignore this email.<br>
            If the button doesn't work, copy and paste this link:<br>
            <a href="${resetUrl}" style="color: #dc3545;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    `;

        const text = `
      Reset Your Password
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      If you didn't request this reset, please ignore this email.
      This reset link will expire in 1 hour.
      
      © 2024 Your Company. All rights reserved.
    `;

        return this.sendEmail(email, 'Reset Your Password', html, text);
    }

    // Send welcome email (for future account system)
    async sendWelcomeEmail(email: string, username: string) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Platform!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${username}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for joining us! Your account has been successfully created and verified.
          </p>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You can now log in to your account and start using all our features.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Log In Now
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>If you have any questions, please contact our support team.</p>
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    `;

        const text = `
      Welcome to Our Platform!
      
      Hello ${username}!
      
      Thank you for joining us! Your account has been successfully created and verified.
      You can now log in to your account and start using all our features.
      
      Log in at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login
      
      If you have any questions, please contact our support team.
      
      © 2024 Your Company. All rights reserved.
    `;

        return this.sendEmail(email, 'Welcome to Our Platform!', html, text);
    }
}
