'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import TrainingTab from './TrainingTab'
import NutritionTab from './NutritionTab'
import ProgressTab from './ProgressTab'
import SettingsMenu from './SettingsMenu'
import { useModal } from './ModalContext'

interface TrainingDashboardProps {
    user: User
    onSignOut: () => void
}

type TabType = 'training' | 'nutrition' | 'progress'

export default function TrainingDashboard({ user, onSignOut }: TrainingDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('training')
    const [showSettings, setShowSettings] = useState(false)
    const { isAnyModalOpen, openModal, closeModal, openModals } = useModal()

    // Icons styled similarly to the settings button (stroke-based, currentColor)
    const WorkoutIcon = () => (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* Dumbbell */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9v6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9v6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10v4" />
        </svg>
    )

    const NutritionIcon = () => (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {/* Apple body */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21c-3.8 0-7-3-7-6.8 0-2.6 1.7-4.7 4.1-5.2 1.5-.3 2.9.2 2.9.2s1.4-.5 2.9-.2C18.3 9.5 20 11.6 20 14.2 20 18 15.8 21 12 21z" />
            {/* Stem */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7V5" />
            {/* Leaf */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5c1.6 0 3 1 3.6 2.3-1.9.2-3.6-.7-4.7-2.1" />
        </svg>
    )

    const ProgressIcon = () => (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* Bar chart */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19v-3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 19V5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 19v-6" />
        </svg>
    )

    const tabs = [
        { id: 'training', label: 'Workout', icon: <WorkoutIcon /> },
        { id: 'nutrition', label: 'Nutrition', icon: <NutritionIcon /> },
        { id: 'progress', label: 'Progress', icon: <ProgressIcon /> }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-30 animate-float float-delay-2"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-25 animate-float float-delay-3"></div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-40 animate-float float-delay-1"></div>
            </div>

            {/* Header */}
            <header id="app-header"
                className="bg-white/95 backdrop-blur-lg border-b border-purple-200 shadow-xl transition-transform duration-300 translate-y-0"
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
                        <span className="text-sm sm:text-base font-bold text-purple-700">
                            {user?.guest ? 'Guest' : user?.username}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Auto-save Status - will be populated by TrainingTab */}
                        <div id="auto-save-status" className="text-purple-700 font-medium text-xs sm:text-base block">
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
                            className="perfect-circle circle-md bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center transition-colors relative"
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
            <main className="relative z-10 pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6">
                {activeTab === 'training' && <TrainingTab user={user} />}
                {activeTab === 'nutrition' && <NutritionTab user={user} />}
                {activeTab === 'progress' && <ProgressTab />}
            </main>

            {/* Bottom Tab Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-200 shadow-lg z-20 transition-transform duration-300 ${isAnyModalOpen ? 'translate-y-full' : 'translate-y-0'
                }`}>
                <div className="px-4 sm:px-6 py-0.5">
                    <div className="flex justify-around">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex flex-col items-center py-0.5 px-2 sm:px-4 transition-all duration-200 ${activeTab === tab.id
                                    ? 'text-purple-600 transform scale-110'
                                    : 'text-purple-400 hover:text-purple-500'
                                    }`}
                            >
                                <span className="mb-0.5">{tab.icon}</span>
                                <span className="text-xs font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="w-3 sm:w-4 h-0.5 bg-purple-600 rounded-full mt-0.5 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}
