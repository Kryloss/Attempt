import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Training from '@/models/Training';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const trainings = await Training.find({
            userId: userId
        }).sort({ date: -1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            trainings: trainings.map(training => ({
                id: training._id,
                name: training.name,
                exercises: training.exercises,
                date: training.date
            }))
        });
    } catch (error) {
        console.error('Error loading training history:', error);
        return NextResponse.json({ success: false, error: 'Failed to load training history' }, { status: 500 });
    }
}
