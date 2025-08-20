'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import TrainingTab from '@/components/TrainingTab'
import AppLayout from '@/components/AppLayout'
import { useRouter } from 'next/navigation'

export default function WorkoutsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsClient(true)
        // Check if user is authenticated
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    const userData = JSON.parse(storedUser)
                    setUser(userData)
                } else {
                    // Redirect to authorization if no user found
                    router.push('/authorization')
                }
            } catch (error) {
                router.push('/authorization')
            }
        }

        if (isClient) {
            checkAuth()
        }
    }, [isClient, router])

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to authorization
    }

    return (
        <AppLayout user={user} onSignOut={() => router.push('/authorization')}>
            <div className="px-4 sm:px-6">
                <TrainingTab user={user} />
            </div>
        </AppLayout>
    )
}
