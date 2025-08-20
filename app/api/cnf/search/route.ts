import { NextRequest, NextResponse } from 'next/server'
import { CNFService } from '@/lib/cnf-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('query')?.trim() || ''
        const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '25'), 1), 200)
        const pageNumber = Math.max(parseInt(searchParams.get('pageNumber') || '1'), 1)

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
        }

        const data = await CNFService.searchFoods({ query, pageSize, pageNumber })
        return NextResponse.json(data)
    } catch (error) {
        console.error('CNF Search API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


