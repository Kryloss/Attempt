import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Email from '@/models/Email';

export async function GET() {
    try {
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
