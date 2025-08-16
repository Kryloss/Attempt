import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Training from '@/models/Training';

export async function GET(request: NextRequest) {
    try {
        // Connect to database
        await connectToDatabase();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');

        if (!userId || !date) {
            return NextResponse.json(
                { error: 'User ID and date are required' },
                { status: 400 }
            );
        }

        // Find training data for the specific user and date
        const training = await Training.findOne({ userId, date });

        return NextResponse.json({
            success: true,
            message: 'Training test endpoint working',
            userId,
            date,
            trainingFound: !!training,
            trainingCount: await Training.countDocuments({ userId })
        });

    } catch (error) {
        console.error('Training test error:', error);
        return NextResponse.json(
            { error: 'Training test failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
