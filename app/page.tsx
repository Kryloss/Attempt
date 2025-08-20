'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import AppLayout from '@/components/AppLayout'
import AuthContainer from '@/components/AuthContainer'
import TrainingTab from '@/components/TrainingTab'
import NutritionTab from '@/components/NutritionTab'
import ProgressTab from '@/components/ProgressTab'

export default function Home() {
    const [user, setUser] = useState<User | null>(null)
    const [activeTab, setActiveTab] = useState<'workouts' | 'nutrition' | 'progress'>('workouts')

    const handleAuthSuccess = (authenticatedUser: User) => {
        setUser(authenticatedUser)
    }

    const handleSignOut = () => {
        setUser(null)
        setActiveTab('workouts')
    }

    const renderTabContent = () => {
        if (!user) return null

        switch (activeTab) {
            case 'workouts':
                return <TrainingTab user={user} />
            case 'nutrition':
                return <NutritionTab user={user} />
            case 'progress':
                return <ProgressTab />
            default:
                return <TrainingTab user={user} />
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                            <img src="/favicon.svg" alt="gymNote Logo" className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                            gymNote
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your Useful Tool for Hard Work
                        </p>
                    </div>
                    <AuthContainer onSuccess={handleAuthSuccess} />
                </div>
            </div>
        )
    }

    return (
        <AppLayout user={user} onSignOut={handleSignOut} activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="container mx-auto px-4 sm:px-6">
                {renderTabContent()}
            </div>
        </AppLayout>
    )
}
