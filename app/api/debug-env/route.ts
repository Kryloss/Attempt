import { NextResponse } from 'next/server';
import { debugEnvironment } from '@/lib/config';

export async function GET() {
    try {
        const envInfo = debugEnvironment();
        
        return NextResponse.json({
            success: true,
            message: 'Environment variables debug info',
            data: envInfo,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to get debug info',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
