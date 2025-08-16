import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Training from '@/models/Training';

export async function POST(request: NextRequest) {
    try {
        // Connect to database
        await connectToDatabase();

        // Get the request body
        const { date, name, exercises } = await request.json();

        // Get user session (you'll need to implement this based on your auth system)
        // For now, we'll get the user ID from the request headers
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            );
        }

        if (!date || !name) {
            return NextResponse.json(
                { error: 'Date and name are required' },
                { status: 400 }
            );
        }

        // Use upsert to create or update training data
        const training = await Training.findOneAndUpdate(
            { userId, date },
            {
                userId,
                date,
                name,
                exercises: exercises || []
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return NextResponse.json({
            success: true,
            training,
            message: 'Training saved successfully'
        });

    } catch (error) {
        console.error('Error saving training:', error);
        return NextResponse.json(
            { error: 'Failed to save training' },
            { status: 500 }
        );
    }
}
