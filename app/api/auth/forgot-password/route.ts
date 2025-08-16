import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PasswordReset from '@/models/PasswordReset';
import User from '@/models/User';
import { GmailEmailService } from '@/lib/gmail-service';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { email } = await request.json();

        // Validation
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json(
                { message: 'If an account with this email exists, a verification code has been sent.' },
                { status: 200 }
            );
        }

        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration time (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Delete any existing reset tokens for this email
        await PasswordReset.deleteMany({ email: email.toLowerCase() });

        // Create new password reset record
        const passwordReset = new PasswordReset({
            email: email.toLowerCase(),
            code,
            expiresAt,
        });

        await passwordReset.save();

        // Send verification code via email
        const emailService = new GmailEmailService();
        const emailResult = await emailService.sendVerificationCodeEmail(
            email.toLowerCase(),
            code
        );

        if (!emailResult.success) {
            // Delete the password reset record if email failed
            await PasswordReset.deleteOne({ email: email.toLowerCase() });
            throw new Error('Failed to send verification code');
        }

        return NextResponse.json(
            { message: 'Verification code sent successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to send verification code. Please try again.' },
            { status: 500 }
        );
    }
}
