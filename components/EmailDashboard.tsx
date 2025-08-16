'use client';

import { useState, useEffect } from 'react';

interface EmailStats {
    _id: string;
    count: number;
}

interface EmailData {
    emails: any[];
    stats: EmailStats[];
    totalEmails: number;
}

// Build-time safety check
const isBuildTime = () => {
    return (
        process.env.NODE_ENV === 'production' &&
        typeof window === 'undefined' &&
        (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build')
    );
};

export default function EmailDashboard() {
    const [emailData, setEmailData] = useState<EmailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Ensure this component only runs on the client side
        setIsClient(true);

        // Add a small delay to ensure we're fully on the client side
        const timer = setTimeout(() => {
            fetchEmailData();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const fetchEmailData = async () => {
        // Only fetch data if we're on the client side and not in build time
        if (!isClient || isBuildTime()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/emails');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setEmailData(result.data);
            } else {
                setError(result.message || 'Failed to fetch email data');
            }
        } catch (err) {
            console.error('Error fetching email data:', err);
            setError('Error fetching email data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything during SSR/build time
    if (!isClient || isBuildTime()) {
        return (
            <div className="card p-4 sm:p-6 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6">Email Dashboard</h2>
                <div className="flex justify-center items-center p-6 sm:p-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="card p-4 sm:p-6 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6">Email Dashboard</h2>
                <div className="flex justify-center items-center p-6 sm:p-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-4 sm:p-6 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6">Email Dashboard</h2>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-red-800 text-sm sm:text-base">Error: {error}</p>
                    <button
                        onClick={fetchEmailData}
                        className="mt-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!emailData) {
        return (
            <div className="card p-4 sm:p-6 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6">Email Dashboard</h2>
                <div className="text-center text-purple-600 p-6 sm:p-8 text-sm sm:text-base">
                    No data available
                </div>
            </div>
        );
    }

    const sentCount = emailData.stats.find(stat => stat._id === 'sent')?.count || 0;
    const failedCount = emailData.stats.find(stat => stat._id === 'failed')?.count || 0;

    return (
        <div className="card p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6 font-display">Email Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
                    <h3 className="text-base sm:text-lg font-semibold text-purple-800">Total Emails</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">{emailData.totalEmails}</p>
                </div>

                <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-green-800">Sent Successfully</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{sentCount}</p>
                </div>

                <div className="bg-red-50 p-3 sm:p-4 rounded-xl border border-red-200 sm:col-span-2 md:col-span-1">
                    <h3 className="text-base sm:text-lg font-semibold text-red-800">Failed</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{failedCount}</p>
                </div>
            </div>

            <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3">Recent Emails</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-purple-50 rounded-xl">
                        <thead>
                            <tr className="border-b border-purple-200">
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-purple-700">Email</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-purple-700">Status</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-purple-700">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailData.emails.slice(0, 10).map((email, index) => (
                                <tr key={email._id || index} className="border-b border-purple-100">
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-purple-900 break-all">{email.email}</td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${email.status === 'sent'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-purple-600">
                                        {new Date(email.sentAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                onClick={fetchEmailData}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
            >
                Refresh Data
            </button>
        </div>
    );
}
