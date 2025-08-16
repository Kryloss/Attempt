import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database not configured',
                    error: 'MONGODB_URI environment variable is not set',
                    instructions: 'Please set MONGODB_URI in your environment variables'
                },
                { status: 500 }
            );
        }

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
        
        // Check if it's a connection error
        if (error instanceof Error && error.message.includes('authentication failed')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database authentication failed',
                    error: 'Please check your MongoDB credentials and connection string',
                    instructions: 'Verify your username, password, and database name in MONGODB_URI'
                },
                { status: 500 }
            );
        }
        
        if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database connection refused',
                    error: 'Please check if MongoDB is running and accessible',
                    instructions: 'Verify your MongoDB Atlas cluster is running and IP is whitelisted'
                },
                { status: 500 }
            );
        }

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

        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database not configured',
                    error: 'MONGODB_URI environment variable is not set',
                },
                { status: 500 }
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
