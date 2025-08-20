import { NextRequest, NextResponse } from 'next/server'
import { CNFService } from '@/lib/cnf-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const idParam = searchParams.get('id')
        if (!idParam) return NextResponse.json({ error: 'id is required' }, { status: 400 })
        const id = parseInt(idParam)
        if (isNaN(id)) return NextResponse.json({ error: 'id must be a number' }, { status: 400 })

        const details = await CNFService.getFoodDetails(id)
        if (!details) return NextResponse.json({ error: 'Food not found' }, { status: 404 })
        return NextResponse.json(details)
    } catch (error) {
        console.error('CNF Food API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


