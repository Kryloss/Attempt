import { NextRequest, NextResponse } from 'next/server'
import { USDAService } from '@/lib/usda-service'
import { CNFService } from '@/lib/cnf-service'
import { OFFService } from '@/lib/off-service'
import { isUSDAConfigured } from '@/lib/config'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('query')?.trim() || ''
        const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10'), 1), 50)
        const pageNumber = Math.max(parseInt(searchParams.get('pageNumber') || '1'), 1)
        if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 })

        // Split pageSize between sources roughly equally among USDA, CNF, OFF
        const usdaPageSize = Math.ceil(pageSize / 3)
        const cnfPageSize = Math.ceil((pageSize - usdaPageSize) / 2)
        const offPageSize = Math.max(pageSize - usdaPageSize - cnfPageSize, 1)

        const tasks: Promise<any>[] = []

        if (isUSDAConfigured()) {
            tasks.push(
                USDAService.searchFoods({ query, pageSize: usdaPageSize, pageNumber, dataType: ['Branded', 'Foundation', 'SR Legacy'] })
                    .then(r => ({ source: 'USDA', ...r }))
                    .catch(() => ({ source: 'USDA', foods: [], totalHits: 0, currentPage: pageNumber, totalPages: 0 }))
            )
        } else {
            tasks.push(Promise.resolve({ source: 'USDA', foods: [], totalHits: 0, currentPage: pageNumber, totalPages: 0 }))
        }

        tasks.push(
            CNFService.searchFoods({ query, pageSize: cnfPageSize || usdaPageSize, pageNumber })
                .then(r => ({ source: 'CNF', ...r }))
                .catch(() => ({ source: 'CNF', foods: [], totalHits: 0, currentPage: pageNumber, totalPages: 0 }))
        )

        // OFF text search
        tasks.push(
            OFFService.searchProducts({ query, pageSize: offPageSize || usdaPageSize, pageNumber })
                .then(r => ({ source: 'OFF', ...r }))
                .catch(() => ({ source: 'OFF', products: [], totalHits: 0, currentPage: pageNumber, totalPages: 0 }))
        )

        const [usda, cnf, off] = await Promise.all(tasks)

        // Normalize and merge
        const mapUSDA = (food: any) => ({ id: String(food.fdcId), name: food.description, source: 'USDA' as const })
        const mapCNF = (food: any) => ({ id: String(food.fdcId), name: food.description, source: 'CNF' as const })
        const mapOFF = (p: any) => ({ id: `off:${p.code}`, name: p.product_name, brand: p.brands || undefined, barcode: p.code, source: 'OFF' as const })
        const merged = [
            ...(usda.foods || []).map(mapUSDA),
            ...(cnf.foods || []).map(mapCNF),
            ...(off.products || []).map(mapOFF),
        ]

        // If query is a pure barcode, fetch exact OFF product to rank on top
        let exactOff: any | null = null
        if (/^\d{8,14}$/.test(query)) {
            try {
                const detailed = await OFFService.fetchProductByBarcode(query)
                if (detailed) {
                    exactOff = {
                        id: `off:${query}`,
                        name: detailed.description,
                        brand: detailed.brandName,
                        barcode: query,
                        source: 'OFF' as const,
                        _rank: 0,
                    }
                }
            } catch { /* ignore */ }
        }

        // Ranking: barcode exact matches first, then branded name matches, then generic foods
        const normalizedQ = query.toLowerCase()
        const score = (item: any): number => {
            if (item.barcode && /^\d{8,14}$/.test(query) && item.barcode === query) return 0
            const hasBrand = !!item.brand
            const name = String(item.name || '').toLowerCase()
            if (hasBrand && name.includes(normalizedQ)) return 1
            if (name.includes(normalizedQ)) return 2
            return 3
        }

        let ranked = merged
        if (exactOff) {
            ranked = [exactOff, ...merged]
        }
        ranked.sort((a: any, b: any) => score(a) - score(b))

        return NextResponse.json({
            results: ranked,
            sources: {
                usda: { totalHits: usda.totalHits || 0 },
                cnf: { totalHits: cnf.totalHits || 0 },
                off: { totalHits: off.totalHits || 0 },
            }
        })
    } catch (error) {
        console.error('Combined Search API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


