import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TrainingPreset } from '@/models/Training';

export async function POST(request: NextRequest) {
    try {
        const { name, exercises } = await request.json();
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (!name || !exercises || !Array.isArray(exercises)) {
            return NextResponse.json({ success: false, error: 'Name and exercises are required' }, { status: 400 });
        }

        await connectToDatabase();

        // Check if preset with this name already exists
        const existingPreset = await TrainingPreset.findOne({
            userId: userId,
            name: name
        });

        if (existingPreset) {
            // Update existing preset
            existingPreset.exercises = exercises;
            await existingPreset.save();
        } else {
            // Create new preset
            await TrainingPreset.create({
                userId: userId,
                name,
                exercises
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving preset:', error);
        return NextResponse.json({ success: false, error: 'Failed to save preset' }, { status: 500 });
    }
}
