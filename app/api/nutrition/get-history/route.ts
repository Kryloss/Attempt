import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Nutrition from '@/models/Nutrition'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
        }

        await connectToDatabase()

        const nutritions = await Nutrition.find({
            userId: userId
        })
            .sort({ date: -1, createdAt: -1 })
            .select('date meals foods createdAt')

        return NextResponse.json({
            success: true,
            nutritions
        })
    } catch (error) {
        console.error('Error loading nutrition history:', error)
        return NextResponse.json({ success: false, error: 'Failed to load nutrition history' }, { status: 500 })
    }
}


