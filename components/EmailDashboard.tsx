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

export default function EmailDashboard() {
    const [emailData, setEmailData] = useState<EmailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEmailData();
    }, []);

    const fetchEmailData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/emails');
            const result = await response.json();

            if (result.success) {
                setEmailData(result.data);
            } else {
                setError(result.message || 'Failed to fetch email data');
            }
        } catch (err) {
            setError('Error fetching email data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">Error: {error}</p>
                <button
                    onClick={fetchEmailData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!emailData) {
        return null;
    }

    const sentCount = emailData.stats.find(stat => stat._id === 'sent')?.count || 0;
    const failedCount = emailData.stats.find(stat => stat._id === 'failed')?.count || 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Email Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Total Emails</h3>
                    <p className="text-3xl font-bold text-blue-600">{emailData.totalEmails}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Sent Successfully</h3>
                    <p className="text-3xl font-bold text-green-600">{sentCount}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800">Failed</h3>
                    <p className="text-3xl font-bold text-red-600">{failedCount}</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Emails</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-50 rounded-lg">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailData.emails.slice(0, 10).map((email, index) => (
                                <tr key={email._id || index} className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-sm text-gray-900">{email.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${email.status === 'sent'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Refresh Data
            </button>
        </div>
    );
}
