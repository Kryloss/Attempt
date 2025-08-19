import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Nutrition from '@/models/Nutrition';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 401 }
            );
        }

        const { id, date, meals, foods } = await request.json();

        if (!date) {
            return NextResponse.json(
                { error: 'Date is required' },
                { status: 400 }
            );
        }

        const nutrition = await Nutrition.findOneAndUpdate(
            { userId, date },
            {
                userId,
                date,
                meals: meals || [],
                foods: foods || [],
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, nutrition });
    } catch (error) {
        console.error('Error saving nutrition:', error);
        return NextResponse.json(
            { error: 'Failed to save nutrition' },
            { status: 500 }
        );
    }
}


