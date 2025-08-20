import { NextRequest, NextResponse } from 'next/server'
import { OFFService } from '@/lib/off-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = (searchParams.get('q') || '').trim()
        const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10'), 1), 100)
        const pageNumber = Math.max(parseInt(searchParams.get('pageNumber') || '1'), 1)
        if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 })

        const data = await OFFService.searchProducts({ query: q, pageSize, pageNumber })
        const results = (data.products || []).map(p => ({
            id: `off:${p.code}`,
            description: p.product_name,
            brand: p.brands || undefined,
            barcode: p.code,
            image: p.image_url || undefined,
            source: 'OFF' as const,
        }))
        return NextResponse.json({ results, totalHits: data.totalHits, currentPage: data.currentPage, totalPages: data.totalPages })
    } catch (error) {
        console.error('OFF search error', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


