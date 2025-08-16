import { NextResponse } from 'next/server';
import { debugEnvironment } from '@/lib/config';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Environment debug:', debugEnvironment());

        // Test MongoDB connection
        await dbConnect();

        return NextResponse.json({
            success: true,
            message: 'MongoDB connection successful',
            environment: debugEnvironment()
        });

    } catch (error) {
        console.error('MongoDB test error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: debugEnvironment()
        }, { status: 500 });
    }
}
