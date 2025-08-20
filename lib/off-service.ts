// Open Food Facts (OFF) service: server-side fetchers and mappers + client helpers

type OFFNutriments = Record<string, any>

export interface OFFProductRaw {
    code: string
    product?: {
        product_name?: string
        brands?: string
        image_url?: string
        nutriments?: OFFNutriments
        serving_size?: string
        serving_quantity?: number
    }
    status?: number
    status_verbose?: string
}

export interface OFFSearchResponseRaw {
    count: number
    page: number
    page_count: number
    page_size: number
    products: Array<{
        code?: string
        product_name?: string
        brands?: string
        image_url?: string
    }>
}

// USDA/CNF-compatible nutrient entry (minimal shape)
export interface UnifiedFoodNutrient {
    type: string
    id: number
    nutrient: {
        id: number
        number: string
        name: string
        rank: number
        unitName: string
    }
    amount: number
}

// USDA/CNF-compatible details used by the UI (keep field names consistent)
export interface UnifiedFoodDetails {
    fdcId: number
    description: string
    dataType: string
    brandName?: string
    foodNutrients: UnifiedFoodNutrient[]
    labelNutrients?: any
    // OFF-specific extras
    source?: 'OFF'
    barcode?: string
}

function getNumber(value: any): number | undefined {
    const n = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : undefined
    return Number.isFinite(n!) ? n : undefined
}

// Maps OFF nutriments to a USDA-like foodNutrients array and labelNutrients
export function mapOFFNutrimentsToUnified(nutriments: OFFNutriments | undefined): {
    foodNutrients: UnifiedFoodNutrient[]
    labelNutrients: any
} {
    const nv = nutriments || {}

    const kcal = getNumber(nv['energy-kcal_100g'])
    const protein = getNumber(nv['proteins_100g'])
    const carbs = getNumber(nv['carbohydrates_100g'])
    const fat = getNumber(nv['fat_100g'])
    const sugars = getNumber(nv['sugars_100g'])
    const fiber = getNumber(nv['fiber_100g'])
    const saturated = getNumber(nv['saturated-fat_100g'])
    const trans = getNumber(nv['trans-fat_100g'])

    const foodNutrients: UnifiedFoodNutrient[] = []
    let nextId = 1
    const push = (name: string, unit: string, amount?: number) => {
        if (amount === undefined) return
        foodNutrients.push({
            type: 'OFF',
            id: nextId,
            nutrient: {
                id: nextId,
                number: String(nextId),
                name,
                rank: 0,
                unitName: unit,
            },
            amount,
        })
        nextId++
    }

    push('Energy (Atwater General Factors)', 'kcal', kcal)
    push('Protein', 'g', protein)
    push('Carbohydrate, by difference', 'g', carbs)
    push('Total lipid (fat)', 'g', fat)
    push('Sugars, total including NLEA', 'g', sugars)
    push('Fiber, total dietary', 'g', fiber)
    push('Fatty acids, total saturated', 'g', saturated)
    push('Fatty acids, total trans', 'g', trans)

    const labelNutrients: any = {}
    if (kcal !== undefined) labelNutrients.calories = { value: kcal }
    if (carbs !== undefined) labelNutrients.carbohydrates = { value: carbs }
    if (protein !== undefined) labelNutrients.protein = { value: protein }
    if (fat !== undefined) labelNutrients.fat = { value: fat }
    if (fiber !== undefined) labelNutrients.fiber = { value: fiber }
    if (saturated !== undefined) labelNutrients.saturatedFat = { value: saturated }
    if (trans !== undefined) labelNutrients.transFat = { value: trans }
    if (sugars !== undefined) labelNutrients.sugars = { value: sugars }

    return { foodNutrients, labelNutrients }
}

export class OFFService {
    private static readonly BASE = 'https://world.openfoodfacts.org/api/v2'

    static async fetchProductByBarcode(barcode: string): Promise<UnifiedFoodDetails | null> {
        if (!/^\d{8,14}$/.test(barcode)) {
            throw new Error('Invalid barcode format')
        }
        const res = await fetch(`${this.BASE}/product/${encodeURIComponent(barcode)}`, { cache: 'no-store' })
        if (!res.ok) {
            if (res.status === 404) return null
            const t = await res.text()
            throw new Error(`OFF product error ${res.status}: ${t}`)
        }
        const data: OFFProductRaw = await res.json()
        if (!data || data.status === 0 || !data.product) return null

        const { foodNutrients, labelNutrients } = mapOFFNutrimentsToUnified(data.product.nutriments)
        const description = data.product.product_name || 'Unknown product'
        const brand = data.product.brands || undefined
        const fdcId = Number(barcode) // maintain numeric id shape used by UI

        const unified: UnifiedFoodDetails = {
            fdcId,
            description,
            dataType: 'OFF',
            brandName: brand,
            foodNutrients,
            labelNutrients,
            source: 'OFF',
            barcode: barcode,
        }
        return unified
    }

    static async searchProducts(params: { query: string; pageSize?: number; pageNumber?: number; }): Promise<{ products: Array<{ code: string; product_name: string; brands?: string; image_url?: string }>; totalHits: number; currentPage: number; totalPages: number; }> {
        const query = params.query?.trim()
        if (!query) return { products: [], totalHits: 0, currentPage: 1, totalPages: 0 }
        const pageSize = Math.min(Math.max(params.pageSize || 10, 1), 100)
        const page = Math.max(params.pageNumber || 1, 1)

        const fields = ['code', 'product_name', 'brands', 'image_url']
        const url = new URL(`${this.BASE}/search`)
        url.searchParams.set('search_terms', query)
        url.searchParams.set('page_size', String(pageSize))
        url.searchParams.set('page', String(page))
        url.searchParams.set('fields', fields.join(','))

        const res = await fetch(url.toString(), { cache: 'no-store' })
        if (!res.ok) {
            const t = await res.text()
            throw new Error(`OFF search error ${res.status}: ${t}`)
        }
        const data: OFFSearchResponseRaw = await res.json()
        return {
            products: (data.products || []).map(p => ({
                code: String(p.code || ''),
                product_name: p.product_name || '',
                brands: p.brands,
                image_url: p.image_url,
            })).filter(p => p.code && p.product_name),
            totalHits: data.count || 0,
            currentPage: data.page || page,
            totalPages: data.page_count || Math.ceil((data.count || 0) / pageSize),
        }
    }
}

// Client-side helpers
export class OFFClient {
    static async getProductByBarcode(barcode: string): Promise<UnifiedFoodDetails> {
        const params = new URLSearchParams({ barcode })
        const res = await fetch(`/api/off/product?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch OFF product')
        return res.json()
    }

    static async search(query: string, pageSize = 10, pageNumber = 1): Promise<{ results: Array<{ id: string; description: string; brand?: string; barcode?: string; image?: string; source: 'OFF' }>; totalHits: number; currentPage: number; totalPages: number; }> {
        const params = new URLSearchParams({ q: query, pageSize: String(pageSize), pageNumber: String(pageNumber) })
        const res = await fetch(`/api/off/search?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to search OFF')
        return res.json()
    }
}


