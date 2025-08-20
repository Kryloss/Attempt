import fs from 'fs'
import path from 'path'

// CNF service loads and queries the local CNF CSV dataset.
// It exposes a USDA-compatible shape for search and food details so the UI can reuse logic.

export interface CNFFoodSearchItem {
    fdcId: number; // reuse field name used by USDA to minimize UI changes; this is CNF FoodID
    description: string;
    dataType: string; // e.g., 'CNF'
    brandName?: string; // not applicable for CNF, left undefined
}

export interface CNFNutrient {
    type: string;
    id: number;
    nutrient: {
        id: number;
        number: string; // reuse with stringified nutrient id
        name: string;
        rank: number; // not applicable, default 0
        unitName: string;
    };
    amount: number;
}

export interface CNFFoodDetails extends CNFFoodSearchItem {
    foodNutrients: CNFNutrient[];
}

type FoodNameRow = {
    FoodID: string;
    FoodCode: string;
    FoodGroupID: string;
    FoodSourceID: string;
    FoodDescription: string;
    FoodDescriptionF: string;
    FoodDateOfEntry: string;
    FoodDateOfPublication: string;
    CountryCode: string;
    ScientificName: string;
}

type NutrientNameRow = {
    NutrientID: string;
    NutrientCode: string;
    NutrientSymbol: string;
    NutrientUnit: string;
    NutrientName: string;
    NutrientNameF: string;
    Tagname: string;
    NutrientDecimals: string;
}

type NutrientAmountRow = {
    FoodID: string;
    NutrientID: string;
    NutrientValue: string;
    StandardError: string;
    NumberofObservations: string;
    NutrientSourceID: string;
    NutrientDateOfEntry: string;
}

// Lightweight CSV parser that handles quoted cells and commas.
function parseCSV(content: string): string[][] {
    const rows: string[][] = []
    let i = 0
    const len = content.length
    let current: string[] = []
    let cell = ''
    let inQuotes = false

    while (i < len) {
        const ch = content[i]
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < len && content[i + 1] === '"') {
                    cell += '"'
                    i += 2
                    continue
                } else {
                    inQuotes = false
                    i++
                    continue
                }
            } else {
                cell += ch
                i++
                continue
            }
        } else {
            if (ch === '"') {
                inQuotes = true
                i++
                continue
            }
            if (ch === ',') {
                current.push(cell)
                cell = ''
                i++
                continue
            }
            if (ch === '\n' || ch === '\r') {
                // finalize row on newline
                // handle CRLF and LF
                // skip consecutive CR/LF
                current.push(cell)
                cell = ''
                if (current.length > 1 || current[0] !== '') {
                    rows.push(current)
                }
                current = []
                // skip CRLF pair
                if (ch === '\r' && i + 1 < len && content[i + 1] === '\n') {
                    i += 2
                } else {
                    i++
                }
                continue
            }
            cell += ch
            i++
        }
    }

    // trailing cell/row
    if (cell.length > 0 || current.length > 0) {
        current.push(cell)
        rows.push(current)
    }

    return rows
}

function rowsToObjects<T = Record<string, string>>(rows: string[][]): T[] {
    if (rows.length === 0) return []
    const header = rows[0]
    const out: T[] = []
    for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        const obj: any = {}
        for (let c = 0; c < header.length; c++) {
            obj[header[c]] = row[c] ?? ''
        }
        out.push(obj)
    }
    return out
}

class CNFDataStore {
    private static instance: CNFDataStore | null = null

    private foodIdToName: Map<number, string> = new Map()
    private foodIdToGroupId: Map<number, string> = new Map()
    private nutrientIdToMeta: Map<number, NutrientNameRow> = new Map()
    private foodIdToNutrients: Map<number, Map<number, number>> = new Map()
    private isLoaded = false

    static getInstance(): CNFDataStore {
        if (!this.instance) {
            this.instance = new CNFDataStore()
        }
        return this.instance
    }

