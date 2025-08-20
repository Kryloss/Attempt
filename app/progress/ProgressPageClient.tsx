'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import AppLayout from '@/components/AppLayout'
import ProgressTab from '@/components/ProgressTab'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'

export default function ProgressPageClient() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is authenticated
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                if (parsedUser && !parsedUser.guest) {
                    setUser(parsedUser)
                } else {
                    router.push('/auth')
                }
            } catch (e) {
                router.push('/auth')
            }
        } else {
            router.push('/auth')
        }
        setLoading(false)
    }, [router])

    const handleSignOut = () => {
        localStorage.removeItem('user')
        setUser(null)
        router.push('/auth')
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (!user) {
        return null
    }

    return (
        <AppLayout
            user={user}
            onSignOut={handleSignOut}
            activeTab="progress"
            onTabChange={() => { }}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Progress Dashboard
                </h1>
                <ProgressTab />
            </div>
        </AppLayout>
    )
}
