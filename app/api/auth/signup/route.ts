import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, findUserByUsername } from '@/lib/db-utils';
import { debugEnvironment } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        // Debug environment variables (remove in production)
        console.log('Environment debug:', debugEnvironment());

        const { username, email, password, confirmPassword } = await request.json();

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'Passwords do not match' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 30) {
            return NextResponse.json(
                { error: 'Username must be between 3 and 30 characters' },
                { status: 400 }
            );
        }

        console.log('Starting user creation process...');

        // Check if user already exists
        const existingUserByEmail = await findUserByEmail(email);
        if (existingUserByEmail) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        const existingUserByUsername = await findUserByUsername(username);
        if (existingUserByUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 409 }
            );
        }

        console.log('Creating new user...');

        // Create new user
        const user = await createUser(username, email, password);

        console.log('User created successfully:', user._id);

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user.toObject();

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: userWithoutPassword
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Signup error details:', {
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
