'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import TrainingTab from './TrainingTab'
import NutritionTab from './NutritionTab'
import ProgressTab from './ProgressTab'
import SettingsMenu from './SettingsMenu'
import { useModal } from './ModalContext'
import { WeightUnitProvider } from './WeightUnitContext'

interface TrainingDashboardProps {
    user: User
    onSignOut: () => void
}

type TabType = 'training' | 'nutrition' | 'progress'

export default function TrainingDashboard({ user, onSignOut }: TrainingDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('training')
    const [showSettings, setShowSettings] = useState(false)
    const { isAnyModalOpen, openModal, closeModal, openModals } = useModal()

    // Use emojis already present in the app for consistency
    const tabs = [
        { id: 'training', label: 'Workout', icon: '💪' },
        { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
        { id: 'progress', label: 'Progress', icon: '📊' }
    ]

    return (
        <WeightUnitProvider>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-40 animate-float border-2 border-purple-200 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                    <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-40 animate-float float-delay-2 border-2 border-purple-300 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-40 animate-float float-delay-3 border-2 border-purple-400 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                    <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-40 animate-float float-delay-1 border-2 border-purple-100 bg-purple-500/5 shadow-[0_0_36px_rgba(168,85,247,0.25)]"></div>
                </div>

                {/* Header */}
                <header id="app-header"
                    className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg border-b border-purple-200 dark:border-gray-800 shadow-xl transition-transform duration-300 translate-y-0 neon-surface light-surface"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999
                    }}
                >
                    <div className="py-1 px-4 sm:px-6 flex justify-between items-center">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="perfect-circle circle-md bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                <img src="/favicon.svg" alt="gymNote Logo" className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300">
                                {user?.guest ? 'Guest' : user?.username}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Auto-save Status - will be populated by TrainingTab */}
                            <div id="auto-save-status" className="text-purple-700 dark:text-purple-300 font-medium text-xs sm:text-base block">
                                {/* Status will be injected here */}
                            </div>
                            <button
                                onClick={() => {
                                    const newShowSettings = !showSettings
                                    setShowSettings(newShowSettings)
                                    if (newShowSettings) {
                                        openModal('settings')
                                    } else {
                                        closeModal('settings')
                                    }
                                }}
                                className="perfect-circle circle-md text-purple-600 border-2 border-purple-400 hover:border-purple-500 bg-purple-500/10 shadow-[0_0_16px_rgba(168,85,247,0.35)] dark:text-purple-300 flex items-center justify-center transition-colors relative"
                            >
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.065-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                        onClose={() => {
                            setShowSettings(false)
                            closeModal('settings')
                        }}
                    />
                )}

                {/* Main Content */}
                <main className="relative z-10 pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 text-gray-900 dark:text-gray-100">
                    {activeTab === 'training' && <TrainingTab user={user} />}
                    {activeTab === 'nutrition' && <NutritionTab user={user} />}
                    {activeTab === 'progress' && <ProgressTab />}
                </main>

                {/* Bottom Tab Navigation */}
                <nav className={`fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-purple-200 dark:border-gray-800 shadow-lg z-20 transition-transform duration-300 neon-surface light-surface ${isAnyModalOpen ? 'translate-y-full' : 'translate-y-0'
                    }`}>
                    <div className="px-4 sm:px-6 py-0.5">
                        <div className="flex justify-around">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex flex-col items-center py-0.5 px-2 sm:px-4 transition-all duration-200 ${activeTab === tab.id
                                        ? 'text-purple-500 transform scale-110'
                                        : 'text-purple-400 hover:text-purple-500'
                                        }`}
                                >
                                    <span className="mb-0.5 text-base sm:text-lg">{tab.icon}</span>
                                    <span className="text-xs font-medium">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <div className="w-3 sm:w-4 h-0.5 bg-purple-500 rounded-full mt-0.5 animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>
        </WeightUnitProvider>
    )
}
