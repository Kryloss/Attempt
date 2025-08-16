import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db-utils';
import { debugEnvironment } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        // Debug environment variables (remove in production)
        console.log('Environment debug:', debugEnvironment());

        const { emailOrUsername, password } = await request.json();

        // Validation
        if (!emailOrUsername || !password) {
            return NextResponse.json(
                { error: 'Email/Username and password are required' },
                { status: 400 }
            );
        }

        console.log('Starting authentication process...');

        // Authenticate user
        const user = await authenticateUser(emailOrUsername, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('User authenticated successfully:', user._id);

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user.toObject();

        return NextResponse.json(
            {
                message: 'Sign in successful',
                user: userWithoutPassword
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Signin error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : 'Unknown',
            environment: debugEnvironment()
        });

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('MongoDB')) {
                return NextResponse.json(
                    { error: 'Database connection error. Please try again.' },
                    { status: 503 }
                );
            }
            if (error.message.includes('timeout')) {
                return NextResponse.json(
                    { error: 'Request timeout. Please try again.' },
                    { status: 408 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
