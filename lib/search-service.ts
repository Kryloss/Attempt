export type FoodSource = 'USDA' | 'CNF' | 'OFF'

export interface CombinedSearchItem {
    id: string
    name: string
    brand?: string
    barcode?: string
    source: FoodSource
}

export interface CombinedSearchResponse {
    results: CombinedSearchItem[]
    sources: {
        usda: { totalHits: number }
        cnf: { totalHits: number }
        off?: { totalHits: number }
    }
}

export class CombinedSearchClient {
    static async search(query: string, pageSize = 10, pageNumber = 1): Promise<CombinedSearchResponse> {
        const params = new URLSearchParams({ query, pageSize: String(pageSize), pageNumber: String(pageNumber) })
        const res = await fetch(`/api/search?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to search')
        return res.json()
    }
}


