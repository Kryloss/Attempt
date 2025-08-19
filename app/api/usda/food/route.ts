import { NextRequest, NextResponse } from 'next/server';
import { config, isUSDAConfigured } from '@/lib/config';

// USDA Food Data Central API Food Details endpoint
const USDA_FOOD_URL = 'https://api.nal.usda.gov/fdc/v1/food';

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
        const fdcId = searchParams.get('fdcId');
        const format = searchParams.get('format') || 'abridged';
        const nutrients = searchParams.get('nutrients');

        if (!fdcId) {
            return NextResponse.json(
                { error: 'fdcId parameter is required' },
                { status: 400 }
            );
        }

        // Validate fdcId is a number
        const parsedFdcId = parseInt(fdcId);
        if (isNaN(parsedFdcId)) {
            return NextResponse.json(
                { error: 'fdcId must be a valid number' },
                { status: 400 }
            );
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            format,
            api_key: config.usda.apiKey // API key handled securely on server-side
        });

        if (nutrients) {
            queryParams.append('nutrients', nutrients);
        }

        // Make request to USDA API
        const response = await fetch(`${USDA_FOOD_URL}/${parsedFdcId}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Food not found' },
                    { status: 404 }
                );
            }
            const errorData = await response.text();
            console.error('USDA API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch food details from USDA database' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return sanitized response (no API key information)
        return NextResponse.json(data);

    } catch (error) {
        console.error('USDA Food API Error:', error);
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
        const { fdcIds, format = 'abridged', nutrients } = body;

        if (!fdcIds || !Array.isArray(fdcIds) || fdcIds.length === 0) {
            return NextResponse.json(
                { error: 'fdcIds array is required and must not be empty' },
                { status: 400 }
            );
        }

        // Validate all fdcIds are numbers
        const parsedFdcIds = fdcIds.map(id => {
            const parsed = parseInt(id);
            if (isNaN(parsed)) {
                throw new Error(`Invalid fdcId: ${id}`);
            }
            return parsed;
        });

        // USDA API allows up to 20 foods per request
        if (parsedFdcIds.length > 20) {
            return NextResponse.json(
                { error: 'Maximum 20 fdcIds allowed per request' },
                { status: 400 }
            );
        }

        // Prepare request body for USDA API
        const requestBody: any = {
            fdcIds: parsedFdcIds,
            format
        };

        if (nutrients) {
            requestBody.nutrients = Array.isArray(nutrients) ? nutrients : [nutrients];
        }

        // Make request to USDA API
        const response = await fetch('https://api.nal.usda.gov/fdc/v1/foods', {
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
                { error: 'Failed to fetch foods from USDA database' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return sanitized response (no API key information)
        return NextResponse.json(data);

    } catch (error) {
        console.error('USDA Foods API Error:', error);
        if (error instanceof Error && error.message.includes('Invalid fdcId')) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
