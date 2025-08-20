'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()

    const tabs = [
        { id: 'workouts', label: 'Workout', icon: '💪', path: '/guest/workouts' },
        { id: 'nutrition', label: 'Nutrition', icon: '🥗', path: '/guest/nutrition' },
        { id: 'progress', label: 'Progress', icon: '📊', path: '/guest/progress' }
    ]

    const handleSignIn = () => {
        router.push('/auth')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-40 animate-float border-2 border-purple-200 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-40 animate-float float-delay-2 border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-40 animate-float float-delay-3 border-2 border-purple-400 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-40 animate-float float-delay-1 border-2 border-purple-100 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
            </div>

            {/* Header */}
            <header className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg border-b border-purple-200 dark:border-gray-800 shadow-xl transition-transform duration-300 translate-y-0 neon-surface light-surface fixed top-0 left-0 right-0 z-50">
                <div className="py-1 px-4 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="perfect-circle circle-md bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                            <img src="/favicon.svg" alt="gymNote Logo" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300">
                            Guest Mode
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={handleSignIn}
                            className="px-4 py-2 text-sm font-medium text-purple-600 border-2 border-purple-400 hover:border-purple-500 bg-purple-500/10 shadow-[0_0_16px_rgba(168,85,247,0.35)] dark:text-purple-300 rounded-lg transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 pt-12 sm:pt-16 pb-12 sm:pb-16 text-gray-900 dark:text-gray-100">
                {children}
            </div>

            {/* Bottom Tab Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-purple-200 dark:border-gray-800 shadow-lg z-20 transition-transform duration-300 neon-surface light-surface">
                <div className="px-4 sm:px-6 py-0.5">
                    <div className="flex justify-around">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.path
                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.path}
                                    className={`flex flex-col items-center py-0.5 px-2 sm:px-4 transition-all duration-200 ${isActive
                                            ? 'text-purple-500 transform scale-110'
                                            : 'text-purple-400 hover:text-purple-500'
                                        }`}
                                >
                                    <span className="mb-0.5 text-base sm:text-lg">{tab.icon}</span>
                                    <span className="text-xs font-medium">{tab.label}</span>
                                    {isActive && (
                                        <div className="w-3 sm:w-4 h-0.5 bg-purple-500 rounded-full mt-0.5 animate-pulse"></div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}
