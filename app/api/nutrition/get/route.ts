import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Nutrition from '@/models/Nutrition';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');

        if (!userId || !date) {
            return NextResponse.json(
                { error: 'User ID and date are required' },
                { status: 400 }
            );
        }

        const nutrition = await Nutrition.findOne({ userId, date });

        return NextResponse.json({
            success: true,
            nutrition: nutrition || null,
            message: nutrition ? 'Nutrition retrieved' : 'No nutrition for this date',
        });
    } catch (error) {
        console.error('Error retrieving nutrition:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve nutrition data' },
            { status: 500 }
        );
    }
}


