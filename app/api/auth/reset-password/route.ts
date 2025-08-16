import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PasswordReset from '@/models/PasswordReset';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { email, code, newPassword } = await request.json();

        // Validation
        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: 'Email, verification code, and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Find the password reset record
        const passwordReset = await PasswordReset.findOne({
            email: email.toLowerCase(),
            code,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!passwordReset) {
            return NextResponse.json(
                { error: 'Invalid or expired verification code' },
                { status: 400 }
            );
        }

        // Find the user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user's password
        user.password = newPassword;
        await user.save();

        // Mark the verification code as used
        passwordReset.used = true;
        await passwordReset.save();

        return NextResponse.json(
            { message: 'Password reset successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 }
        );
    }
}
