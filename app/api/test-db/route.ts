import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Test creating a user
        const testUser = new User({
            email: 'test@example.com',
            name: 'Test User',
        });

        await testUser.save();

        // Fetch all users
        const users = await User.find({});

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            userCount: users.length,
            users: users,
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email || !name) {
            return NextResponse.json(
                { success: false, message: 'Email and name are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = new User({ email, name });
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: user,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create user',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
