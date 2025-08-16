'use client'

import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import EmailForm from '@/components/EmailForm'
import SuccessMessage from '@/components/SuccessMessage'

// Build-time safety check
const isBuildTime = () => {
    return (
        process.env.NODE_ENV === 'production' &&
        typeof window === 'undefined' &&
        (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build')
    );
};

// Dynamically import EmailDashboard to avoid SSR issues
const EmailDashboard = dynamic(() => import('@/components/EmailDashboard'), {
    ssr: false,
    loading: () => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Email Dashboard</h2>
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </div>
    )
})

export default function Home() {
    const [isSuccess, setIsSuccess] = useState(false)
    const [email, setEmail] = useState('')
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        // Ensure this component only runs on the client side
        setIsClient(true)
    }, [])

    const handleSuccess = (userEmail: string) => {
        setEmail(userEmail)
        setIsSuccess(true)
    }

    const handleReset = () => {
        setIsSuccess(false)
        setEmail('')
    }

    // Don't render anything during SSR/build time
    if (!isClient || isBuildTime()) {
        return (
            <main className="min-h-screen p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Email Confirmation
                        </h1>
                        <p className="text-gray-600">
                            Enter your email to receive a confirmation message
                        </p>
                    </div>
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Email Confirmation
                    </h1>
                    <p className="text-gray-600">
                        Enter your email to receive a confirmation message
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="lg:order-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {!isSuccess ? (
                                <EmailForm onSuccess={handleSuccess} />
                            ) : (
                                <SuccessMessage email={email} onReset={handleReset} />
                            )}
                        </div>
                    </div>

                    <div className="lg:order-1">
                        <Suspense fallback={
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Email Dashboard</h2>
                                <div className="flex justify-center items-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            </div>
                        }>
                            <EmailDashboard />
                        </Suspense>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Powered by <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Resend</a></p>
                </div>
            </div>
        </main>
    )
}
