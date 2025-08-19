import { NextRequest, NextResponse } from 'next/server';
import { config, isUSDAConfigured } from '@/lib/config';

// USDA Food Data Central API Search endpoint
const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export async function GET(request: NextRequest) {
    try {
        // Check if USDA API is configured
        if (!isUSDAConfigured()) {
            return NextResponse.json(
                { error: 'USDA API is not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const pageSize = searchParams.get('pageSize') || '25';
        const pageNumber = searchParams.get('pageNumber') || '1';
        const dataType = searchParams.get('dataType') || 'Branded,Foundation,SR Legacy';

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        // Validate page size (max 200 per USDA API)
        const parsedPageSize = Math.min(parseInt(pageSize), 200);
        const parsedPageNumber = Math.max(parseInt(pageNumber), 1);

        // Prepare request body for USDA API
        const requestBody = {
            query,
            pageSize: parsedPageSize,
            pageNumber: parsedPageNumber,
            dataType: dataType.split(','),
            sortBy: 'score',
            sortOrder: 'desc'
        };

        // Make request to USDA API (API key is safely handled on server-side)
        const response = await fetch(USDA_SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.usda.apiKey // API key never exposed to frontend
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('USDA API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to search USDA database' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return sanitized response (no API key information)
        return NextResponse.json({
            foods: data.foods || [],
            totalHits: data.totalHits || 0,
            currentPage: data.currentPage || parsedPageNumber,
            totalPages: data.totalPages || Math.ceil((data.totalHits || 0) / parsedPageSize)
        });

    } catch (error) {
        console.error('USDA Search API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check if USDA API is configured
        if (!isUSDAConfigured()) {
            return NextResponse.json(
                { error: 'USDA API is not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { query, pageSize = 25, pageNumber = 1, dataType = ['Branded', 'Foundation', 'SR Legacy'] } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // Validate parameters
        const parsedPageSize = Math.min(Math.max(parseInt(pageSize), 1), 200);
        const parsedPageNumber = Math.max(parseInt(pageNumber), 1);

        // Prepare request body for USDA API
        const requestBody = {
            query,
            pageSize: parsedPageSize,
            pageNumber: parsedPageNumber,
            dataType: Array.isArray(dataType) ? dataType : [dataType],
            sortBy: 'score',
            sortOrder: 'desc'
        };

        // Make request to USDA API (API key is safely handled on server-side)
        const response = await fetch(USDA_SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.usda.apiKey // API key never exposed to frontend
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('USDA API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to search USDA database' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return sanitized response (no API key information)
        return NextResponse.json({
            foods: data.foods || [],
            totalHits: data.totalHits || 0,
            currentPage: data.currentPage || parsedPageNumber,
            totalPages: data.totalPages || Math.ceil((data.totalHits || 0) / parsedPageSize)
        });

    } catch (error) {
        console.error('USDA Search API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
