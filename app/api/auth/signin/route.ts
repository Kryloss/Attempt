import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
    try {
        const { emailOrUsername, password } = await request.json();

        // Validation
        if (!emailOrUsername || !password) {
            return NextResponse.json(
                { error: 'Email/Username and password are required' },
                { status: 400 }
            );
        }

        // Authenticate user
        const user = await authenticateUser(emailOrUsername, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

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
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
