import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { TrainingPreset } from '@/models/Training'

export async function DELETE(request: NextRequest) {
    try {
        const { presetId } = await request.json()
        const userId = request.headers.get('x-user-id')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        if (!presetId) {
            return NextResponse.json(
                { success: false, error: 'Preset ID is required' },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Find and delete the preset
        const result = await TrainingPreset.deleteOne({
            _id: presetId,
            userId: userId
        })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Preset not found or access denied' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Preset deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting preset:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
