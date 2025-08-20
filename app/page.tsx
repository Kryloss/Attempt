'use client'

import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AuthContainer from '@/components/AuthContainer'
import TrainingDashboard from '@/components/TrainingDashboard'
import { User } from '@/types/auth'

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
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        // Ensure this component only runs on the client side
        setIsClient(true)
    }, [])

    const handleAuthSuccess = (userData: User) => {
        setUser(userData)
        setIsAuthenticated(true)
    }

    const handleSignOut = () => {
        setIsAuthenticated(false)
        setUser(null)
    }

    // Don't render anything during SSR/build time
    if (!isClient || isBuildTime()) {
        return (
            <main className="min-h-screen p-2 sm:p-4 flex items-center justify-center relative overflow-hidden">
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
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                            <img src="/favicon.svg" alt="gymNote Logo" className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-purple-800 mb-4 font-display gradient-text">
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
        <main className="min-h-screen">
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

            {!isAuthenticated ? (
                // Centered auth container
                <div className="flex items-center justify-center min-h-screen">
                    <div className="max-w-sm sm:max-w-md mx-auto w-full relative z-10 px-3 sm:px-4">
                        {/* App Name Header */}
                        <div className="text-center mb-6">
                            {/* Fitness Logo */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <img src="/favicon.svg" alt="gymNote Logo" className="w-10 h-10" />
                                </div>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-500 bg-clip-text text-transparent mb-2 leading-tight pb-1">
                                gymNote
                            </h1>
                            <p className="text-gray-600 text-sm">Your personal fitness companion</p>
                        </div>

                        {/* Main content card */}
                        <div className="card p-4 sm:p-6 animate-glow card-hover">
                            <AuthContainer onSuccess={handleAuthSuccess} />
                        </div>
                    </div>
                </div>
            ) : user ? (
                // Full screen workout dashboard
                <TrainingDashboard user={user} onSignOut={handleSignOut} />
            ) : null}
        </main>
    )
}
