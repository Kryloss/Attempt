import { config, isUSDAConfigured } from './config';

// USDA Food Data Central API Base URL
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Types for USDA API responses
export interface USDAFood {
    fdcId: number;
    description: string;
    dataType: string;
    gtinUpc?: string;
    publishedDate: string;
    brandOwner?: string;
    brandName?: string;
    ingredients?: string;
    marketCountry?: string;
    foodCategory?: string;
    modifiedDate?: string;
    dataSource?: string;
    packageWeight?: string;
    servingSizeUnit?: string;
    servingSize?: number;
    householdServingFullText?: string;
    foodNutrients?: USDANutrient[];
    foodUpdateLog?: any[];
    labelNutrients?: any;
}

export interface USDANutrient {
    type: string;
    id: number;
    nutrient: {
        id: number;
        number: string;
        name: string;
        rank: number;
        unitName: string;
    };
    foodNutrientDerivation?: {
        id: number;
        code: string;
        description: string;
        foodNutrientSource: {
            id: number;
            code: string;
            description: string;
        };
    };
    median?: number;
    amount: number;
}

export interface USDASearchResponse {
    foods: USDAFood[];
    totalHits: number;
    currentPage: number;
    totalPages: number;
}

export interface USDASearchParams {
    query: string;
    pageSize?: number;
    pageNumber?: number;
    dataType?: string[];
    sortBy?: 'score' | 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
    sortOrder?: 'asc' | 'desc';
}

// Service functions (these run on the server-side only)
export class USDAService {
    private static checkConfiguration(): boolean {
        if (!isUSDAConfigured()) {
            throw new Error('USDA API is not configured. Please set USDA_API_KEY environment variable.');
        }
        return true;
    }

    /**
     * Search for foods in the USDA database
     * @param params Search parameters
     * @returns Promise with search results
     */
    static async searchFoods(params: USDASearchParams): Promise<USDASearchResponse> {
        this.checkConfiguration();

        const {
            query,
            pageSize = 25,
            pageNumber = 1,
            dataType = ['Branded', 'Foundation', 'SR Legacy'],
            sortBy = 'score',
            sortOrder = 'desc'
        } = params;

        const requestBody = {
            query,
            pageSize: Math.min(Math.max(pageSize, 1), 200),
            pageNumber: Math.max(pageNumber, 1),
            dataType: Array.isArray(dataType) ? dataType : [dataType],
            sortBy,
            sortOrder
        };

        const response = await fetch(`${USDA_BASE_URL}/foods/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.usda.apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`USDA API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        return {
            foods: data.foods || [],
            totalHits: data.totalHits || 0,
            currentPage: data.currentPage || requestBody.pageNumber,
            totalPages: data.totalPages || Math.ceil((data.totalHits || 0) / requestBody.pageSize)
        };
    }

    /**
     * Get detailed information for a single food item
     * @param fdcId FDC ID of the food
     * @param format Response format ('abridged' or 'full')
     * @param nutrients Specific nutrients to include
     * @returns Promise with food details
     */
    static async getFoodDetails(
        fdcId: number,
        format: 'abridged' | 'full' = 'abridged',
        nutrients?: number[]
    ): Promise<USDAFood> {
        this.checkConfiguration();

        const queryParams = new URLSearchParams({
            format,
            api_key: config.usda.apiKey
        });

        if (nutrients && nutrients.length > 0) {
            queryParams.append('nutrients', nutrients.join(','));
        }

        const response = await fetch(`${USDA_BASE_URL}/food/${fdcId}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Food with FDC ID ${fdcId} not found`);
            }
            const errorData = await response.text();
            throw new Error(`USDA API Error: ${response.status} - ${errorData}`);
        }

        return await response.json();
    }

    /**
     * Get detailed information for multiple food items
     * @param fdcIds Array of FDC IDs (max 20)
     * @param format Response format ('abridged' or 'full')
     * @param nutrients Specific nutrients to include
     * @returns Promise with array of food details
     */
    static async getFoodsDetails(
        fdcIds: number[],
        format: 'abridged' | 'full' = 'abridged',
        nutrients?: number[]
    ): Promise<USDAFood[]> {
        this.checkConfiguration();

        if (fdcIds.length === 0) {
            throw new Error('fdcIds array cannot be empty');
        }

        if (fdcIds.length > 20) {
            throw new Error('Maximum 20 fdcIds allowed per request');
        }

        const requestBody: any = {
            fdcIds,
            format
        };

        if (nutrients && nutrients.length > 0) {
            requestBody.nutrients = nutrients;
        }

        const response = await fetch(`${USDA_BASE_URL}/foods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.usda.apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`USDA API Error: ${response.status} - ${errorData}`);
        }

        return await response.json();
    }
}

// Client-side helper functions (these call our API routes, not USDA directly)
export class USDAClient {
    /**
     * Search for foods using our API route (client-safe)
     * @param params Search parameters
     * @returns Promise with search results
     */
    static async searchFoods(params: USDASearchParams): Promise<USDASearchResponse> {
        const queryParams = new URLSearchParams({
            query: params.query,
            pageSize: (params.pageSize || 25).toString(),
            pageNumber: (params.pageNumber || 1).toString(),
        });

        if (params.dataType) {
            queryParams.append('dataType', params.dataType.join(','));
        }

        const response = await fetch(`/api/usda/search?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to search foods');
        }

        return await response.json();
    }

    /**
     * Get food details using our API route (client-safe)
     * @param fdcId FDC ID of the food
     * @param format Response format
     * @param nutrients Specific nutrients to include
     * @returns Promise with food details
     */
    static async getFoodDetails(
        fdcId: number,
        format: 'abridged' | 'full' = 'abridged',
        nutrients?: number[]
    ): Promise<USDAFood> {
        const queryParams = new URLSearchParams({
            fdcId: fdcId.toString(),
            format
        });

        if (nutrients && nutrients.length > 0) {
            queryParams.append('nutrients', nutrients.join(','));
        }

        const response = await fetch(`/api/usda/food?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get food details');
        }

        return await response.json();
    }

    /**
     * Get multiple foods details using our API route (client-safe)
     * @param fdcIds Array of FDC IDs (max 20)
     * @param format Response format
     * @param nutrients Specific nutrients to include
     * @returns Promise with array of food details
     */
    static async getFoodsDetails(
        fdcIds: number[],
        format: 'abridged' | 'full' = 'abridged',
        nutrients?: number[]
    ): Promise<USDAFood[]> {
        const requestBody: any = {
            fdcIds,
            format
        };

        if (nutrients && nutrients.length > 0) {
            requestBody.nutrients = nutrients;
        }

        const response = await fetch('/api/usda/food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get foods details');
        }

        return await response.json();
    }
}
