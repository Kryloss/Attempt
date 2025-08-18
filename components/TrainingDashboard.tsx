'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import TrainingTab from './TrainingTab'
import NutritionTab from './NutritionTab'
import ProgressTab from './ProgressTab'
import SettingsMenu from './SettingsMenu'

interface TrainingDashboardProps {
    user: User
    onSignOut: () => void
}

type TabType = 'training' | 'nutrition' | 'progress'

export default function TrainingDashboard({ user, onSignOut }: TrainingDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('training')
    const [showSettings, setShowSettings] = useState(false)

    const tabs = [
        { id: 'training', label: 'Training', icon: '💪' },
        { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
        { id: 'progress', label: 'Progress', icon: '📊' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-30 animate-float float-delay-2"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-25 animate-float float-delay-3"></div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-40 animate-float float-delay-1"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-purple-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm sm:text-lg font-bold">G</span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-purple-700">
                            Training Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-purple-700 font-medium text-sm sm:text-base hidden sm:block">
                            {user?.guest ? 'Guest' : user?.username}
                        </span>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="perfect-circle circle-md bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center transition-colors relative"
                        >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Settings Menu - Rendered outside header for proper positioning */}
            {showSettings && (
                <SettingsMenu
                    user={user}
                    onSignOut={onSignOut}
                    onSignIn={() => {
                        // For guest users, this will redirect them to sign in
                        onSignOut() // This will take them back to the auth screen
                    }}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
                {activeTab === 'training' && <TrainingTab user={user} />}
                {activeTab === 'nutrition' && <NutritionTab />}
                {activeTab === 'progress' && <ProgressTab />}
            </main>

            {/* Bottom Tab Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-200 shadow-lg z-20">
                <div className="max-w-4xl mx-auto px-3 sm:px-4">
                    <div className="flex justify-around">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex flex-col items-center py-2 sm:py-3 px-2 sm:px-4 transition-all duration-200 ${activeTab === tab.id
                                    ? 'text-purple-600 transform scale-110'
                                    : 'text-purple-400 hover:text-purple-500'
                                    }`}
                            >
                                <span className="text-xl sm:text-2xl mb-1">{tab.icon}</span>
                                <span className="text-xs font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="w-6 sm:w-8 h-1 bg-purple-600 rounded-full mt-1 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}
