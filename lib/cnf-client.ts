// Client-safe CNF API client. Do not import server-only modules here.

export class CNFClient {
    static async searchFoods(params: { query: string; pageSize?: number; pageNumber?: number; }): Promise<any> {
        const queryParams = new URLSearchParams({
            query: params.query,
            pageSize: String(params.pageSize || 25),
            pageNumber: String(params.pageNumber || 1),
        })
        const res = await fetch(`/api/cnf/search?${queryParams.toString()}`)
        if (!res.ok) throw new Error('Failed to search CNF')
        return res.json()
    }

    static async getFoodDetails(foodId: number): Promise<any> {
        const queryParams = new URLSearchParams({ id: String(foodId) })
        const res = await fetch(`/api/cnf/food?${queryParams.toString()}`)
        if (!res.ok) throw new Error('Failed to get CNF food details')
        return res.json()
    }
}


