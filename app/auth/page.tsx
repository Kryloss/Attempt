'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import AuthContainer from '@/components/AuthContainer'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    const handleAuthSuccess = (authenticatedUser: User) => {
        setUser(authenticatedUser)
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(authenticatedUser))
        // Redirect to workouts page after successful auth
        router.push('/workouts')
    }

    // If user is already authenticated, redirect to workouts
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                if (parsedUser && !parsedUser.guest) {
                    router.push('/workouts')
                }
            } catch (e) {
                // Invalid stored user, continue to auth
            }
        }
    }, [router])

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
