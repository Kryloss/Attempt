'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import AppLayout from '@/components/AppLayout'
import ProgressTab from '@/components/ProgressTab'
import { useRouter } from 'next/navigation'

export default function ProgressPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                // You can implement your auth check logic here
                // For now, we'll check localStorage or session
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                } else {
                    // Redirect to auth if no user found
                    router.push('/auth')
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                router.push('/auth')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const handleSignOut = () => {
        localStorage.removeItem('user')
        setUser(null)
        router.push('/auth')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="perfect-circle circle-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <img src="/favicon.svg" alt="gymNote Logo" className="w-8 h-8" />
                    </div>
                    <p className="text-purple-700 dark:text-purple-300">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to auth
    }

    return (
        <AppLayout
            user={user}
            onSignOut={handleSignOut}
            activeTab="progress"
            onTabChange={() => { }} // No tab change needed for single page
        >
            <div className="container mx-auto px-4 sm:px-6">
                <ProgressTab />
            </div>
        </AppLayout>
    )
}
