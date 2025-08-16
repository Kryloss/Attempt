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

        if (!training) {
            return NextResponse.json({
                success: true,
                training: null,
                message: 'No training data found for this date'
            });
        }

        return NextResponse.json({
            success: true,
            training,
            message: 'Training data retrieved successfully'
        });

    } catch (error) {
        console.error('Error retrieving training:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve training data' },
            { status: 500 }
        );
    }
}
