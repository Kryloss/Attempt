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
        <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">Email Dashboard</h2>
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <main className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
                {/* Enhanced background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-30 animate-float float-delay-2"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-25 animate-float float-delay-3"></div>
                    <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-40 animate-float float-delay-1"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-purple-300 rounded-full opacity-35 animate-float float-delay-4"></div>
                </div>

                <div className="text-center relative z-10">
                    <div className="icon-container mx-auto mb-6 animate-float glow-purple">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-purple-800 mb-4 font-display gradient-text">
                        gymNote
                    </h1>
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
            {/* Enhanced background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-30 animate-float float-delay-2"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-25 animate-float float-delay-3"></div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-40 animate-float float-delay-1"></div>
                <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-purple-300 rounded-full opacity-35 animate-float float-delay-4"></div>
                <div className="absolute top-1/4 left-1/2 w-8 h-8 bg-purple-200 rounded-full opacity-30 animate-float float-delay-5"></div>
                <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-purple-100 rounded-full opacity-25 animate-float float-delay-6"></div>
            </div>

            <div className="max-w-md mx-auto w-full relative z-10">
                {/* Header with gymNote branding */}
                <div className="text-center mb-12">
                    <div className="icon-container mx-auto mb-6 animate-float glow-purple">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-purple-800 mb-4 font-display gradient-text">
                        gymNote
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto rounded-full animate-pulse-slow"></div>
                </div>

                {/* Main content card */}
                <div className="card p-8 animate-glow card-hover">
                    {!isSuccess ? (
                        <EmailForm onSuccess={handleSuccess} />
                    ) : (
                        <SuccessMessage email={email} onReset={handleReset} />
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-purple-600">
                    <p>Email delivery via Gmail SMTP</p>
                </div>
            </div>
        </main>
    )
}