    async ensureLoaded(): Promise<void> {
        if (this.isLoaded) return
        const baseDir = path.join(process.cwd(), 'cnf-fcen-csv')

        const [foodNameTxt, nutrientNameTxt, nutrientAmountTxt] = await Promise.all([
            fs.promises.readFile(path.join(baseDir, 'FOOD NAME.csv'), 'utf8'),
            fs.promises.readFile(path.join(baseDir, 'NUTRIENT NAME.csv'), 'utf8'),
            fs.promises.readFile(path.join(baseDir, 'NUTRIENT AMOUNT.csv'), 'utf8'),
        ])

        // Parse foods
        const foodRows = parseCSV(foodNameTxt)
        const foods = rowsToObjects<FoodNameRow>(foodRows)
        for (const f of foods) {
            const id = parseInt(f.FoodID)
            if (!isNaN(id)) {
                this.foodIdToName.set(id, f.FoodDescription)
                this.foodIdToGroupId.set(id, f.FoodGroupID)
            }
        }

        // Parse nutrient meta
        const nutrientRows = parseCSV(nutrientNameTxt)
        const nutrientNames = rowsToObjects<NutrientNameRow>(nutrientRows)
        for (const n of nutrientNames) {
            const id = parseInt(n.NutrientID)
            if (!isNaN(id)) this.nutrientIdToMeta.set(id, n)
        }

        // Parse nutrient amounts (might be large)
        const amountRows = parseCSV(nutrientAmountTxt)
        const amounts = rowsToObjects<NutrientAmountRow>(amountRows)
        for (const a of amounts) {
            const fid = parseInt(a.FoodID)
            const nid = parseInt(a.NutrientID)
            const val = parseFloat(a.NutrientValue)
            if (!isNaN(fid) && !isNaN(nid) && !isNaN(val)) {
                if (!this.foodIdToNutrients.has(fid)) this.foodIdToNutrients.set(fid, new Map())
                this.foodIdToNutrients.get(fid)!.set(nid, val)
            }
        }

        this.isLoaded = true
    }

    searchFoods(query: string, pageSize: number, pageNumber: number): CNFFoodSearchItem[] {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return []
        const all: CNFFoodSearchItem[] = []
        this.foodIdToName.forEach((name, id) => {
            if (String(name).toLowerCase().includes(normalized)) {
                all.push({
                    fdcId: id,
                    description: name,
                    dataType: 'CNF',
                })
            }
        })
        const start = (pageNumber - 1) * pageSize
        return all.slice(start, start + pageSize)
    }

    getFoodDetails(foodId: number): CNFFoodDetails | null {
        const name = this.foodIdToName.get(foodId)
        if (!name) return null
        const nutrientsMap = this.foodIdToNutrients.get(foodId) || new Map()
        const nutrients: CNFNutrient[] = []

        // Convert all available nutrients, but ensure core ones exist if present in dataset
        nutrientsMap.forEach((amount, nid) => {
            const meta = this.nutrientIdToMeta.get(nid)
            if (!meta) return
            nutrients.push({
                type: 'CNF',
                id: nid,
                nutrient: {
                    id: nid,
                    number: String(nid),
                    name: meta.NutrientName,
                    rank: 0,
                    unitName: meta.NutrientUnit,
                },
                amount: amount,
            })
        })

        return {
            fdcId: foodId,
            description: name,
            dataType: 'CNF',
            foodNutrients: nutrients,
        }
    }
}

export class CNFService {
    static async searchFoods(params: { query: string; pageSize?: number; pageNumber?: number; }): Promise<{ foods: CNFFoodSearchItem[]; totalHits: number; currentPage: number; totalPages: number; }> {
        const store = CNFDataStore.getInstance()
        await store.ensureLoaded()
        const pageSize = Math.min(Math.max(params.pageSize || 25, 1), 200)
        const pageNumber = Math.max(params.pageNumber || 1, 1)
        // For totalHits we need to compute all matches; do one pass
        const normalized = params.query.trim().toLowerCase()
        const allMatches: number[] = []
            ; (store as any).foodIdToName.forEach((name: string, id: number) => {
                if (String(name).toLowerCase().includes(normalized)) allMatches.push(id)
            })
        const start = (pageNumber - 1) * pageSize
        const ids = allMatches.slice(start, start + pageSize)
        const foods = ids.map(id => ({ fdcId: id, description: (store as any).foodIdToName.get(id), dataType: 'CNF' as const }))
        return {
            foods,
            totalHits: allMatches.length,
            currentPage: pageNumber,
            totalPages: Math.ceil(allMatches.length / pageSize),
        }
    }

    static async getFoodDetails(foodId: number): Promise<CNFFoodDetails | null> {
        const store = CNFDataStore.getInstance()
        await store.ensureLoaded()
        return store.getFoodDetails(foodId)
    }
}

// Client-side helpers for CNF API routes
export class CNFClient {
    static async searchFoods(params: { query: string; pageSize?: number; pageNumber?: number; }): Promise<{ foods: CNFFoodSearchItem[]; totalHits: number; currentPage: number; totalPages: number; }> {
        const queryParams = new URLSearchParams({
            query: params.query,
            pageSize: String(params.pageSize || 25),
            pageNumber: String(params.pageNumber || 1),
        })
        const res = await fetch(`/api/cnf/search?${queryParams.toString()}`)
        if (!res.ok) throw new Error('Failed to search CNF')
        return res.json()
    }

    static async getFoodDetails(foodId: number): Promise<CNFFoodDetails> {
        const queryParams = new URLSearchParams({ id: String(foodId) })
        const res = await fetch(`/api/cnf/food?${queryParams.toString()}`)
        if (!res.ok) throw new Error('Failed to get CNF food details')
        return res.json()
    }
}


