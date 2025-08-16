import { NextResponse } from 'next/server';
import { isMongoDBConfigured } from '@/lib/config';
import dbConnect from '@/lib/mongodb';
import Email from '@/models/Email';

export async function GET() {
    try {
        // Check if MongoDB is configured
        if (!isMongoDBConfigured()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database not configured',
                    error: 'MongoDB is not configured for this environment',
                },
                { status: 500 }
            );
        }

        await dbConnect();

        const emails = await Email.find({})
            .sort({ createdAt: -1 })
            .limit(100);

        const stats = await Email.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalEmails = await Email.countDocuments();

        return NextResponse.json({
            success: true,
            data: {
                emails,
                stats,
                totalEmails,
            }
        });
    } catch (error) {
        console.error('Error fetching emails:', error);

        // Check if it's a connection error
        if (error instanceof Error && error.message.includes('authentication failed')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database authentication failed',
                    error: 'Please check your MongoDB credentials and connection string',
                },
                { status: 500 }
            );
        }

        if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Database connection refused',
                    error: 'Please check if MongoDB is running and accessible',
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch emails',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
