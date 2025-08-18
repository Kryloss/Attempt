import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TrainingPreset } from '@/models/Training';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const presets = await TrainingPreset.find({
            userId: userId
        }).sort({ updatedAt: -1 });

        return NextResponse.json({
            success: true,
            presets: presets.map(preset => ({
                id: preset._id,
                name: preset.name,
                exercises: preset.exercises
            }))
        });
    } catch (error) {
        console.error('Error loading presets:', error);
        return NextResponse.json({ success: false, error: 'Failed to load presets' }, { status: 500 });
    }
}
