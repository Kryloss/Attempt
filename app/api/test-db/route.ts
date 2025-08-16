import { NextResponse } from 'next/server';
import { isMongoDBConfigured } from '@/lib/config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        // Check if we're in build time
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'API not available during build time',
                    error: 'This endpoint cannot be accessed during the build process',
                },
                { status: 503 }
            );
        }

        // Check if MongoDB is configured
        if (!isMongoDBConfigured()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database not configured',
                    error: 'MongoDB is not configured for this environment',
                    instructions: 'Please set MONGODB_URI in your environment variables'
                },
                { status: 500 }
            );
        }

        await dbConnect();

        // Test creating a user with the new model structure
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword123',
        });

        await testUser.save();

        // Fetch all users
        const users = await User.find({});

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            userCount: users.length,
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            })),
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
        // Check if we're in build time
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'API not available during build time',
                    error: 'This endpoint cannot be accessed during the build process',
                },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Username, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if MongoDB is configured
        if (!isMongoDBConfigured()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database not configured',
                    error: 'MongoDB is not configured for this environment',
                },
                { status: 500 }
            );
        }

        await dbConnect();

        const user = new User({ username, email, password });
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
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
